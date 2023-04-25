export interface GifCategory {
  _id: string;
  name: string;
  img: string;
  sortOrder: number;
}

export interface Gif {
  _id: string;
  category?: string;
  sortOrder: number;
  gif: string;
  img: string;
}

export interface GifUrl {
  url: string;
  staticUrl: string;
}
