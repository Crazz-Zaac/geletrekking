const Activity = require("../models/Activity");
const mongoose = require("mongoose");

const allowedFields = [
  "title",
  "slug",
  "category",
  "shortDescription",
  "fullDescription",
  "price",
  "currency",
  "duration",
  "maxAltitude",
  "difficultyLevel",
  "groupSizeMin",
  "groupSizeMax",
  "mainImage",
  "galleryImages",
  "metaTitle",
  "metaDescription",
  "videoUrl",
  "isFeatured",
  "isActive",
  "displayOrder",
  "itinerary",
  "includes",
  "excludes",
  "tags",
  "description",
  "date",
  "image",
  "isPublished",
];

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => item.toString().trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeItinerary = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => ({
      day: Number(item?.day) || index + 1,
      title: (item?.title || "").toString().trim(),
      description: (item?.description || "").toString().trim(),
    }))
    .filter((item) => item.title);
};

const mapLegacyFields = (payload) => {
  const mapped = { ...payload };

  if (!mapped.shortDescription && mapped.description) {
    mapped.shortDescription = mapped.description;
  }

  if (!mapped.fullDescription && mapped.description) {
    mapped.fullDescription = mapped.description;
  }

  if (!mapped.mainImage && mapped.image) {
    mapped.mainImage = mapped.image;
  }

  if (typeof mapped.isActive === "undefined" && typeof mapped.isPublished !== "undefined") {
    mapped.isActive = !!mapped.isPublished;
  }

  if (typeof mapped.isPublished === "undefined" && typeof mapped.isActive !== "undefined") {
    mapped.isPublished = !!mapped.isActive;
  }

  if (!mapped.slug && mapped.title) {
    mapped.slug = slugify(mapped.title);
  }

  mapped.galleryImages = normalizeArray(mapped.galleryImages);
  mapped.includes = normalizeArray(mapped.includes);
  mapped.excludes = normalizeArray(mapped.excludes);
  mapped.tags = normalizeArray(mapped.tags);
  mapped.itinerary = normalizeItinerary(mapped.itinerary);

  if (typeof mapped.price !== "undefined") mapped.price = Number(mapped.price) || 0;
  if (typeof mapped.groupSizeMin !== "undefined") mapped.groupSizeMin = Number(mapped.groupSizeMin) || 1;
  if (typeof mapped.groupSizeMax !== "undefined") mapped.groupSizeMax = Number(mapped.groupSizeMax) || 1;
  if (typeof mapped.displayOrder !== "undefined") mapped.displayOrder = Number(mapped.displayOrder) || 0;

  return mapped;
};

const pickAllowedFields = (payload) => {
  const picked = {};
  for (const key of allowedFields) {
    if (typeof payload[key] !== "undefined") {
      picked[key] = payload[key];
    }
  }
  return picked;
};

const activityResponse = (activityDoc) => {
  const activity = activityDoc.toObject ? activityDoc.toObject() : activityDoc;
  return {
    ...activity,
    shortDescription: activity.shortDescription || activity.description || "",
    fullDescription: activity.fullDescription || activity.description || "",
    mainImage: activity.mainImage || activity.image || null,
  };
};

// --------------------
// GET ALL (Public — published only)
// --------------------
const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(activities.map(activityResponse));
  } catch (error) {
    console.error("❌ Get All Activities Error:", error.message);
    res.status(500).json({ message: "Server error while fetching activities" });
  }
};

// --------------------
// GET ALL ADMIN (Admin — includes unpublished)
// --------------------
const getAllActivitiesAdmin = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(activities.map(activityResponse));
  } catch (error) {
    console.error("❌ Get All Activities Admin Error:", error.message);
    res.status(500).json({ message: "Server error while fetching activities" });
  }
};

// --------------------
// GET BY ID (Public)
// --------------------
const getActivityById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid activity ID" });
  }

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activityResponse(activity));
  } catch (error) {
    console.error("❌ Get Activity By ID Error:", error.message);
    res.status(500).json({ message: "Server error while fetching activity" });
  }
};

// --------------------
// CREATE (Admin/Superadmin only)
// --------------------
const createActivity = async (req, res) => {
  try {
    const mappedPayload = mapLegacyFields(pickAllowedFields(req.body || {}));

    if (!mappedPayload.title || !mappedPayload.shortDescription) {
      return res.status(400).json({ message: "Title and shortDescription are required" });
    }

    if (!mappedPayload.slug) {
      mappedPayload.slug = slugify(mappedPayload.title);
    }

    const existingSlug = await Activity.findOne({ slug: mappedPayload.slug }).select("_id");
    if (existingSlug) {
      return res.status(400).json({ message: "Activity slug already exists" });
    }

    const newActivity = new Activity(mappedPayload);

    await newActivity.save();

    res.status(201).json({
      message: "✅ Activity created successfully",
      activity: activityResponse(newActivity),
    });
  } catch (error) {
    console.error("❌ Create Activity Error:", error.message);
    res.status(500).json({ message: "Server error while creating activity" });
  }
};

// --------------------
// UPDATE (Admin/Superadmin only)
// --------------------
const updateActivity = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid activity ID" });
  }

  try {
    const mappedPayload = mapLegacyFields(pickAllowedFields(req.body || {}));

    if (mappedPayload.slug) {
      const duplicateSlug = await Activity.findOne({ slug: mappedPayload.slug, _id: { $ne: id } }).select("_id");
      if (duplicateSlug) {
        return res.status(400).json({ message: "Activity slug already exists" });
      }
    }

    const updatedActivity = await Activity.findByIdAndUpdate(id, mappedPayload, {
      new: true,
      runValidators: true,
    });

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({
      message: "✅ Activity updated successfully",
      activity: activityResponse(updatedActivity),
    });
  } catch (error) {
    console.error("❌ Update Activity Error:", error.message);
    res.status(500).json({ message: "Server error while updating activity" });
  }
};

// --------------------
// DELETE (Admin/Superadmin only)
// --------------------
const deleteActivity = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid activity ID" });
  }

  try {
    const deletedActivity = await Activity.findByIdAndDelete(id);
    if (!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "🗑️ Activity deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Activity Error:", error.message);
    res.status(500).json({ message: "Server error while deleting activity" });
  }
};

// --------------------
// EXPORTS
// --------------------
module.exports = {
  getAllActivities,
  getAllActivitiesAdmin,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};