import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new Error("No file provided");

  const stream = cloudinary.uploader.upload_stream(
    { folder: "meowmeal" },
    (error, result) => {
      if (error || !result) {
        return res.status(500).json({ success: false, message: "Upload failed" });
      }
      sendResponse(res, 200, true, "Uploaded successfully", {
        url: result.secure_url,
      });
    }
  );

  Readable.from(req.file.buffer).pipe(stream);
});