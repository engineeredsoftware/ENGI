export interface Screenshot {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  type?: string;
  category?: string;
  text?: string;
  width?: number;
  height?: number;
  stretch?: boolean;
  revealingSoon?: boolean;
}
