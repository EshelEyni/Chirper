import { useNavigate } from "react-router-dom";

interface BtnCreatePostProps {
  isLinkToNestedPage: boolean;
  isDisabled: boolean;
  onAddPost?: () => void;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isLinkToNestedPage,
  isDisabled,
  onAddPost = null,
}) => {
  const navigate = useNavigate();

  const onClickBtn = () => {
    if (isLinkToNestedPage) {
      navigate("/compose");
    } else {
      if (isDisabled) return;
      onAddPost && onAddPost();
    }
  };

  return (
    <button
      className={"btn-create-post" + (!isLinkToNestedPage && isDisabled ? " disabled" : "")}
      onClick={onClickBtn}
    >
      Chirp
    </button>
  );
};
