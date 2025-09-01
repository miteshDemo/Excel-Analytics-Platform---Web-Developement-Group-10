import User from "../models/User.js";
import Upload from "../models/Upload.js";
import Analysis from "../models/Analysis.js";
import Download from "../models/Download.js";
import bcrypt from "bcryptjs";

/**
 * Get all users with their stats
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalUploads, totalAnalyses, totalDownloads] = await Promise.all([
          Upload.countDocuments({ user: user._id }),
          Analysis.countDocuments({ userId: user._id }),
          Download.countDocuments({ user: user._id }),
        ]);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          totalUploads,
          totalAnalyses,
          totalDownloads,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [totalUploads, totalAnalyses, totalDownloads] = await Promise.all([
      Upload.countDocuments({ user: user._id }),
      Analysis.countDocuments({ userId: user._id }),
      Download.countDocuments({ user: user._id }),
    ]);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalUploads,
      totalAnalyses,
      totalDownloads,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update user
 */
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
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete user and related data
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    await Upload.deleteMany({ user: user._id });
    await Analysis.deleteMany({ userId: user._id });
    await Download.deleteMany({ user: user._id });

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Dashboard summary
 */
export const getSummary = async (req, res) => {
  try {
    const [totalUsers, totalUploads, totalAnalyses, totalDownloads] = await Promise.all([
      User.countDocuments(),
      Upload.countDocuments(),
      Analysis.countDocuments(),
      Download.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalUploads,
      totalAnalyses,
      totalDownloads,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create new user/admin
 */
export const createUserOrAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Restrict Admin creation to Super Admin
    if (role === "admin" && req.user?.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can create Admins" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    res.status(201).json({ message: "User/Admin created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user/admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};
