import { Component, inject } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OpenaiFetch } from 'openai-fetch';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-videos-list',
  imports: [
    TranslocoModule,
    FileUploadModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './videos-list.html',
  providers: [MessageService],
})
export class VideosList {
  videos: File[] = [];
  transcriptions: {
    video: string;
    text: string;
  }[] = [];

  private ffmpeg?: FFmpeg;

  loading = false;

  private readonly translocoService = inject(TranslocoService);
  private readonly messageService = inject(MessageService);
  private openai?: OpenaiFetch;

  constructor() {
    this.checkApiKey();
  }

  onUpload(event: FileUploadEvent) {
    if (event.files) {
      this.videos.push(...event.files);
    }
  }

  videoTrackBy(index: number, video: File) {
    return video.name;
  }

  private checkApiKey() {
    if (!environment.apiKey) {
      this.messageService.add({
        severity: 'error',
        summary: this.translocoService.translate('videosList.error'),
        detail: this.translocoService.translate('videosList.noApiKey'),
      });
      return;
    }
    this.openai = new OpenaiFetch({
      apiKey: environment.apiKey,
    });
  }

  private async getFFmpeg() {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        ),
      });
    }
    return this.ffmpeg;
  }

  async transcribe() {
    if (this.videos.length === 0 || this.loading) {
      return;
    }
    this.loading = true;
    try {
      const ffmpeg = await this.getFFmpeg();
      for (const video of this.videos) {
        const output = `${video.name}.mp3`;
        try {
          await ffmpeg.writeFile(
            video.name,
            new Uint8Array(await video.arrayBuffer())
          );
          await ffmpeg.exec(['-i', video.name, output]);
          const data = await ffmpeg.readFile(output);
          const audio = new File([data], output, { type: 'audio/mp3' });

          const { text } = await this.openai!.audio.transcribe({
            file: audio,
            model: 'whisper-1',
          });

          this.transcriptions.push({
            video: video.name,
            text,
          });
        } finally {
          try {
            await ffmpeg.deleteFile(video.name);
            await ffmpeg.deleteFile(output);
          } catch (e) {
            console.error('Failed to cleanup files', e);
          }
        }
      }
      this.messageService.add({
        severity: 'success',
        summary: this.translocoService.translate('videosList.success'),
        detail: this.translocoService.translate('videosList.transcribed'),
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: this.translocoService.translate('videosList.error'),
        detail: err.message,
      });
    } finally {
      this.loading = false;
    }
  }
}
