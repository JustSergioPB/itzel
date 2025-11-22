import { TestBed } from '@angular/core/testing';

import { AudioTool } from './audio.tool';

describe('AudioTool', () => {
  let service: AudioTool;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioTool);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
