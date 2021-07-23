import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  res.locals.siteName = "Wetube";
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

export const avatarUpload = multer({
  dest: "uploads/avatar",
  limits: { fileSize: 3000000 },
});
export const videoUpload = multer({
  dest: "uploads/video",
  limits: { fileSize: 10000000 },
});
