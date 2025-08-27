import User from "../models/User.js";
import Upload from "../models/Upload.js";
import Analysis from "../models/Analysis.js";
import Download from "../models/Download.js";

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();


    await Upload.deleteMany({ user: user._id });
    await Analysis.deleteMany({ userId: user._id });
    await Download.deleteMany({ user: user._id });

    res.json({ message: "User and related data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
