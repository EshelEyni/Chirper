import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

const ExplorePage = () => {
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
      <Outlet />
    </div>
  );
};

export default ExplorePage;
