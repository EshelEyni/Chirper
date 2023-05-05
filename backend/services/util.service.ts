import { Response } from "express";
export const utilService = {
  setJsendResponse,
};

function setJsendResponse(
  res: Response,
  resDetails: { status: string; statusCode: number; data?: any; message?: string }
) {
  const { status, statusCode, data, message } = resDetails;
  if (status === "success") {
    return res.status(statusCode).send({
      status,
      data,
    });
  } else if (status === "fail") {
    return res.status(statusCode).send({
      status,
      data,
    });
  } else if (status === "error") {
    return res.status(statusCode).send({
      status,
      message,
    });
  }
}
