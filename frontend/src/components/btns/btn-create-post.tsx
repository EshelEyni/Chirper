import { useNavigate } from "react-router-dom";

interface BtnCreatePostProps {
  isLinkToNestedPage: boolean;
  isValid: boolean;
  onAddPost?: () => void;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isLinkToNestedPage,
  isValid,
  onAddPost = null,
}) => {
  const navigate = useNavigate();

  const onClickBtn = () => {
    if (isLinkToNestedPage) {
      navigate("/compose");
    } else {
      if(!isValid) return;
      onAddPost && onAddPost();
    }
  };

  return (
    <button
      className={
        "btn-create-post" + (!isLinkToNestedPage && !isValid ? " invalid" : "")
      }
      onClick={onClickBtn}
    >
      Chirp
    </button>
  );
};
