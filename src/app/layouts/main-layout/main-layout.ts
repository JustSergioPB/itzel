import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [ButtonModule, TranslocoModule, MenubarModule, RouterModule],
  templateUrl: './main-layout.html',
})
export class MainLayout {}
