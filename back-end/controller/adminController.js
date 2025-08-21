import User from "../models/User.js";
import Upload from "../models/Upload.js";
import Analysis from "../models/Analysis.js";
import Download from "../models/Download.js";

// 📌 Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get activity summary
export const getSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await Upload.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    const totalDownloads = await Download.countDocuments();

    res.json({
      totalUsers,
      totalUploads,
      totalAnalyses,
      totalDownloads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
