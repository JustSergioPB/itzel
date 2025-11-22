import { Component, computed, effect, inject, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SettingsService } from '../../services/settings.service';
import { FormField } from '../form-field/form-field';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Button } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TranslocoModule,
    FormField,
    Button,
    PasswordModule,
  ],
  templateUrl: './settings.html',
})
export class Settings {
  service = inject(SettingsService);
  toastService = inject(MessageService);
  translationService = inject(TranslocoService);

  form = new FormGroup({
    aiKey: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submited = output();
  reseted = output();

  private aiKeyStatus = toSignal(this.form.controls.aiKey.valueChanges, { initialValue: null });

  aiKeyError = computed(() => {
    this.aiKeyStatus();

    return this.form.get('aiKey')?.errors?.['required'] && this.form.controls.aiKey.touched
      ? this.translationService.translate('generic.errors.requiredField')
      : undefined;
  });

  constructor() {
    effect(() => {
      const settings = this.service.settings();
      this.form.patchValue({ aiKey: settings.aiKey || '' });
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.service
        .update({ aiKey: this.form.value.aiKey! })
        .pipe(
          tap(() => {
            const message = this.translationService.translate('main.settings.saved');
            this.submited.emit();
            this.toastService.add({ severity: 'success', summary: message });
          }),
        )
        .subscribe();
    }
  }

  reset(): void {
    this.form.reset();
    this.reseted.emit();
  }
}
