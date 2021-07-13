import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  getGHJoin,
  postGHJoin,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { publicOnlyMiddleWare, uploadFiles } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter
  .route("/join")
  .all(publicOnlyMiddleWare)
  .get(getJoin)
  .post(uploadFiles.single("avatar"), postJoin);
rootRouter
  .route("/join/github")
  .all(publicOnlyMiddleWare)
  .get(getGHJoin)
  .post(uploadFiles.single("avatar"), postGHJoin);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleWare)
  .get(getLogin)
  .post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;
