const Trek = require("../models/Trek");
const mongoose = require('mongoose'); // import once at the top

// Get all treks
const getTreks = async (req, res) => {
  console.log('Mongoose connection readyState:', mongoose.connection.readyState);
  try {
    const treks = await Trek.find();
    res.status(200).json(treks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new trek
const createTrek = async (req, res) => {
  const newTrek = new Trek(req.body);

  try {
    const savedTrek = await newTrek.save();
    res.status(201).json(savedTrek);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getTreks,
  createTrek,
};
