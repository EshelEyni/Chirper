import { BrowserRouter } from 'react-router-dom';
import { SideBar } from './components/side-bar';

export default function Root(props) {
  console.log("props", props);
  return (
    <BrowserRouter>
      <SideBar></SideBar>
    </BrowserRouter>
  )
}
