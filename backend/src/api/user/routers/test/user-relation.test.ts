/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "../user-relation.router";
import { errorHandler } from "../../../../services/error/error.service";
import userRelationService from "../../services/user-relation/user-relation.service";
import {
  createTestUser,
  getLoginTokenStrForTest,
} from "../../../../services/test/test-util.service";
import { connectToTestDB, disconnectFromTestDB } from "../../../../services/test/test-db.service";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { UserRelationModel } from "../../models/user-relation/user-relation.model";
import cookieParser from "cookie-parser";
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { PostModel } from "../../../post/models/post/post.model";
import setupAsyncLocalStorage from "../../../../middlewares/setupAls/setupAls.middleware";
import { PostStatsModel } from "../../../post/models/post-stats/post-stats.model";
import mongoose from "mongoose";
import { assertPost, assertUser } from "../../../../services/test/test-assertion.service";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

const mockedPostID = "64dd30f4937431fdad0f6d91";
const mockedUserID = "64dd30f4937431fdad0f6d92";

xdescribe("User Router: User Relation", () => {
  let testLoggedInUser: User, validUser: User, token: string, testPost: Post;

  async function createAndSetTestLoggedInUserAndToken({ isAdmin = false } = {}) {
    testLoggedInUser = (await createTestUser({ id: mockedUserID, isAdmin })) as User;
    token = getLoginTokenStrForTest(testLoggedInUser.id);
  }

  async function createTestPost() {
    await PostModel.findByIdAndDelete(mockedPostID);
    testPost = (
      await PostModel.create({
        _id: mockedPostID,
        text: "User Router Post",
        createdById: validUser.id,
      })
    ).toObject() as unknown as Post;

    return testPost;
  }

  async function createTestFollowingFromPost() {
    const fromUserId = testLoggedInUser.id;
    const toUserId = validUser.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    await UserRelationModel.create([{ fromUserId, toUserId, kind: "Follow" }], { session });
    await PostStatsModel.findOneAndUpdate(
      { postId: testPost.id, userId: fromUserId },
      { isFollowedFromPost: true },
      { session, upsert: true }
    );
    await session.commitTransaction();
  }

  beforeAll(async () => {
    // Using a remote DB for testing transactions
    await connectToTestDB({ isRemoteDB: true });
    validUser = await createTestUser({});
  });

  afterAll(async () => {
    // await PostModel.deleteMany({});
    await disconnectFromTestDB();
  });

  describe("POST /:id/follow", () => {
    beforeEach(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should return 200 when following is added", async () => {
      const spy = jest.spyOn(userRelationService, "add");
      const res = await request(app).post(`/${validUser.id}/follow`).set("Cookie", [token]);
      const followingLinkage = await UserRelationModel.findOne({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Follow",
      });

      expect(followingLinkage).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return 200 and return the updated users data when following is added", async () => {
      const res = await request(app).post(`/${validUser.id}/follow`).set("Cookie", [token]);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, targetUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(targetUser.id).toEqual(validUser.id);
      expect(targetUser.isFollowing).toEqual(true);
      expect(loggedInUser.followingCount).toEqual(testLoggedInUser.followingCount + 1);
      expect(targetUser.followersCount).toEqual(validUser.followersCount + 1);
    });
  });

  describe("POST /:userId/follow/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await UserRelationModel.deleteMany({});
    });

    it("should successfully add a following from a post", async () => {
      await createTestPost();
      const spy = jest.spyOn(userRelationService, "add");

      const res = await request(app)
        .post(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return a post with user.isFollowing after a succesfull request", async () => {
      await createTestPost();
      const res = await request(app)
        .post(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;

      expect(user.followersCount).toEqual(validUser.followersCount + 1);
      expect(user.isFollowing).toEqual(true);
    });
  });

  describe("DELETE /:id/follow", () => {
    beforeAll(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterAll(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove a following", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Follow",
      });
      const spy = jest.spyOn(userRelationService, "remove");
      const res = await request(app).delete(`/${validUser.id}/follow`).set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should successfully remove a following and return the updated users", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Follow",
      });
      const res = await request(app).delete(`/${validUser.id}/follow`).set("Cookie", [token]);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, targetUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(targetUser.id).toEqual(validUser.id);
      expect(targetUser.isFollowing).toEqual(false);
      expect(loggedInUser.followingCount).toEqual(0);
      expect(targetUser.followersCount).toEqual(0);
    });
  });

  describe("DELETE /:userId/follow/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove following from post", async () => {
      await createTestPost();
      await createTestFollowingFromPost();

      const spy = jest.spyOn(userRelationService, "remove");
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return a post with updated user after a succesfull request", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount);
      expect(user.followersCount).toEqual(validUser.followersCount);
      expect(user.isFollowing).toEqual(false);
    });
  });

  describe("POST /:id/mute", () => {
    beforeEach(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should return 200 when mute is added", async () => {
      const spy = jest.spyOn(userRelationService, "add");
      const res = await request(app).post(`/${validUser.id}/mute`).set("Cookie", [token]);
      const userRelation = await UserRelationModel.findOne({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Mute",
      });

      expect(userRelation).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return 200 and return the updated users data when mute is added", async () => {
      const res = await request(app).post(`/${validUser.id}/mute`).set("Cookie", [token]);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, targetUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(targetUser.id).toEqual(validUser.id);
      expect(targetUser.isMuted).toEqual(true);
    });
  });

  describe("POST /:userId/mute/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await UserRelationModel.deleteMany({});
    });

    it("should successfully add a mute from a post", async () => {
      await createTestPost();

      const spy = jest.spyOn(userRelationService, "add");
      const res = await request(app)
        .post(`/${validUser.id}/mute/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return a post with user.isMuted is true after a succesfull request", async () => {
      await createTestPost();

      const spy = jest.spyOn(userRelationService, "add");

      const res = await request(app)
        .post(`/${validUser.id}/mute/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;
      expect(user.isMuted).toEqual(true);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("DELETE /:id/mute", () => {
    beforeAll(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterAll(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove a mute", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Mute",
      });

      const spy = jest.spyOn(userRelationService, "remove");

      const res = await request(app).delete(`/${validUser.id}/mute`).set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should successfully remove a mute and return the updated users", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Mute",
      });

      const res = await request(app).delete(`/${validUser.id}/mute`).set("Cookie", [token]);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, targetUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(targetUser.id).toEqual(validUser.id);
      expect(targetUser.isMuted).toEqual(false);
    });
  });

  describe("DELETE /:userId/mute/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove mute from post", async () => {
      await createTestPost();
      await createTestFollowingFromPost();

      const spy = jest.spyOn(userRelationService, "remove");
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return a post with user.isMuted is false after a succesfull request", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;
      expect(user.isMuted).toEqual(false);
    });
  });

  describe("POST /:id/block", () => {
    beforeEach(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should return 200 and the updated users data when block is added", async () => {
      const res = await request(app).post(`/${validUser.id}/block`).set("Cookie", [token]);
      const userRelation = await UserRelationModel.findOne({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Block",
      });

      expect(userRelation).toBeTruthy();

      expect(res.statusCode).toEqual(200);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, targetUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(targetUser.id).toEqual(validUser.id);
      expect(targetUser.isBlocked).toEqual(true);
    });
  });

  describe("POST /:userId/block/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await UserRelationModel.deleteMany({});
    });

    it("should successfully add a block from a post", async () => {
      await createTestPost();

      const res = await request(app)
        .post(`/${validUser.id}/block/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with loggedInUserActionState.isFollowedFromPost after a succesfull request", async () => {
      await createTestPost();

      const res = await request(app)
        .post(`/${validUser.id}/block/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;
      expect(user.isBlocked).toEqual(true);
    });
  });

  describe("DELETE /:id/block", () => {
    beforeAll(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterAll(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove a block", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Block",
      });
      const spy = jest.spyOn(userRelationService, "remove");
      const res = await request(app).delete(`/${validUser.id}/block`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("DELETE /:userId/block/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove block from post", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with !user.isBlocked after a succesfull request", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      const post = res.body.data as Post;
      assertPost(post);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount);
      expect(user.followersCount).toEqual(validUser.followersCount);
      expect(user.isBlocked).toEqual(false);
    });
  });
});
