const TrekPackage = require("../models/TrekPackage");
const mongoose = require("mongoose");

// --------------------
// CONTROLLERS
// --------------------

// Get single trek by ID
const getTrekById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }

  try {
    const trek = await TrekPackage.findById(id);

    if (!trek || (!trek.is_active && !req.user?.isAdmin)) {
      return res.status(404).json({ message: "Trek not found" });
    }

    let finalTrek = trek.toObject();
    const today = new Date();
    if (trek.has_offer && trek.offer_valid_from && trek.offer_valid_to) {
      if (today >= trek.offer_valid_from && today <= trek.offer_valid_to) {
        finalTrek.price_gbp = trek.discounted_price_gbp || trek.price_gbp;
        finalTrek.price_usd = trek.discounted_price_usd || trek.price_usd;
      }
    }

    res.json(finalTrek);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// STUB FUNCTIONS (temporary placeholders)
const getAllTreks = async (req, res) => { res.send("getAllTreks works"); };
const createTrek = async (req, res) => { res.send("createTrek works"); };
const updateTrek = async (req, res) => { res.send("updateTrek works"); };
const deleteTrek = async (req, res) => { res.send("deleteTrek works"); };

module.exports = { getTrekById, getAllTreks, createTrek, updateTrek, deleteTrek };
