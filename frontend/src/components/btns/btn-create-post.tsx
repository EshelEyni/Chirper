import { useNavigate } from "react-router-dom";

interface BtnCreatePostProps {
  isLinkToNestedPage: boolean;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isLinkToNestedPage,
}) => {
  const navigate = useNavigate();

  const onClickBtn = () => {
    if (isLinkToNestedPage) {
      navigate( "/compose");
      // do something
    } else {
      // do something else
    }
  };

  return (
    <button className="btn-create-post" onClick={onClickBtn}>
      Chirp
    </button>
  );
};
