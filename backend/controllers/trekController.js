// controllers/trekController.js
const TrekPackage = require("../models/TrekPackage");
const mongoose = require("mongoose");

const toDiscountPercent = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || discountedPrice >= originalPrice) return null;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

const isOfferActiveNow = (trek, now = new Date()) => {
  if (!trek.has_offer) return false;
  if (trek.offer_valid_from && now < trek.offer_valid_from) return false;
  if (trek.offer_valid_to && now > trek.offer_valid_to) return false;
  return true;
};

const createTrek = async (req, res) => {
  try {
    const trekData = { ...req.body };
    delete trekData.overview;

    if (trekData.offer_type && !trekData.offer_title) {
      trekData.offer_title = trekData.offer_type;
    }
    if (trekData.offer_title && !trekData.offer_type) {
      trekData.offer_type = trekData.offer_title;
    }

    if (req.user && req.user._id) {
      trekData.createdBy = req.user._id;
    }

    const newTrek = new TrekPackage(trekData);
    await newTrek.save();

    res.status(201).json({
      message: "Trek package created successfully",
      trek: newTrek,
    });
  } catch (error) {
    console.error("Create Trek Error:", error.message);
    res.status(500).json({ message: "Server error while creating trek" });
  }
};

const getAllTreks = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    const filter = isAdmin ? {} : { is_active: true };

    const { type } = req.query;
    if (type === "destination") filter.is_optional = false;
    else if (type === "optional") filter.is_optional = true;

    const treks = await TrekPackage.find(filter).sort({ createdAt: -1 });
    const today = new Date();

    const updatedTreks = treks.map((trek) => {
      const t = trek.toObject();
      const offerActiveNow = isOfferActiveNow(trek, today);

      t.offer_type = trek.offer_type || trek.offer_title || null;
      t.offer_discount_percent = toDiscountPercent(trek.price_usd, trek.discounted_price_usd);
      t.offer_active_now = offerActiveNow;

      if (offerActiveNow) {
        t.original_price_gbp = trek.price_gbp || null;
        t.original_price_usd = trek.price_usd || null;
        t.price_gbp = trek.discounted_price_gbp || trek.price_gbp;
        t.price_usd = trek.discounted_price_usd || trek.price_usd;
      }

      return t;
    });

    res.status(200).json(updatedTreks);
  } catch (error) {
    console.error("Get All Treks Error:", error.message);
    res.status(500).json({ message: "Server error while fetching treks" });
  }
};

const getTrekById = async (req, res) => {
  const { id } = req.params;

  try {
    let trek = await TrekPackage.findOne({ slug: id });

    if (!trek && mongoose.Types.ObjectId.isValid(id)) {
      trek = await TrekPackage.findById(id);
    }

    if (!trek) {
      return res.status(404).json({ message: "Trek not found" });
    }

    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    if (!trek.is_active && !isAdmin) {
      return res.status(404).json({ message: "Trek not found" });
    }

    const today = new Date();
    const finalTrek = trek.toObject();
    const offerActiveNow = isOfferActiveNow(trek, today);

    finalTrek.offer_type = trek.offer_type || trek.offer_title || null;
    finalTrek.offer_discount_percent = toDiscountPercent(trek.price_usd, trek.discounted_price_usd);
    finalTrek.offer_active_now = offerActiveNow;

    if (offerActiveNow) {
      finalTrek.original_price_gbp = trek.price_gbp || null;
      finalTrek.original_price_usd = trek.price_usd || null;
      finalTrek.price_gbp = trek.discounted_price_gbp || trek.price_gbp;
      finalTrek.price_usd = trek.discounted_price_usd || trek.price_usd;
    }

    res.status(200).json(finalTrek);
  } catch (error) {
    console.error("Get Trek By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching trek" });
  }
};

const updateTrek = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }
  try {
    const payload = { ...req.body };
    delete payload.overview;

    if (payload.offer_type && !payload.offer_title) {
      payload.offer_title = payload.offer_type;
    }
    if (payload.offer_title && !payload.offer_type) {
      payload.offer_type = payload.offer_title;
    }

    if (payload.name && !payload.slug) {
      payload.slug = payload.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    const updatedTrek = await TrekPackage.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrek) {
      return res.status(404).json({ message: "Trek not found" });
    }

    res.status(200).json({
      message: "Trek updated successfully",
      trek: updatedTrek,
    });
  } catch (error) {
    console.error("Update Trek Error:", error.message);
    res.status(500).json({ message: "Server error while updating trek" });
  }
};

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
    res.status(200).json({ message: "Trek deleted successfully" });
  } catch (error) {
    console.error("Delete Trek Error:", error.message);
    res.status(500).json({ message: "Server error while deleting trek" });
  }
};

const getAvailability = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }
  try {
    const trek = await TrekPackage.findById(id).select("availability name");
    if (!trek) return res.status(404).json({ message: "Trek not found" });

    const sorted = (trek.availability || [])
      .slice()
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Get Availability Error:", error.message);
    res.status(500).json({ message: "Server error while fetching availability" });
  }
};

const addAvailability = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trek ID" });
  }
  try {
    const { start_date, end_date, status, note } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date and end_date are required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "start_date must be before end_date" });
    }

    const trek = await TrekPackage.findById(id);
    if (!trek) return res.status(404).json({ message: "Trek not found" });

    trek.availability.push({
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: status || "available",
      note: note || "",
    });

    await trek.save();

    const sorted = trek.availability
      .slice()
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    res.status(201).json({
      message: "Availability range added",
      availability: sorted,
    });
  } catch (error) {
    console.error("Add Availability Error:", error.message);
    res.status(500).json({ message: "Server error while adding availability" });
  }
};

const updateAvailability = async (req, res) => {
  const { id, availId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(availId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const trek = await TrekPackage.findById(id);
    if (!trek) return res.status(404).json({ message: "Trek not found" });

    const entry = trek.availability.id(availId);
    if (!entry) return res.status(404).json({ message: "Availability entry not found" });

    const { start_date, end_date, status, note } = req.body;

    if (start_date) entry.start_date = new Date(start_date);
    if (end_date) entry.end_date = new Date(end_date);
    if (status) entry.status = status;
    if (note !== undefined) entry.note = note;

    if (entry.start_date > entry.end_date) {
      return res.status(400).json({ message: "start_date must be before end_date" });
    }

    await trek.save();

    const sorted = trek.availability
      .slice()
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    res.status(200).json({
      message: "Availability updated",
      availability: sorted,
    });
  } catch (error) {
    console.error("Update Availability Error:", error.message);
    res.status(500).json({ message: "Server error while updating availability" });
  }
};

const deleteAvailability = async (req, res) => {
  const { id, availId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(availId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const trek = await TrekPackage.findById(id);
    if (!trek) return res.status(404).json({ message: "Trek not found" });

    const before = trek.availability.length;
    trek.availability = trek.availability.filter(
      (a) => a._id.toString() !== availId
    );

    if (trek.availability.length === before) {
      return res.status(404).json({ message: "Availability entry not found" });
    }

    await trek.save();

    res.status(200).json({
      message: "Availability entry deleted",
      availability: trek.availability,
    });
  } catch (error) {
    console.error("Delete Availability Error:", error.message);
    res.status(500).json({ message: "Server error while deleting availability" });
  }
};

module.exports = {
  createTrek,
  getAllTreks,
  getTrekById,
  updateTrek,
  deleteTrek,
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
};