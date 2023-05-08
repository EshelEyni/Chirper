export interface GifCategory {
  id: string;
  name: string;
  imgUrl: string;
  sortOrder: number;
}

export interface Gif {
  id?: string;
  url: string;
  staticUrl: string;
  description: string;
}
