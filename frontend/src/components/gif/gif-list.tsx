import { Gif } from "@giphy/react-components";

export const GifList: React.FC = () => {
  const catgerories = [
    {
      title: "agree",
      img: "https://media1.giphy.com/media/8YsjVmpIpEjNKlrL3D/giphy.gif?cid=40d877031acicx3qzcicw42yl9ft78qnwkz2dxiafxre2prd&rid=giphy.gif&ct=g",
    },
    // "applause",
    // "aww",
    // "dance",
    // "deal with it",
    // "dont not want",
    // "eww",
    // "eye roll",
    // "facepalm",
    // "fist bump",
    // "good luck",
    // "happy dance",
    // "hearts",
    // "high five",
    // "hug",
    // "idk",
    // "kiss",
    // "mic drop",
    // "no",
    // "OMG",
    // "oh snap",
    // "ok",
    // "oops",
    // "please",
    // "popcorn",
    // "SMH",
    // "scared",
    // "seriously",
    // "shocked",
    // "shrug",
    // "sigh",
    // "slow clap",
    // "sorry",
    // "thank you",
    // "thumbs down",
    // "thumbs up",
    // "want",
    // "win",
    // "wink",
    // "yolo",
    // "yawn",
    // "yes",
    // "you got this",
  ];

  return (
    <div className="gif-list">
      <div className="gif-list-item">
        <img src={catgerories[0].img} alt="" />
      </div>
    </div>
  );
};
