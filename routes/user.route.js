const express = require("express");
const User = require("../database/models/user.model");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Sign up route, used for creating new accounts
router.post("/signup", async (req, res) => {
  try {
    const user = new User({ ...req.body });
    const token = await user.generateAuthToken();

    // Creating a http only cookie, which is used for authorization
    res.cookie("jwt", token, {
      sameSite: "strict",
      path: "/",
      httpOnly: true,
    });

    res.status(201).send({
      success: true,
      message: "Successfully created an account",
      user: user.getPublicProfile(),
    });
  } catch (error) {
    const message = error.message;
    let errorMessage = "";
    console.log(error.message);
    // Checking for duplicates
    if (message.includes("username")) {
      errorMessage =
        "Opps, the username you have enter already exists, try a different one";
    } else if (message.includes("email")) {
      errorMessage =
        "Looks like you have an account associated with us. Please login in.";
    } else {
      errorMessage = "Opps, something went wrong, try again.";
    }

    res.status(400).send({
      success: false,
      message: errorMessage,
    });
  }
});

// Login route used to login existing users
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials({ ...req.body });
    const token = await user.generateAuthToken();

    // Creating a http only cookie, which is used for authorization
    res.cookie("jwt", token, {
      sameSite: "strict",
      path: "/",
      httpOnly: true,
    });

    res.status(200).send({
      success: true,
      message: "Successfully logged in.",
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
});

// Authenticating the http only cookie
router.get("/user", auth, async (req, res) => {
  const id = req.id;
  const user = await User.findById(id);
  if (user) {
    res.send({
      success: true,
      message: "Successfully Authenticated",
      user: user.getPublicProfile(),
    });
  } else {
    res.status(401).send({
      success: false,
      message: "Not authenticated",
    });
  }
});

router.get("/logout", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.id, {
    $pull: { tokens: { token: req.token } },
  });
  res.clearCookie("jwt").send({
    success: true,
    message: "Successfully logged out",
  });
});

module.exports = router;
