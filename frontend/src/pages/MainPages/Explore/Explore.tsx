import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Logo } from "../../../components/App/Logo/Logo";

const ExplorePage = () => {
  const params = useParams();

  const [currHashtag, setCurrHashtag] = useState<string>("");

  useEffect(() => {
    const { hashtag } = params;
    if (hashtag) setCurrHashtag(hashtag);
  }, [params]);

  throw new Error("Error in ExplorePage.tsx: JSX element 'div' has no corresponding closing tag.");
  return (
    <div>
      <h1>Explore Page</h1>
      {currHashtag && <h2>{currHashtag}</h2>}
      <Logo />
      <Outlet />
    </div>
  );
};

export default ExplorePage;
