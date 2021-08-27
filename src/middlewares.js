import multer from "multer";
import multers3 from "multer-s3";
import aws from "aws-sdk";

const isHeroku = process.env.NODE_ENV === "production";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  res.locals.siteName = "Wetube";
  res.locals.staticURL = isHeroku ? "" : "/";
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Logged In");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleWare = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Already Logged In");
    return res.redirect("/");
  }
};

const avatarUploader = multers3({
  s3: s3,
  bucket: "wetube-yoojm4718/uploads/avatar",
  acl: "public-read",
});

const videoUploader = multers3({
  s3: s3,
  bucket: "wetube-yoojm4718/uploads/video",
  acl: "public-read",
});

export const avatarUpload = multer({
  dest: "uploads/avatar",
  limits: { fileSize: 3000000 },
  storage: isHeroku ? avatarUploader : undefined,
});
export const videoUpload = multer({
  dest: "uploads/video",
  limits: { fileSize: 10000000 },
  storage: isHeroku ? videoUploader : undefined,
});
