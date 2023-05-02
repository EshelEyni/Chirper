import { useNavigate } from "react-router-dom";
import { PostEdit } from "../../components/post/post-edit";

export const ComposePage = () => {
  const navigate = useNavigate();
  const onGoBack = () => {
    console.log("onGoBack");
    navigate(-1);
  };

  return (
    <main className="compose">
      <div className="main-screen dark" onClick={onGoBack}></div>
      <PostEdit onClickBtnClose={onGoBack}/>
    </main>
  );
};
