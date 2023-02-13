import { useNavigate } from "react-router-dom";

interface BtnCreatePostProps {
  isNestedPage: boolean;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isNestedPage,
}) => {
    const navigate = useNavigate()

  const onClickBtn = () => {
    if (isNestedPage) {
        navigate("/compose-chirp");
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
