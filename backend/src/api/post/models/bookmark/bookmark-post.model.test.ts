import { connectToTestDB, disconnectFromTestDB } from "../../../../services/test-util.service";

describe("Bookmark Post Model", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });
});
