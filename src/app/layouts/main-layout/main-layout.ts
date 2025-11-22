import { Component, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DrawerModule } from 'primeng/drawer';
import { Settings } from '../../components/settings/settings';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-main-layout',
  imports: [
    ButtonModule,
    TranslocoModule,
    MenubarModule,
    RouterModule,
    DrawerModule,
    Settings,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  route = inject(ActivatedRoute);
  router = inject(Router);

  urlQuery = toSignal(this.route.queryParams, {
    initialValue: {
      settings: undefined,
    },
  });

  settingsIsOpen = computed(() => this.urlQuery().settings === 'true');

  toggleSettings(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { settings: _, ...rest } = this.urlQuery();
    const queryParams = this.settingsIsOpen()
      ? { ...rest }
      : { ...this.urlQuery(), settings: 'true' };
    this.router.navigate(['/'], { queryParams });
  }
}
