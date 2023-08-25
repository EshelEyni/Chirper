import mongoose from "mongoose";
import { FollowerModel } from "./follower.model";
import { UserModel } from "../user.model";
import {
  connectToTestDB,
  createTestUser,
  deleteTestUser,
  getMongoId,
} from "../../../../services/test-util.service";
import { User } from "../../../../../../shared/interfaces/user.interface";

describe("FollowerModel", () => {
  // Assuming that users are required for testing
  let fromUser: User, toUser: User;

  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    fromUser = await createTestUser({ id: getMongoId() });
    toUser = await createTestUser({ id: getMongoId() });
  });

  afterEach(async () => {
    await FollowerModel.deleteMany({});
    await UserModel.deleteMany({ _id: { $in: [fromUser.id, toUser.id] } });
  });

  it("should create a follower document", async () => {
    const follower = new FollowerModel({
      fromUserId: fromUser.id,
      toUserId: toUser.id,
    });
    const savedFollower = await follower.save();
    expect(savedFollower).toBeDefined();
    expect(savedFollower.fromUserId.toString()).toEqual(fromUser.id.toString());
    expect(savedFollower.toUserId.toString()).toEqual(toUser.id.toString());
  });

  it("should not allow the same user to follow themselves", async () => {
    const follower = new FollowerModel({
      fromUserId: fromUser.id,
      toUserId: fromUser.id,
    });
    let error;
    try {
      await follower.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.toUserId.message).toBe("You can't follow yourself");
  });

  it("should throw an error if follower not found", async () => {
    const id = getMongoId();
    await deleteTestUser(id);

    const follower = new FollowerModel({
      fromUserId: id,
      toUserId: toUser.id,
    });

    let error;
    try {
      await follower.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Follower validation failed: fromUserId: Follower not found");
  });

  it("should throw an error if following not found", async () => {
    const id = getMongoId();
    await deleteTestUser(id);
    const follower = new FollowerModel({
      fromUserId: fromUser.id,
      toUserId: id,
    });

    let error;

    try {
      await follower.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe("Follower validation failed: toUserId: Following not found");
  });

  it("should not allow duplicate followers", async () => {
    const followerData = {
      fromUserId: fromUser.id,
      toUserId: toUser.id,
    };
    await FollowerModel.create(followerData);

    const follower = new FollowerModel(followerData);
    let error;
    try {
      await follower.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain("duplicate key error");
  });

  fit("should populate fromUser and toUser when query for a single follower", async () => {
    const follower = new FollowerModel({
      fromUserId: fromUser.id,
      toUserId: toUser.id,
    });
    const savedFollower = await follower.save();
    const populatedFollower = (await FollowerModel.findById(savedFollower._id)) as unknown as any;

    if (!populatedFollower) throw new Error("Follower not found");
    expect(populatedFollower.fromUser).toBeDefined();
    expect(populatedFollower.toUser).toBeDefined();
    expect(populatedFollower.fromUser._id.toString()).toEqual(fromUser.id.toString());
    expect(populatedFollower.toUser._id.toString()).toEqual(toUser.id.toString());
  });

  fit("should populate fromUser and toUser when query for multiple followers", async () => {
    const follower = new FollowerModel({
      fromUserId: fromUser.id,
      toUserId: toUser.id,
    });

    const savedFollower = await follower.save();
    const populatedFollowers = (await FollowerModel.find({
      _id: savedFollower._id,
    })) as unknown as any[];

    if (!populatedFollowers.length) throw new Error("Follower not found");

    expect(populatedFollowers.length).toEqual(1);
    expect(populatedFollowers[0].fromUser).toBeDefined();
    expect(populatedFollowers[0].toUser).toBeDefined();
    expect(populatedFollowers[0].fromUser._id.toString()).toEqual(fromUser.id.toString());
    expect(populatedFollowers[0].toUser._id.toString()).toEqual(toUser.id.toString());
  });
});
