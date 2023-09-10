import { BtnLink } from "../../components/Btns/BtnLink/BtnLink";
import "./PageNotFound.scss";

const PageNotFound = () => {
  return (
    <main>
      <div className="page-not-found-content-container">
        <p>Hmm...this page doesn’t exist. Try searching for something else.</p>
        <BtnLink path="/explore" title="Search" />
      </div>
    </main>
  );
};

export default PageNotFound;
