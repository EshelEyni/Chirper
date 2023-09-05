/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertGif } from "../../../services/test/test-assertion.service";
import { connectToTestDB, disconnectFromTestDB } from "../../../services/test/test-db.service";
import { GifCategoryModel, GifModel } from "./gif.model";

describe("GifModel", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    const TEN_MINUTES = 1000 * 60 * 10;
    await GifModel.deleteMany({
      createdAt: { $gte: new Date(Date.now() - TEN_MINUTES) },
    });
    await disconnectFromTestDB();
  });

  describe("Gif Schema", () => {
    const validGifData = {
      url: "https://example.com/gif",
      staticUrl: "https://example.com/static",
      description: "An example gif",
      size: { width: 100, height: 100 },
      placeholderUrl: "https://example.com/placeholder",
      staticPlaceholderUrl: "https://example.com/static-placeholder",
      category: "Agree",
    };

    it("should create a valid gif", async () => {
      const gif = new GifModel(validGifData);
      const savedGif = await gif.save();
      expect(savedGif).toBeDefined();
      expect(savedGif.url).toEqual(validGifData.url);
      expect(savedGif.staticUrl).toEqual(validGifData.staticUrl);
      assertGif(savedGif as any);
      await GifModel.findByIdAndDelete(savedGif._id);
    });

    it.each(Object.keys(validGifData))("should not create a gif without a %s", async key => {
      const keyOfGifData = key as unknown as keyof typeof validGifData;

      const incompleteGifData = { ...validGifData, [keyOfGifData]: undefined };

      const gif = new GifModel(incompleteGifData);

      let error;
      try {
        await gif.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain(`Gif validation failed: ${key}:`);
    });

    it("should not create a gif with a category that does not exist", async () => {
      const gif = new GifModel({ ...validGifData, category: "Nonexistent" });
      let error;
      try {
        await gif.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain("is not a valid category");
    });

    it("should set the sortOrder to the number of gifs in the category", async () => {
      const categoryName = "Test";
      const testGifCategory = await GifCategoryModel.create({
        name: categoryName,
        imgUrl: "https://example.com/img",
      });

      const gif = new GifModel({ ...validGifData, category: testGifCategory.name });

      const savedGif = await gif.save();
      expect(savedGif.sortOrder).toEqual(0);

      const gif2 = new GifModel({ ...validGifData, category: testGifCategory.name });

      const savedGif2 = await gif2.save();
      expect(savedGif2.sortOrder).toEqual(1);

      await GifModel.deleteMany({ category: testGifCategory.name });
      await GifCategoryModel.findByIdAndDelete(testGifCategory._id);
    });
  });
});

describe("GifCategoryModel", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    const TEN_MINUTES = 1000 * 60 * 10;
    await GifCategoryModel.deleteMany({
      createdAt: { $gte: new Date(Date.now() - TEN_MINUTES) },
    });
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    const TEN_MINUTES = 1000 * 60 * 10;
    await GifCategoryModel.deleteMany({
      createdAt: { $gte: new Date(Date.now() - TEN_MINUTES) },
    });
  });

  const getUniqueName = () => {
    const ranNum = Math.floor(Math.random() * 1000);
    return "Test Category " + ranNum;
  };

  const imgUrl = "https://example.com/funny.gif";

  describe("Gif Category Schema", () => {
    it("should create a valid gif category", async () => {
      const gifCategoryData = { name: getUniqueName(), imgUrl };
      const gifCategory = new GifCategoryModel(gifCategoryData);
      const savedGifCategory = await gifCategory.save();
      expect(savedGifCategory).toBeDefined();
      expect(savedGifCategory.name).toEqual(gifCategoryData.name);
      expect(savedGifCategory.imgUrl).toEqual(gifCategoryData.imgUrl);
      expect(savedGifCategory.sortOrder).toEqual(43);
      await GifCategoryModel.findByIdAndDelete(savedGifCategory._id);
    });

    it("should not create a gif category without a name", async () => {
      const gifCategoryData = { name: undefined, imgUrl };

      const gifCategory = new GifCategoryModel({ ...gifCategoryData, name: undefined });
      let error;
      try {
        await gifCategory.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it("should not create a gif category without an image url", async () => {
      const gifCategoryData = { name: getUniqueName(), imgUrl: undefined };
      const gifCategory = new GifCategoryModel({ ...gifCategoryData, imgUrl: undefined });
      let error;
      try {
        await gifCategory.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.imgUrl).toBeDefined();
    });

    it("should auto-increment sortOrder on create", async () => {
      const gifCategoryData = { name: getUniqueName(), imgUrl };
      const firstGifCategory = new GifCategoryModel(gifCategoryData);
      const savedFirstGifCategory = await firstGifCategory.save();

      const secondGifCategory = new GifCategoryModel({
        ...gifCategoryData,
        name: "Second Category",
      });
      const savedSecondGifCategory = await secondGifCategory.save();

      expect(savedFirstGifCategory.sortOrder).toEqual(43);
      expect(savedSecondGifCategory.sortOrder).toEqual(44);

      await GifCategoryModel.deleteMany({
        name: { $in: [firstGifCategory.name, secondGifCategory.name] },
      });
    });

    it("should not allow duplicate category names", async () => {
      const gifCategoryData = { name: getUniqueName(), imgUrl };
      const firstGifCategory = new GifCategoryModel(gifCategoryData);
      await firstGifCategory.save();

      const secondGifCategory = new GifCategoryModel(gifCategoryData);
      let error;
      try {
        await secondGifCategory.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain("duplicate key error");
      await GifCategoryModel.findByIdAndDelete(firstGifCategory._id);
    });
  });
});
