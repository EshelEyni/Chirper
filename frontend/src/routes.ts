import { BookmarksPage } from "./pages/bookmarks";
import { ComposePage } from "./pages/compose";
import { ExplorePage } from "./pages/explore";
import { HomePage } from "./pages/home";
import { MessagesPage } from "./pages/messages";
import { NotificationsPage } from "./pages/notifications";
import { ProfileDetails } from "./pages/profile-details";

interface Route {
  path: string;
  component: () => JSX.Element;
}

const routes: Route[] = [
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
];

export default routes;
