import { TestBed } from '@angular/core/testing';

import { AITool } from './ai.tool';

describe('AITool', () => {
  let service: AITool;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AITool);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
