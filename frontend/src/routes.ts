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
  onlyHomePage?: boolean;
}

const routes: Route[] = [
  {
    path: "home",
    component: HomePage,
  },
  {
    path: "post/:id",
    component: PostDetails,
  },
  {
    path: "explore/:hashtag?",
    component: ExplorePage,
  },
  {
    path: "bookmarks",
    component: BookmarksPage,
  },
  {
    path: "profile/:username?",
    component: ProfileDetails,
  },
  {
    path: "login",
    component: LoginPage,
  },
  {
    path: "signup",
    component: SignupPage,
  },
];

const nestedRoutes: Route[] = [
  {
    path: "post-schedule",
    component: PostSchedule,
    onlyHomePage: true,
  },
  {
    path: "post-location",
    component: PostLocation,
    onlyHomePage: true,
  },
  {
    path: "post-stats/:id",
    component: PostStatsPage,
  },
  {
    path: "compose",
    component: ComposePage,
  },
  {
    path: "display",
    component: DisplayPage,
  },
  {
    path: "chirper-circle",
    component: ChirperCirclePage,
  },
];

export { routes, nestedRoutes };
