import { Injectable, signal } from '@angular/core';
import { Settings as SettingProps } from '../types/settings.types';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _settings = signal<SettingProps>({ aiKey: null });
  readonly settings = this._settings.asReadonly();

  update(props: SettingProps): Observable<void> {
    localStorage.setItem('settings', JSON.stringify(props));
    this._settings.set(props);
    return of(void 0);
  }

  load(): void {
    const stored = localStorage.getItem('settings');
    if (stored) {
      // Triggers update in ALL components listening to 'settings'
      this._settings.set(JSON.parse(stored));
    }
  }

  isConfigured(): boolean {
    return this._settings().aiKey != null;
  }
}
