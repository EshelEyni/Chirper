import IGif from "@giphy/js-types/dist/gif";

export interface GifHeader {
  _id: string;
  name: string;
  gif: IGif;
  sortOrder: number;
}

// export interface GifFromDB {
//   _id: string;
//   category: string;
//   sortOrder: number;
//   gif: IGif;
// }
