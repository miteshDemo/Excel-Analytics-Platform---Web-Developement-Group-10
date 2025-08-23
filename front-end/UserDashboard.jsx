import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Paper,
  Divider,
  Fade,
  Popover,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Three.js imports
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data to simulate API calls. In a real application, these would be
// replaced by actual fetch requests to a backend server.
const MOCK_API = {
  // Simulates a file upload endpoint
  async uploadFile(file) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          _id: `file_${Date.now()}`,
          name: file.name,
        });
      }, 500);
    });
  },

  // Simulates fetching files from the database
  async getFiles() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Load files from localStorage to simulate persistence
        const storedFiles = localStorage.getItem("userFiles");
        resolve(storedFiles ? JSON.parse(storedFiles) : []);
      }, 500);
    });
  },

  // Simulates a file deletion endpoint
  async deleteFile(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedFiles = JSON.parse(localStorage.getItem("userFiles") || "[]");
        const newFiles = storedFiles.filter(file => file._id !== id);
        localStorage.setItem("userFiles", JSON.stringify(newFiles));
        resolve({ message: "File deleted" });
      }, 500);
    });
  },

  // Simulates a file download endpoint
  async downloadFile(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would fetch the file blob
        resolve(new Blob(["mock file content"], { type: "text/plain" }));
      }, 500);
    });
  },
};

