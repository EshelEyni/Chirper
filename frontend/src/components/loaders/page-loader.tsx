import LogoImg from "../../assets/img/logo.png";

export const PageLoader = () => {
  return (
    <div className="page-loader">
        <span className="progress-bar"></span>
      <img src={LogoImg} alt="logo" />
    </div>
  );
};
