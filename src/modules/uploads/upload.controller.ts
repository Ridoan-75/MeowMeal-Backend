import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file provided" });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "meowmeal" },
    (error, result) => {
      if (error || !result) {
        return res
          .status(500)
          .json({ success: false, message: "Upload failed" });
      }
      return res.status(200).json({
        success: true,
        message: "Uploaded successfully",
        data: { url: result.secure_url },
      });
    },
  );

  Readable.from(req.file.buffer).pipe(stream);
};