export default function App() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");
  const [userRole, setUserRole] = useState("user");
  const [anchorEl, setAnchorEl] = useState(null);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);

  // Chart states
  const [chartOpen, setChartOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  // Load user info, files, AND history from localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("token", "mock-token");
    }

    setUserName(localStorage.getItem("name") || "John Doe");
    setUserEmail(localStorage.getItem("email") || "john.doe@example.com");
    setUserRole(localStorage.getItem("role") || "user");

    const fetchFilesAndHistory = async () => {
      try {
        const fileData = await MOCK_API.getFiles();
        setFiles(fileData);

        // Load history from localStorage
        const storedHistory = localStorage.getItem("analysisHistory");
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilesAndHistory();
  }, []);

  // Use a separate useEffect to save files to localStorage whenever the 'files' state changes.
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem("userFiles", JSON.stringify(files));
    }
  }, [files]);
  
  // New useEffect to save analysis history to localStorage whenever the 'history' state changes.
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("analysisHistory", JSON.stringify(history));
    }
  }, [history]);

  const getInitials = (name) =>
    !name
      ? "?"
      : name
          .trim()
          .split(" ")
          .map((p) => p[0]?.toUpperCase())
          .join("");

  const handleLogout = () => {
    setLoggingOut(true);
    setFadeOut(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.reload(); 
    }, 1500);
  };
  
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isFileAlreadyUploaded = files.some(
      (uploadedFile) => uploadedFile.name === file.name
    );

    if (isFileAlreadyUploaded) {
      setNotification({
        open: true,
        message: "This file is already uploaded.",
        severity: "warning",
      });
      return;
    }

    try {
      const savedFile = await MOCK_API.uploadFile(file);
      const uploadDate = new Date().toLocaleString();
      setFiles((prev) => [...prev, { ...savedFile, date: uploadDate }]);
      
      setNotification({
        open: true,
        message: `Uploaded ${file.name}`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: "Upload failed",
        severity: "error",
      });
    }
  };

  const handleDeleteFile = async (id) => {
    try {
      await MOCK_API.deleteFile(id);
      setFiles((prev) => prev.filter((file) => file._id !== id));
      setNotification({
        open: true,
        message: "File deleted successfully",
        severity: "warning",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: "Delete failed",
        severity: "error",
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await MOCK_API.downloadFile(fileId);
      setNotification({
        open: true,
        message: `Downloaded ${fileName}`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: "Download failed",
        severity: "error",
      });
    }
  };

  const handleAnalyzeFile = (file) => {
    const data = [
      { category: "A", value: Math.floor(Math.random() * 100) },
      { category: "B", value: Math.floor(Math.random() * 100) },
      { category: "C", value: Math.floor(Math.random() * 100) },
    ];
    setSelectedFileData(data);
    setXAxis("category");
    setYAxis("value");
    setChartOpen(true);

    const analysis = {
      file: file.name,
      date: new Date().toLocaleString(),
      type: "Descriptive Analysis",
    };
    setHistory((prev) => [...prev, analysis]);
    setNotification({
      open: true,
      message: `Analysis completed for ${file.name}`,
      severity: "info",
    });
  };

  return (
    <Fade in={!fadeOut} timeout={800}>
      <Box>
        {/* Topbar */}
        <AppBar position="static" color="success">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              User's Dashboard
            </Typography>
            <IconButton onClick={handleAvatarClick} color="inherit">
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                {getInitials(userName) || <PersonIcon />}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Avatar Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { borderRadius: 3, p: 2, width: 250 } }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 60,
                height: 60,
                fontSize: "1.5rem",
                mx: "auto",
                mb: 1,
              }}
            >
              {getInitials(userName)}
            </Avatar>
            <Typography
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              variant="h6"
            >
              {userName || "Unknown User"}
            </Typography>
            <Typography
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              variant="body2"
              color="textSecondary"
            >
              {userEmail || "No Email"}
            </Typography>
            {userRole && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: "block",
                  fontWeight: "bold",
                  fontFamily: "unset",
                  color: userRole === "admin" ? "darkred" : "darkgreen",
                }}
              >
                {userRole.toUpperCase()}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Button
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              fullWidth
            >
              Logout
            </Button>
          </Box>
        </Popover>

        {/* Main Content */}
        <Box sx={{ p: 3 }}>
          {loggingOut && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                gap: 1,
              }}
            >
              <CircularProgress size={20} color="error" />
              <Typography sx={{ fontWeight: "bold", fontFamily: "unset" }}>
                Logging out...
              </Typography>
            </Box>
          )}

          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", fontFamily: "unset" }}
            gutterBottom
          >
            Welcome, {userName || "User"}!
          </Typography>

          {/* Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset", color: "blue" }}
              gutterBottom
            >
              <UploadFileIcon /> UPLOAD ANY FILE
            </Typography>
            <Button
              variant="contained"
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              component="label"
              color="success"
            >
              Choose File
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Paper>

          {/* Uploaded Files Table */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              gutterBottom
            >
              <InsertChartIcon /> Uploaded Files
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ ml: 2 }}>Loading files...</Typography>
                </Box>
            ) : files.length === 0 ? (
              <Typography sx={{ fontWeight: "bold", fontFamily: "unset" }}>
                No files uploaded yet.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                        File Name
                      </th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                        Uploaded Date
                      </th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file._id}>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {file.name}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {file.date || "N/A"}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              mr: 1,
                              fontFamily: "unset",
                              fontWeight: "bold",
                            }}
                            onClick={() => handleAnalyzeFile(file)}
                          >
                            Analyze
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{
                              mr: 1,
                              fontWeight: "bold",
                              fontFamily: "unset",
                            }}
                            onClick={() => handleDownload(file._id, file.name)}
                          >
                            <DownloadIcon fontSize="small" /> Download
                          </Button>
                          <Button
                            sx={{ fontWeight: "bold", fontFamily: "unset" }}
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteFile(file._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Paper>

          {/* Chart Analysis */}
          {chartOpen && selectedFileData && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontFamily: "unset" }}
                gutterBottom
              >
                <InsertChartIcon /> Chart Analysis
              </Typography>
              <Box sx={{ mb: 2 }}>
                X-Axis:
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  style={{ marginRight: 20 }}
                >
                  {Object.keys(selectedFileData[0]).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                Y-Axis:
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                >
                  {Object.keys(selectedFileData[0]).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </Box>

              <Bar
                data={{
                  labels: selectedFileData.map((d) => d[xAxis]),
                  datasets: [
                    {
                      label: yAxis,
                      data: selectedFileData.map((d) => d[yAxis]),
                      backgroundColor: "rgba(53,162,235,0.5)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                }}
              />

              <Box sx={{ height: 300, mt: 3 }}>
                <Canvas>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  {selectedFileData.map((d, i) => (
                    <mesh key={i} position={[i * 2, d[yAxis] / 2, 0]}>
                      <boxGeometry args={[1, d[yAxis], 1]} />
                      <meshStandardMaterial color="orange" />
                    </mesh>
                  ))}
                  <OrbitControls />
                </Canvas>
              </Box>

              <Button
                variant="contained"
                sx={{ mt: 2, fontFamily: "unset", fontWeight: "bold" }}
                onClick={() => setChartOpen(false)}
              >
                Close Chart
              </Button>
            </Paper>
          )}

          {/* Analysis History */}
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset" }}
              gutterBottom
            >
              <HistoryIcon /> Analysis History
            </Typography>
            {history.length === 0 ? (
              <Typography sx={{ fontFamily: "unset" }}>
                No analysis history yet.
              </Typography>
            ) : (
              <ul>
                {history.map((h, i) => (
                  <li key={`${h.file}-${i}`}>
                    <Typography
                      sx={{ fontWeight: "bold", fontFamily: "unset" }}
                    >
                      {h.file} - {h.type}
                    </Typography>
                    <Typography
                      sx={{ fontWeight: "bold", fontFamily: "unset" }}
                      variant="caption"
                      color="textSecondary"
                    >
                      Date: {h.date}
                    </Typography>
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        </Box>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={notification.severity} variant="filled">
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}