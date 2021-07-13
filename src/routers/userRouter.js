import express from "express";
import {
  edit,
  profile,
  logout,
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
  getEditPassword,
  postEditPassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleWare,
  uploadFiles,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(uploadFiles.single("avatar"), postEdit);
userRouter
  .route("/edit/password")
  .all(protectorMiddleware)
  .get(getEditPassword)
  .post(postEditPassword);
userRouter.get("/github/start", publicOnlyMiddleWare, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleWare, finishGithubLogin);
userRouter.get(":id", profile);

export default userRouter;
