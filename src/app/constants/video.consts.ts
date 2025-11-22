import { VideoStatus } from '../types/video.types';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const VIDEO_SEVERITY_MAP: Record<VideoStatus, Severity> = {
  pending: 'contrast',
  procesing: 'warn',
  ready: 'success',
  error: 'danger',
};
