// controllers/trekController.js
const TrekPackage = require("../models/TrekPackage");
const mongoose = require("mongoose");

// --------------------
// CREATE (Admin/Superadmin only)
// --------------------
const createTrek = async (req, res) => {
  try {
    const trekData = req.body;

    // Optional: store who created it
    if (req.user && req.user._id) {
      trekData.createdBy = req.user._id;
    }

    const newTrek = new TrekPackage(trekData);
    await newTrek.save();

    res.status(201).json({
      message: "✅ Trek package created successfully",
      trek: newTrek,
    });
  } catch (error) {
    console.error("❌ Create Trek Error:", error.message);
    res.status(500).json({ message: "Server error while creating trek" });
  }
};

// --------------------
// GET ALL (Public)
// --------------------
const getAllTreks = async (req, res) => {
  try {
    // Public users → only show active treks
    const filter = req.user?.role ? {} : { is_active: true };

    const treks = await TrekPackage.find(filter).sort({ createdAt: -1 });

    // Apply active offer pricing if within date
    const today = new Date();
    const updatedTreks = treks.map((trek) => {
      const t = trek.toObject();
      if (trek.has_offer && trek.offer_valid_from && trek.offer_valid_to) {
        if (today >= trek.offer_valid_from && today <= trek.offer_valid_to) {
          t.price_gbp = trek.discounted_price_gbp || trek.price_gbp;
          t.price_usd = trek.discounted_price_usd || trek.price_usd;
        }
      }
      return t;
    });

    res.status(200).json(updatedTreks);
  } catch (error) {
    console.error("❌ Get All Treks Error:", error.message);
    res.status(500).json({ message: "Server error while fetching treks" });
  }
};

// --------------------
// GET BY ID (Public)
// --------------------
const getTrekById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }

  try {
    const trek = await TrekPackage.findById(id);

    if (!trek || (!trek.is_active && !req.user?.role)) {
      return res.status(404).json({ message: "Trek not found" });
    }

    const today = new Date();
    const finalTrek = trek.toObject();
    if (trek.has_offer && trek.offer_valid_from && trek.offer_valid_to) {
      if (today >= trek.offer_valid_from && today <= trek.offer_valid_to) {
        finalTrek.price_gbp = trek.discounted_price_gbp || trek.price_gbp;
        finalTrek.price_usd = trek.discounted_price_usd || trek.price_usd;
      }
    }

    res.status(200).json(finalTrek);
  } catch (error) {
    console.error("❌ Get Trek By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching trek" });
  }
};

// --------------------
// UPDATE (Admin/Superadmin only)
// --------------------
const updateTrek = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }

  try {
    const updatedTrek = await TrekPackage.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrek) {
      return res.status(404).json({ message: "Trek not found" });
    }

    res.status(200).json({
      message: "✅ Trek updated successfully",
      trek: updatedTrek,
    });
  } catch (error) {
    console.error("❌ Update Trek Error:", error.message);
    res.status(500).json({ message: "Server error while updating trek" });
  }
};

// --------------------
// DELETE (Admin/Superadmin only)
// --------------------
const deleteTrek = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }

  try {
    const deletedTrek = await TrekPackage.findByIdAndDelete(id);
    if (!deletedTrek) {
      return res.status(404).json({ message: "Trek not found" });
    }

    res.status(200).json({ message: "🗑️ Trek deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Trek Error:", error.message);
    res.status(500).json({ message: "Server error while deleting trek" });
  }
};

// --------------------
// EXPORTS
// --------------------
module.exports = {
  createTrek,
  getAllTreks,
  getTrekById,
  updateTrek,
  deleteTrek,
};