const express = require("express");
const router = express.Router();
const { getTreks, createTrek } = require("../controllers/trekController");

// Route to get all treks
router.get("/", getTreks);

// Route to create a new trek
router.post("/", createTrek);

module.exports = router;
