export interface GifCategory {
  readonly id: string;
  name: string;
  imgUrl: string;
  sortOrder: number;
}

export interface Gif {
  id?: string;
  url: string;
  staticUrl: string;
  description: string;
  size: {
    height: number;
    width: number;
  };
  placeholderUrl: string;
  staticPlaceholderUrl: string;
}
