import mongoose from "mongoose";
import express from "express";
import passport from "passport";
const { AuthController } = require("../../controllers");
const router = express.Router();
const User = mongoose.model("User");

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    User.findById(req.payload.id)
      .then(function(user) {
        if (!user) {
          return res.sendStatus(401);
        }
        return res.json({ user: user.toAuthJSON() });
      })
      .catch(next);
  }
);

router.put("/user", (req, res, next) => {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function() {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});

router.post("/login", AuthController.login);

router.post("/", (req, res, next) => {
  const user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user
    .save()
    .then(function() {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

module.exports = router;
