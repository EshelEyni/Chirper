import { BookmarksPage } from "./pages/bookmarks";
import { ExplorePage } from "./pages/explore";
import { HomePage } from "./pages/home";
import { MessagesPage } from "./pages/messages";
import { NotificationsPage } from "./pages/notifications";
import { ProfileDetails } from "./pages/profile-details";

const routes: { path: string, component: React.FC }[] = [
    { path: '/', component: HomePage },
    { path: 'explore', component: ExplorePage },
    { path: '/bookmarks', component: BookmarksPage },
    { path: '/messages', component: MessagesPage },
    { path: 'notifications', component: NotificationsPage },
    { path: 'profile/:id', component: ProfileDetails }
]

export default routes