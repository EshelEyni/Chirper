import { AnalyticsPage } from "./pages/main-pages/analytics";
import { BookmarksPage } from "./pages/main-pages/bookmarks";
import { ChirperCirclePage } from "./pages/secondary-pages/chirper-circle";
import { ComposePage } from "./pages/secondary-pages/compose";
import { DisplayPage } from "./pages/secondary-pages/display";
import { ExplorePage } from "./pages/main-pages/explore";
import { HomePage } from "./pages/main-pages/home";
import { MessagesPage } from "./pages/main-pages/messages";
import { NotificationsPage } from "./pages/main-pages/notifications";
import { ProfileDetails } from "./pages/main-pages/profile-details";

interface Route {
  path: string;
  component: () => JSX.Element;
}

export const routes: Route[] = [
  {
    path: "",
    component: HomePage,
  },
  {
    path: "explore",
    component: ExplorePage,
  },
  {
    path: "bookmarks",
    component: BookmarksPage,
  },
  {
    path: "messages",
    component: MessagesPage,
  },
  {
    path: "notifications",
    component: NotificationsPage,
  },
  {
    path: "profile/:id?",
    component: ProfileDetails,
  },
  {
    path: "analytics",
    component: AnalyticsPage,
  },
  {
    path: "post-schedule",
    component: HomePage,
  },
  {
    path: "post-location",
    component: HomePage,
  },
];

export const nestedRoutes: Route[] = [
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
