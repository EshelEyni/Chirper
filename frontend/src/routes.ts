import { AnalyticsPage } from "./pages/analytics";
import { BookmarksPage } from "./pages/bookmarks";
import { ChirperCirclePage } from "./pages/chirper-circle";
import { ComposePage } from "./pages/compose";
import { DisplayPage } from "./pages/display";
import { ExplorePage } from "./pages/explore";
import { HomePage } from "./pages/home";
import { MessagesPage } from "./pages/messages";
import { NotificationsPage } from "./pages/notifications";
import { ProfileDetails } from "./pages/profile-details";

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
