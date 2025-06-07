export type HandlePosition = 'left' | 'right' | 'top' | 'bottom';

export interface CustomHandle {
  type: 'source' | 'target';
  position: HandlePosition;
  id: string;
  className?: string;
  label?: string;
  description?: string;
  offsetY?: number; // Custom Y offset for positioning
  style?: React.CSSProperties; // Custom styles
}