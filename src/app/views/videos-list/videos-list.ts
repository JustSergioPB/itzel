import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-videos-list',
  imports: [TranslocoModule, FileUploadModule],
  templateUrl: './videos-list.html',
})
export class VideosList {
  videos: File[] = [];

  onUpload(event: FileUploadEvent) {
    if (event.files) {
      this.videos.push(...event.files);
    }
  }
}
