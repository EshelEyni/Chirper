interface UserImgProps {
  imgUrl: string;
  size?: number;
}

export const UserImg: React.FC<UserImgProps> = ({ imgUrl }) => {
  return (
    <div className="user-img-container">
      <img className="user-img" src={imgUrl} alt="profile-img" />
    </div>
  );
};
