import { inject, Injectable } from '@angular/core';
import { map, switchMap, tap, from, filter, merge } from 'rxjs';
import { Video } from '../types/video.types';
import { toSignal } from '@angular/core/rxjs-interop';
import * as VideoModel from '../models/video.model';
import { db, VideoSchema } from '../database/db';
import { liveQuery } from 'dexie';
import { AITool } from '../tools/ai.tool';
import { AudioTool } from '../tools/audio.tool';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  readonly videos = toSignal(
    from(liveQuery(() => db.videos.orderBy('publishedAt').toArray())).pipe(
      map((videos) => videos.map((v) => this.fromSchema(v))),
    ),
    { initialValue: [] },
  );

  private ai = inject(AITool);
  private audio = inject(AudioTool);

  proccess(input: File | File[]): void {
    const files = Array.isArray(input) ? input : [input];

    merge(
      ...files.map((file) =>
        from(db.videos.where({ name: file.name }).first()).pipe(
          filter((video) => !video),
          map(() =>
            VideoModel.create({ name: file.name, publishedAt: this.extractPublishedAt(file.name) }),
          ),
          tap((video) => db.videos.add(this.toSchema(video))),
          switchMap((video) =>
            this.audio.extract(file).pipe(map((audio) => [audio, video] as [File, Video])),
          ),
          switchMap(([audio, video]) =>
            this.ai
              .transcribe(audio)
              .pipe(map((transcript) => [transcript, video] as [string, Video])),
          ),
          map(([transcript, video]) => VideoModel.addTranscription(video, transcript)),
          tap((video) => db.videos.put(this.toSchema(video), video.id)),
          switchMap((video) =>
            this.ai
              .summarize(video.transcript)
              .pipe(map((summary) => [summary, video] as [string, Video])),
          ),
          map(([summary, video]) => VideoModel.addSummary(video, summary)),
          tap((video) => db.videos.put(this.toSchema(video), video.id)),
        ),
      ),
    ).subscribe();
  }

  private extractPublishedAt(name: string): Date | null {
    console.log(name);
    return new Date();
  }

  private toSchema({ createdAt, updatedAt, ...rest }: Video): VideoSchema {
    return {
      ...rest,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }

  private fromSchema({ createdAt, updatedAt, ...rest }: VideoSchema): Video {
    return {
      ...rest,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    };
  }
}
