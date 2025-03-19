export type HandlePosition = 'left' | 'right' | 'top' | 'bottom';

export interface CustomHandle {
  type: 'source' | 'target';
  position: HandlePosition;
  id: string;
  className?: string;
}