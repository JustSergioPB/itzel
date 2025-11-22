import { Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-form-field',
  imports: [MessageModule],
  templateUrl: './form-field.html',
})
export class FormField {
  label = input.required<string>();
  for = input.required<string>();
  error = input<string>();
}
