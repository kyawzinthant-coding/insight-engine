import { Request, Response, NextFunction } from "express";

export const pdfUploadFilesController = (req: Request, res: Response): any => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json("No Files were upload");
  }

  const files = req.files as Express.Multer.File[];

  console.log(files);

  const fileInfo = files.map((file) => ({
    filename: file.filename,
    path: file.path,
  }));

  res.status(200).json({
    message: `${files.length} files uploaded successfully!`,
    files: fileInfo,
  });
};
