const Activity = require("../models/Activity");
const mongoose = require("mongoose");

// --------------------
// GET ALL (Public — published only)
// --------------------
const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isPublished: true }).sort({ date: -1 });
    res.status(200).json(activities);
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
    const activities = await Activity.find().sort({ date: -1 });
    res.status(200).json(activities);
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
    res.status(200).json(activity);
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
    const { title, description, date, image, tags, isPublished } = req.body;

    const newActivity = new Activity({
      title,
      description,
      date,
      image:       image || null,
      tags:        tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await newActivity.save();

    res.status(201).json({
      message: "✅ Activity created successfully",
      activity: newActivity,
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
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({
      message: "✅ Activity updated successfully",
      activity: updatedActivity,
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