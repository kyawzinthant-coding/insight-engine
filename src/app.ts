import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import router from "./routes";
import cors from "cors";

export const app = express();

app
  .use(morgan("dev"))
  .use(helmet())
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cors());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

app.use(express.static("uploads"));

app.use(router);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({ message, error: errorCode });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});
