import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import WavEncoder from 'wav-encoder';

@Injectable({
  providedIn: 'root',
})
export class AudioTool {
  extract(file: File): Observable<File> {
    const audioContext = new AudioContext();
    return from(file.arrayBuffer()).pipe(
      switchMap((buffer) => audioContext.decodeAudioData(buffer)),
      switchMap((audioBuffer) => {
        const audioData = {
          sampleRate: audioBuffer.sampleRate,
          channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
            audioBuffer.getChannelData(i),
          ),
        };
        return from(WavEncoder.encode(audioData));
      }),
      map((wavBuffer) => {
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        return new File([blob], 'audio.wav', { type: 'audio/wav' });
      }),
    );
  }
}
