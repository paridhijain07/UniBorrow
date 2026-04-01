const express = require("express");

const { getHomeStats } = require("../../controllers/stats/stats-controller");

const router = express.Router();

router.get("/home", getHomeStats);

module.exports = router;

