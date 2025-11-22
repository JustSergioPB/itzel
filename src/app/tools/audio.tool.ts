import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import toWav from 'audiobuffer-to-wav';

@Injectable({
  providedIn: 'root',
})
export class AudioTool {
  extract(file: File): Observable<File> {
    const audioContext = new AudioContext();
    return from(file.arrayBuffer()).pipe(
      switchMap((buffer) => audioContext.decodeAudioData(buffer)),
      map((audioBuffer) => {
        const wavBuffer = toWav(audioBuffer);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        return new File([blob], 'audio.wav', { type: 'audio/wav' });
      }),
    );
  }
}
