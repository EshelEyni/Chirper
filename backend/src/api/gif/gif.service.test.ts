import { gifService } from  './gif.service'
import { getCollection } from '../../services/db.service'
import { GiphyFetch } from '@giphy/js-fetch-api'
import fs from 'fs';

describe('getGifsBySearchTerm - getting from database', () => {
    const categories = [
        "Agree",
        "Applause",
        "Aww",
        "Dance",
        "Deal with it",
        "Do not want",
        "Eww",
        "Eye roll",
        "Facepalm",
        "Fist bump",
        "Good luck",
        "Happy dance",
        "Hearts",
        "High five",
        "Hug",
        "Idk",
        "Kiss",
        "Mic drop",
        "No",
        "OMG",
        "Oh snap",
        "Ok",
        "Oops",
        "Please",
        "Popcorn",
        "SMH",
        "Scared",
        "Seriously",
        "Shocked",
        "Shrug",
        "Sigh",
        "Slow clap",
        "Sorry",
        "Thank you",
        "Thumbs down",
        "Thumbs up",
        "Want",
        "Win",
        "Wink",
        "Yolo",
        "Yawn",
        "Yes",
        "You got this",
      ];
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    categories.forEach((category) => {
      it(`should get gifs from the database when searchTerm is "${category}"`, async () => {
        const mockDbResult = [
          {
            _id: '1',
            category: category,
            sortOrder: 0,
            gif: 'https://example.com/gif1.gif',
            img: 'https://example.com/img1.jpg',
            height: '200',
            width: '200',
          },
        ];
  
        (getCollection as jest.Mock).mockResolvedValue({
          find: () => ({
            toArray: () => Promise.resolve(mockDbResult),
          }),
        });
  
        const gifs = await gifService.getGifsBySearchTerm(category);
  
        expect(getCollection).toBeCalled();
        expect(gifs).toEqual(mockDbResult);
      });
    });
  });
  