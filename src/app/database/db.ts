import Dexie, { Table } from 'dexie';
import { Video } from '../types/video.types';

export type VideoSchema = Omit<Video, 'updatedAt' | 'createdAt'> & {
  updatedAt: string;
  createdAt: string;
};

export class AppDB extends Dexie {
  videos!: Table<VideoSchema, string>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      videos: 'id, name, createdAt, publishedAt',
    });
  }
}

export const db = new AppDB();
