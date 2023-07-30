import { BookmarksPage } from "./pages/MainPages/Bookmarks/Bookmarks";
import { ExplorePage } from "./pages/MainPages/Explore/Explore";
import { HomePage } from "./pages/MainPages/Home/Home";
import { LoginPage } from "./pages/MainPages/Login/Login";
import { PostDetails } from "./pages/MainPages/PostDetails/PostDetails";
import { ProfileDetails } from "./pages/MainPages/ProfileDetails/ProfileDetails";
import { SignupPage } from "./pages/MainPages/Signup/Signup";
import { ChirperCirclePage } from "./pages/NestedPages/ChirperCircle/ChirperCircle";
import { ComposePage } from "./pages/NestedPages/Compose/Compose";
import { DisplayPage } from "./pages/NestedPages/Display/Display";
import { PostLocation } from "./pages/NestedPages/PostLocation/PostLocation";
import { PostSchedule } from "./pages/NestedPages/PostScheduler/PostSchedule";
import { PostStatsPage } from "./pages/NestedPages/PostStats/PostStats";

export interface Route {
  path: string;
  component: () => JSX.Element;
  authRequired: boolean;
  homePageOnly?: boolean;
}

const routes: Route[] = [
  {
    path: "home",
    component: HomePage,
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
];

export { routes, nestedRoutes };
