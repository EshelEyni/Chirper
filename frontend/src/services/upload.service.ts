import { ChangeEvent } from "react";

export const uploadImg = async (
  ev: ChangeEvent<HTMLInputElement>
): Promise<string | undefined> => {
  const CLOUD_NAME = "dng9sfzqt";
  const UPLOAD_PRESET = "hoav12li";
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const FORM_DATA = new FormData();

  const img = ev.target.files![0];
  if (!img) return;
  FORM_DATA.append("file", img);
  FORM_DATA.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      body: FORM_DATA,
    });
    const { url } = await res.json();
    return url;
  } catch (err) {
    console.error("ERROR!", err);
  }
};
