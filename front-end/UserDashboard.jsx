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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserDashboard() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Chart states
  const [chartOpen, setChartOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  // Load user info + fetch files
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setUserName(localStorage.getItem("name") || "");
    setUserEmail(localStorage.getItem("email") || "");
    setUserRole(localStorage.getItem("role") || "");

    fetch("http://localhost:5000/api/files", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    setLoggingOut(true);
    setFadeOut(true);
    setTimeout(() => {
      localStorage.clear();
      navigate("/login", { replace: true });
    }, 1500);
  };

  const getInitials = (name) => (!name ? "?" : name.trim().split(" ").map((p) => p[0].toUpperCase()).join(""));
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // Upload file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const savedFile = await res.json();
      setFiles((prev) => [...prev, savedFile]);
      setNotification({ open: true, message: `Uploaded ${file.name}`, severity: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: "Upload failed", severity: "error" });
    }
  };

  // Delete file
  const handleDeleteFile = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/files/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setFiles((prev) => prev.filter((file) => file._id !== id));
      setNotification({ open: true, message: "File deleted successfully", severity: "warning" });
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  // Download file
  const handleDownload = async (fileId, fileName) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setNotification({ open: true, message: `Downloaded ${fileName}`, severity: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: "Download failed", severity: "error" });
    }
  };

  // Analyze file + chart
  const handleAnalyzeFile = (file) => {
    // Dummy data for chart (replace with parsed Excel/CSV for real)
    const data = [
      { category: "A", value: Math.floor(Math.random() * 100) },
      { category: "B", value: Math.floor(Math.random() * 100) },
      { category: "C", value: Math.floor(Math.random() * 100) },
    ];
    setSelectedFileData(data);
    setXAxis("category");
    setYAxis("value");
    setChartOpen(true);

    const analysis = { file: file.name, date: new Date().toLocaleString(), type: "Descriptive Analysis" };
    setHistory((prev) => [...prev, analysis]);
    setNotification({ open: true, message: `Analysis completed for ${file.name}`, severity: "info" });
  };

  return (
    <Fade in={!fadeOut} timeout={800}>
      <Box>
        {/* Topbar */}
        <AppBar position="static" color="success">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>User's Dashboard</Typography>
            <IconButton onClick={handleAvatarClick} color="inherit">
              <Avatar sx={{ bgcolor: "secondary.main" }}>{getInitials(userName) || <PersonIcon />}</Avatar>
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
            <Avatar sx={{ bgcolor: "secondary.main", width: 60, height: 60, fontSize: "1.5rem", mx: "auto", mb: 1 }}>{getInitials(userName)}</Avatar>
            <Typography variant="h6">{userName || "Unknown User"}</Typography>
            <Typography variant="body2" color="textSecondary">{userEmail || "No Email"}</Typography>
            {userRole && (
              <Typography variant="caption" sx={{ mt: 0.5, display: "block", fontWeight: "bold", color: userRole === "admin" ? "darkred" : "darkgreen" }}>
                {userRole.toUpperCase()}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </Box>
        </Popover>

        {/* Main Content */}
        <Box sx={{ p: 3 }}>
          {loggingOut && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2, gap: 1 }}>
              <CircularProgress size={20} color="error" />
              <Typography>Logging out...</Typography>
            </Box>
          )}

          <Typography variant="h4" gutterBottom>Welcome, {userName || "User"}!</Typography>

          {/* Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom><UploadFileIcon /> Upload Any File</Typography>
            <Button variant="contained" component="label" color="success">
              Choose File
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Paper>

          {/* Uploaded Files Table */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom><InsertChartIcon /> Uploaded Files</Typography>
            {files.length === 0 ? (
              <Typography>No files uploaded yet.</Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>File Name</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Uploaded Date</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file._id}>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{file.name}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{file.date || "N/A"}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                          <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleAnalyzeFile(file)}>
                            Analyze
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ mr: 1 }}
                            onClick={() => handleDownload(file._id, file.name)}
                          >
                            <DownloadIcon fontSize="small" /> Download
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteFile(file._id)}>
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
              <Typography variant="h6" gutterBottom><InsertChartIcon /> Chart Analysis</Typography>
              <Box sx={{ mb: 2 }}>
                X-Axis:
                <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} style={{ marginRight: 20 }}>
                  {Object.keys(selectedFileData[0]).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
                Y-Axis:
                <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                  {Object.keys(selectedFileData[0]).map((key) => (
                    <option key={key} value={key}>{key}</option>
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
                options={{ responsive: true, plugins: { legend: { position: "top" } } }}
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

              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setChartOpen(false)}>Close Chart</Button>
            </Paper>
          )}

          {/* Analysis History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom><HistoryIcon /> Analysis History</Typography>
            {history.length === 0 ? (
              <Typography>No analysis history yet.</Typography>
            ) : (
              <ul>
                {history.map((h, i) => (
                  <li key={`${h.file}-${i}`}>
                    <Typography sx={{ fontWeight: "bold" }}>{h.file} - {h.type}</Typography>
                    <Typography variant="caption" color="textSecondary">Date: {h.date}</Typography>
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
          <Alert severity={notification.severity} variant="filled">{notification.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
