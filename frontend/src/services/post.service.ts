import { Post } from "../models/post";

const posts: Post[] = [
  {
    _id: "1",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc.",
    createdAt: 168167876339,
    commentSum: 0,
    shares: 0,
    likes: 0,
    views: 0,
    user: {
      _id: 1,
      username: "user1",
      fullname: "User 1",
      imgUrl: "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    },
  },
  {
    _id: "2",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc.",
    createdAt: 1681677765116,
    commentSum: 0,
    shares: 0,
    likes: 0,
    views: 0,
    user: {
      _id: 2,
      username: "user2",
      fullname: "User 2",
      imgUrl: "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    },
  },
];

export const postService = {
  query,
  getById,
  remove,
  save,
};

async function query(): Promise<Post[] | void> {
return new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(posts);
    }, 1);
});
}

async function getById(postId: string) {
  const post = posts.find((post) => post._id === postId);
  return Promise.resolve(post);
}

async function remove(postId: string) {
  const idx = posts.findIndex((post) => post._id === postId);
  if (idx !== -1) posts.splice(idx, 1);
  return Promise.resolve();
}

async function save(post: Post) {
  if (post._id) {
    const idx = posts.findIndex((currPost) => currPost._id === post._id);
    posts.splice(idx, 1, post);
  } else {
    post._id = _makeId();
    posts.unshift(post);
  }
  return Promise.resolve(post);
}

function _makeId(length = 5) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}
