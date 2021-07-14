import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Create Account" });
};

export const postJoin = async (req, res) => {
  const { name, username, email, password, password_confirm, location } =
    req.body;
  const { file } = req;
  const pageTitle = "Create Account";
  if (password !== password_confirm) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      avatar: file ? file.path : null,
      name,
      username,
      email,
      password,
      location,
      passwordExists: true,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Create Account",
      errorMessage: error._message,
    });
  }
};

export const getGHJoin = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ id });
  return res.render("ghjoin", {
    pageTitle: "Create Account",
    user,
  });
};

export const postGHJoin = async (req, res) => {
  const {
    avatarValue,
    name,
    username,
    email,
    password,
    password_confirm,
    location,
    id,
  } = req.body;
  const { file } = req;
  const user = await User.findById(id);
  const pageTitle = "Create Account";
  if (password !== password_confirm) {
    return res.status(400).render("ghjoin", {
      pageTitle,
      errorMessage: "Password does not match.",
      user,
    });
  }
  try {
    user.avatar = file ? file.path : avatarValue;
    console.log(user.avatar);
    user.name = name;
    user.email = email;
    user.username = username;
    user.password = password;
    user.location = location;
    user.passwordExists = true;
    user.githubConnected = true;
    await user.save();
    req.session.loggedIn = true;
    req.session.user = user;
    console.log(req.session.user);
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("ghjoin", {
      pageTitle: "Create Account",
      errorMessage: error._message,
      user,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatar: userData.avatar_url ? userData.avatar_url : "",
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        location: userData.location ? userData.location : "",
      });
      console.log(user);
      return res.redirect(`/join/github?id=${user._id}`);
    } else if (!user.passwordExists) {
      user.avatar = userData.avatar_url ? userData.avatar_url : "";
      user.name = userData.name;
      user.username = userData.login;
      user.email = emailObj.email;
      user.location = userData.location ? userData.location : "";
      await user.save();
      return res.redirect(`/join/github?id=${user._id}`);
    } else {
      user.githubConnected = true;
      await user.save();
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  const fs = require("fs");
  let doesFileExist = true;
  if (!fs.existsSync(req.session.user.avatar)) {
    doesFileExist = false;
  }
  res.render("edit-profile", { pageTitle: "Edit Profile", doesFileExist });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatar },
    },
    body: { name, email, username, location },
    file,
  } = req;
  const sessionEmail = req.session.user.email;
  const sessionUsername = req.session.user.username;
  if (email !== sessionEmail || username !== sessionUsername) {
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken.",
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatar: file ? file.path : avatar,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getEditPassword = (req, res) => {
  return res.render("edit-password", { pageTitle: "Edit Password" });
};

export const postEditPassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("edit-password", {
      pageTitle: "Edit Password",
      errorMessage: "Old password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("edit-password", {
      pageTitle: "Edit Password",
      errorMessage: "Password does not match.",
    });
  }
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  // send notification
  return res.redirect("/");
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");

  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  return res.render("profile", { pageTitle: `${user.name} Profile`, user });
};
