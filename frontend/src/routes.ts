import { LazyExoticComponent, lazy, FC } from "react";

const Homepage = lazy(() => import("./pages/MainPages/Home/Home"));
const BookmarksPage = lazy(() => import("./pages/MainPages/Bookmarks/Bookmarks"));
const ExplorePage = lazy(() => import("./pages/MainPages/Explore/Explore"));
const LoginPage = lazy(() => import("./pages/MainPages/Login/Login"));
const PostDetails = lazy(() => import("./pages/MainPages/PostDetails/PostDetails"));
const ProfileDetails = lazy(() => import("./pages/MainPages/ProfileDetails/ProfileDetails"));
const SignupPage = lazy(() => import("./pages/MainPages/Signup/Signup"));
const ChirperCirclePage = lazy(() => import("./pages/NestedPages/ChirperCircle/ChirperCircle"));
const ComposePage = lazy(() => import("./pages/NestedPages/Compose/Compose"));
const DisplayPage = lazy(() => import("./pages/NestedPages/Display/Display"));
const PostLocation = lazy(() => import("./pages/NestedPages/PostLocation/PostLocation"));
const PostSchedule = lazy(() => import("./pages/NestedPages/PostScheduler/PostSchedule"));
const PostStatsPage = lazy(() => import("./pages/NestedPages/PostStats/PostStats"));
const PostImgPage = lazy(() => import("./pages/NestedPages/PostImg/PostImgPage"));

export interface Route {
  path: string;
  component: LazyExoticComponent<FC>;
  authRequired: boolean;
  homePageOnly?: boolean;
}

const routes: Route[] = [
  {
    path: "home",
    component: Homepage,
    authRequired: false,
  },
  {
    path: "post/:id",
    component: PostDetails,
    authRequired: false,
  },
  {
    path: "explore/:hashtag?",
    component: ExplorePage,
    authRequired: false,
  },
  {
    path: "bookmarks",
    component: BookmarksPage,
    authRequired: true,
  },
  {
    path: "profile/:username?",
    component: ProfileDetails,
    authRequired: false,
  },
  {
    path: "login",
    component: LoginPage,
    authRequired: false,
  },
  {
    path: "signup",
    component: SignupPage,
    authRequired: false,
  },
];

const nestedRoutes: Route[] = [
  {
    path: "post-schedule",
    component: PostSchedule,
    homePageOnly: true,
    authRequired: true,
  },
  {
    path: "post-location",
    component: PostLocation,
    homePageOnly: true,
    authRequired: true,
  },
  {
    path: "post-stats/:id",
    component: PostStatsPage,
    authRequired: false,
  },
  {
    path: "compose",
    component: ComposePage,
    authRequired: true,
  },
  {
    path: "display",
    component: DisplayPage,
    authRequired: true,
  },
  {
    path: "chirper-circle",
    component: ChirperCirclePage,
    authRequired: true,
  },
  {
    path: "post/:id/imgs/:idx",
    component: PostImgPage,
    authRequired: false,
  },
];

export { routes, nestedRoutes };
