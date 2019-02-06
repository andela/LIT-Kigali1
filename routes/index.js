import express from "express";
const router = express.Router();
import { passportStrategies } from "../middlewares";

router.use("/api/v1", require("./api"));

module.exports = router;
