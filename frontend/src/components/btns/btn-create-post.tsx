import { useNavigate } from "react-router-dom";

interface BtnCreatePostProps {
  isLinkToNestedPage: boolean;
  isValid: boolean;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isLinkToNestedPage,
  isValid,
}) => {
  const navigate = useNavigate();

  const onClickBtn = () => {
    if (isLinkToNestedPage) {
      navigate("/compose");
      // do something
    } else {
      // do something else
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
