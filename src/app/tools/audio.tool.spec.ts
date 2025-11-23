import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AudioTool } from './audio.tool';

describe('AudioTool', () => {
  let service: AudioTool;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(AudioTool);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
