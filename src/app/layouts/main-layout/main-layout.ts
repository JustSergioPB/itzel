import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-main-layout',
  imports: [ButtonModule, TranslocoModule],
  templateUrl: './main-layout.html',
})
export class MainLayout {

}
