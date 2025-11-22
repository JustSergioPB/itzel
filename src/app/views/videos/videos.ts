import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { EmptyList } from '../../components/empty-list/empty-list';
import { VideoService } from '../../services/video.service';
import { SettingsService } from '../../services/settings.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { VIDEO_SEVERITY_MAP } from '../../constants/video.consts';
import { Video } from '../../types/video.types';
import { TranslocoLocaleModule } from '@jsverse/transloco-locale';

@Component({
  selector: 'app-videos',
  imports: [
    TranslocoModule,
    FileUploadModule,
    ButtonModule,
    EmptyList,
    TableModule,
    TagModule,
    TranslocoLocaleModule,
  ],
  templateUrl: './videos.html',
})
export class Videos {
  service = inject(VideoService);
  settingsService = inject(SettingsService);

  router = inject(Router);

  onUpload(event: FileUploadEvent) {
    this.service.proccess(event.files);
  }

  openSettings(): void {
    this.router.navigate(['/'], { queryParams: { settings: 'true' } });
  }

  getSeverity(video: Video) {
    return VIDEO_SEVERITY_MAP[video.status];
  }
}
