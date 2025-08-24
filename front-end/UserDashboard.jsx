import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
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
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// A more visually appealing 3D Bar component with growth animation
function Bar3D({ position, height, color }) {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [targetHeight, setTargetHeight] = useState(height);
  const [currentHeight, setCurrentHeight] = useState(0.1);

  // Animate the bar's height from 0 to its target height
  useFrame(() => {
    if (ref.current) {
      if (currentHeight < targetHeight) {
        // Increment the current height smoothly
        setCurrentHeight(Math.min(currentHeight + 0.5, targetHeight));
      }
      // Update the scale of the mesh to reflect the current height
      ref.current.scale.set(1, currentHeight / 10, 1);
      // Adjust the position so the bar grows upward from the ground plane
      ref.current.position.set(position[0], (currentHeight / 10) / 2, position[2]);
    }
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : color} />
    </mesh>
  );
}

// Mock data to simulate API calls. In a real application, these would be
// replaced by actual fetch requests to a backend server.
const MOCK_API = {
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
  async getFiles() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedFiles = localStorage.getItem("userFiles");
        resolve(storedFiles ? JSON.parse(storedFiles) : []);
      }, 500);
    });
  },
  async deleteFile(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedFiles = JSON.parse(localStorage.getItem("userFiles") || "[]");
        const newFiles = storedFiles.filter((file) => file._id !== id);
        localStorage.setItem("userFiles", JSON.stringify(newFiles));
        resolve({ message: "File deleted" });
      }, 500);
    });
  },
  async downloadFile(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Blob(["mock file content"], { type: "text/plain" }));
      }, 500);
    });
  },
};

export default function App() {
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
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Load user info, files, and history from localStorage on initial render
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

  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem("userFiles", JSON.stringify(files));
    }
  }, [files]);

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

  // New function to delete history items
  const handleDeleteHistory = (index) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory.splice(index, 1);
      localStorage.setItem("analysisHistory", JSON.stringify(newHistory));
      return newHistory;
    });
    setNotification({
      open: true,
      message: "Analysis history item deleted.",
      severity: "info",
    });
  };

  // Now handles analysis without a prompt
  const handleAnalyzeFile = async (file) => {
    setAnalysisLoading(true);
    const prompt = `Generate JSON data for a bar chart with 5 categories and corresponding values. The values should be integers between 10 and 100. The JSON structure should be an array of objects, with each object having 'category' (string) and 'value' (number) keys.`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              "category": { "type": "STRING" },
              "value": { "type": "NUMBER" },
            },
            "propertyOrdering": ["category", "value"],
          },
        },
      },
    };

    const apiKey = ""; // Canvas will automatically provide the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let data;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        data = JSON.parse(jsonText);
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (err) {
      console.error("API call failed:", err);
      // Fallback to mock data if API call fails
      data = [
        { category: "A", value: Math.floor(Math.random() * 90) + 10 },
        { category: "B", value: Math.floor(Math.random() * 90) + 10 },
        { category: "C", value: Math.floor(Math.random() * 90) + 10 },
        { category: "D", value: Math.floor(Math.random() * 90) + 10 },
        { category: "E", value: Math.floor(Math.random() * 90) + 10 },
      ];
      setNotification({
        open: true,
        message: "Failed to generate AI analysis, using mock data.",
        severity: "error",
      });
    } finally {
      setAnalysisLoading(false);
    }
    
    if (data && data.length > 0) {
      setSelectedFileData(data);
      setXAxis(Object.keys(data[0])[0]);
      setYAxis(Object.keys(data[0])[1]);
      setChartOpen(true);
    
      const analysis = {
        file: file.name,
        date: new Date().toLocaleString(),
        type: "AI-Powered Analysis",
      };
      setHistory((prev) => [...prev, analysis]);
      setNotification({
        open: true,
        message: `Analysis completed for ${file.name}`,
        severity: "info",
      });
    } else {
      setNotification({
        open: true,
        message: "Analysis failed: No data generated.",
        severity: "error",
      });
    }
  };

  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 5,
                }}
              >
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
                      <th
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                      >
                        File Name
                      </th>
                      <th
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                      >
                        Uploaded Date
                      </th>
                      <th
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                      >
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
                            disabled={analysisLoading}
                          >
                            {analysisLoading ? <CircularProgress size={18} /> : "Analyze"}
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

          {/* Chart Analysis Section - Refactored for style */}
          {chartOpen && selectedFileData && (
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: "linear-gradient(45deg, #f3f4f6 30%, #e5e7eb 90%)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "unset",
                  color: "#4b5563",
                  mb: 2,
                }}
                gutterBottom
              >
                <InsertChartIcon /> Chart Analysis
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                {/* X-Axis Selector with MUI components */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>X-Axis</InputLabel>
                  <Select
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    label="X-Axis"
                  >
                    {Object.keys(selectedFileData[0]).map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Y-Axis Selector with MUI components */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Y-Axis</InputLabel>
                  <Select
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    label="Y-Axis"
                  >
                    {Object.keys(selectedFileData[0]).map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 2D Bar Chart */}
              <Box sx={{ mb: 3 }}>
                <Bar
                  data={{
                    labels: selectedFileData.map((d) => d[xAxis]),
                    datasets: [
                      {
                        label: yAxis,
                        data: selectedFileData.map((d) => d[yAxis]),
                        backgroundColor: chartColors,
                        borderColor: chartColors.map(c => c.replace('0.6', '1')),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: `2D Analysis of ${xAxis.toUpperCase()} vs ${yAxis.toUpperCase()}`,
                      },
                    },
                  }}
                />
              </Box>

              {/* 3D Visualization */}
              <Box sx={{ height: 400, mt: 3, borderRadius: 2, overflow: 'hidden' }}>
                <Canvas camera={{ position: [0, 20, 40], fov: 60 }} style={{ background: '#1c1c1c' }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 30, 10]} intensity={1} />
                  <pointLight position={[-10, 30, -10]} intensity={1} />
                  <spotLight
                    position={[10, 15, 10]}
                    angle={0.3}
                    penumbra={1}
                    castShadow
                  />

                  {/* The 3D Bars */}
                  {selectedFileData.map((d, i) => (
                    <Bar3D
                      key={i}
                      position={[i * 5 - (selectedFileData.length - 1) * 2.5, d[yAxis] / 2, 0]}
                      height={d[yAxis]}
                      color={chartColors[i % chartColors.length]}
                    />
                  ))}

                  {/* Ground Plane */}
                  <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#333" />
                  </mesh>

                  {/* Axis Helpers */}
                  <axesHelper args={[20]} />
                  <gridHelper args={[20, 20]} />

                  {/* Camera controls */}
                  <OrbitControls />
                </Canvas>
              </Box>

              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  fontFamily: "unset",
                  fontWeight: "bold",
                  borderRadius: 2,
                }}
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
                  <li key={`${h.file}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
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
                    </Box>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteHistory(i)} color="error">
                      <DeleteIcon />
                    </IconButton>
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
