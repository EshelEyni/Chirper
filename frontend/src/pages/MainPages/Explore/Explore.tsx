import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Logo } from "../../../components/Other/Logo/Logo";

export const ExplorePage = () => {
  const params = useParams();

  const [currHashtag, setCurrHashtag] = useState<string>("");

  useEffect(() => {
    const { hashtag } = params;
    if (hashtag) setCurrHashtag(hashtag);
  }, [params]);

  return (
    <div>
      <h1>Explore Page</h1>
      {currHashtag && <h2>{currHashtag}</h2>}
      <Logo />
      <Outlet />
    </div>
  );
};
