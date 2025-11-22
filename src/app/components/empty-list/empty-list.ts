import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-list',
  imports: [],
  templateUrl: './empty-list.html',
})
export class EmptyList {
  title = input.required<string>();
  description = input.required<string>();
}
