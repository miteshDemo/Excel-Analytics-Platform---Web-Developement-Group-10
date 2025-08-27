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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CloseIcon from "@mui/icons-material/Close";
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
import * as THREE from "three";
import { OpenAI } from "openai/client.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Bar3D({ position, height, color }) {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [targetHeight, setTargetHeight] = useState(height);
  const [currentHeight, setCurrentHeight] = useState(0.1);

  useFrame(() => {
    if (ref.current) {
      if (currentHeight < targetHeight) {
        setCurrentHeight(Math.min(currentHeight + 0.5, targetHeight));
      }

      ref.current.scale.set(1, currentHeight / 10, 1);

      ref.current.position.set(
        position[0],
        currentHeight / 10 / 2,
        position[2]
      );
    }
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "#4caf50" : color} />
    </mesh>
  );
}

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
        const storedFiles = JSON.parse(
          localStorage.getItem("userFiles") || "[]"
        );
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

  const [chartOpen, setChartOpen] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [summarizeLoading, setSummarizeLoading] = useState(false);

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

  const handleDownload = async (file) => {
    try {
      const fileContent =
        "This is the content of the downloaded file. It can be any data from your application.";
      const blob = new Blob([fileContent], { type: "text/plain" });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      setNotification({
        open: true,
        message: `Downloaded ${file.name} successfully`,
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

  const handleAnalyzeFile = async (file) => {
    setAnalysisLoading(true);
    const prompt = `Generate JSON data for a bar chart with 5 categories and corresponding values. The values should be integers between 10 and 100. The JSON structure should be an array of objects, with each object having 'category' (string) and 'value' (number) keys.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              value: { type: "NUMBER" },
            },
            propertyOrdering: ["category", "value"],
          },
        },
      },
    };

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let data;
    let retries = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    while (retries < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            data = JSON.parse(jsonText);
            break;
          } else {
            throw new Error("Invalid response from API");
          }
        } else {
          if (response.status === 429) {
            const delay = baseDelay * Math.pow(2, retries);
            console.warn(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
          } else {
            throw new Error(`API returned status code: ${response.status}`);
          }
        }
      } catch (err) {
        console.error("API call failed:", err);
        const delay = baseDelay * Math.pow(2, retries);
        console.warn(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
      }
    }
    setAnalysisLoading(false);

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
      data = [
        { category: "A", value: Math.floor(Math.random() * 90) + 10 },
        { category: "B", value: Math.floor(Math.random() * 90) + 10 },
        { category: "C", value: Math.floor(Math.random() * 90) + 10 },
        { category: "D", value: Math.floor(Math.random() * 90) + 10 },
        { category: "E", value: Math.floor(Math.random() * 90) + 10 },
      ];
      setSelectedFileData(data);
      setXAxis(Object.keys(data[0])[0]);
      setYAxis(Object.keys(data[0])[1]);
      setChartOpen(true);
      const analysis = {
        file: file.name,
        date: new Date().toLocaleString(),
        type: "AI-Powered Analysis (Using Mock Data)",
      };
      setHistory((prev) => [...prev, analysis]);
      setNotification({
        open: true,
        message:
          "Failed to generate AI analysis after multiple retries, using mock data.",
        severity: "error",
      });
    }
  };

  const handleSummarizeFile = async (file) => {
    setSummarizeLoading(true);

    const OPENAI_API_KEY = "";
    const API_URL = "https://api.openai.com/v1/chat/completions";

    const prompt = `Please provide a concise summary of the file named "${file.name}". The content is currently simulated. In a real application, you would summarize the actual file content.`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes documents.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API call failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      const summary = result.choices[0].message.content.trim();

      setSummaryContent(summary);
      setSummaryOpen(true);

      const newHistory = {
        file: file.name,
        date: new Date().toLocaleString(),
        type: "OpenAI Summary",
      };
      setHistory((prev) => [...prev, newHistory]);

      setNotification({
        open: true,
        message: `Summary generated for ${file.name}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error generating summary:", err);
      setSummaryContent(
        "Failed to generate a summary. Please check your API key and try again."
      );
      setSummaryOpen(true);
      setNotification({
        open: true,
        message: "Summary generation failed.",
        severity: "error",
      });
    } finally {
      setSummarizeLoading(false);
    }
  };

  const chartColors = ["#4caf50", "#8bc34a", "#aed581", "#66bb6a", "#c8e6c9"];

  return (
    <Fade in={!fadeOut} timeout={800}>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f7" }}>
        <AppBar position="static" sx={{ bgcolor: "#4caf50" }}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", color: "white" }}
            >
              Data Analytics Dashboard
            </Typography>
            <IconButton onClick={handleAvatarClick} color="inherit">
              <Avatar sx={{ bgcolor: "white", color: "#4caf50" }}>
                {getInitials(userName) || <PersonIcon />}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

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
                bgcolor: "#4caf50",
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

          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset", color: "#4caf50" }}
              gutterBottom
            >
              <UploadFileIcon /> Upload Any File
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontWeight: "bold",
                fontFamily: "unset",
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#388e3c" },
              }}
              component="label"
            >
              Choose File
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Paper>

          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset", color: "#4caf50" }}
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
                <CircularProgress size={30} sx={{ color: "#4caf50" }} />
                <Typography sx={{ ml: 2, color: "#4caf50" }}>
                  Loading files...
                </Typography>
              </Box>
            ) : files.length === 0 ? (
              <Typography
                sx={{
                  fontFamily: "unset",
                  fontStyle: "italic",
                  color: "#6b7280",
                }}
              >
                No files uploaded yet.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e8f5e9" }}>
                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid #c8e6c9",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        File Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid #c8e6c9",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        Uploaded Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid #c8e6c9",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file._id} style={{ backgroundColor: "white" }}>
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {file.name}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {file.date || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{
                              mr: 1,
                              fontWeight: "bold",
                              fontFamily: "unset",
                            }}
                            onClick={() => handleAnalyzeFile(file)}
                            disabled={analysisLoading}
                          >
                            {analysisLoading ? (
                              <CircularProgress
                                size={18}
                                sx={{ color: "#4caf50" }}
                              />
                            ) : (
                              "Analyze"
                            )}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{
                              mr: 1,
                              fontWeight: "bold",
                              fontFamily: "unset",
                            }}
                            onClick={() => handleSummarizeFile(file)}
                            disabled={summarizeLoading}
                          >
                            {summarizeLoading ? (
                              <CircularProgress
                                size={18}
                                sx={{ color: "#4caf50" }}
                              />
                            ) : (
                              "Summarize"
                            )}
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
                            onClick={() => handleDownload(file)}
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

          {chartOpen && selectedFileData && (
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "unset",
                  color: "#4caf50",
                  mb: 2,
                }}
                gutterBottom
              >
                <InsertChartIcon /> Chart Analysis
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
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

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
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

              <Box sx={{ mb: 3 }}>
                <Bar
                  data={{
                    labels: selectedFileData.map((d) => d[xAxis]),
                    datasets: [
                      {
                        label: yAxis,
                        data: selectedFileData.map((d) => d[yAxis]),
                        backgroundColor: chartColors,
                        borderColor: chartColors.map((c) =>
                          c.replace("0.6", "1")
                        ),
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

              <Box
                sx={{
                  height: 400,
                  mt: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Canvas
                  camera={{ position: [0, 20, 40], fov: 60 }}
                  style={{ background: "#f8f9fa" }}
                >
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 30, 10]} intensity={1} />
                  <pointLight position={[-10, 30, -10]} intensity={1} />
                  <spotLight
                    position={[10, 15, 10]}
                    angle={0.3}
                    penumbra={1}
                    castShadow
                  />

                  {selectedFileData.map((d, i) => (
                    <Bar3D
                      key={i}
                      position={[
                        i * 5 - (selectedFileData.length - 1) * 2.5,
                        d[yAxis] / 2,
                        0,
                      ]}
                      height={d[yAxis]}
                      color={chartColors[i % chartColors.length]}
                    />
                  ))}

                  <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#ccc" />
                  </mesh>

                  <axesHelper args={[20]} />
                  <gridHelper args={[20, 20]} />

                  <OrbitControls />
                </Canvas>
              </Box>

              <Button
                variant="contained"
                color="success"
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

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "unset", color: "#4caf50" }}
              gutterBottom
            >
              <HistoryIcon /> Analysis History
            </Typography>
            {history.length === 0 ? (
              <Typography
                sx={{
                  fontFamily: "unset",
                  fontStyle: "italic",
                  color: "#6b7280",
                }}
              >
                No analysis history yet.
              </Typography>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {history.map((h, i) => (
                  <li
                    key={`${h.file}-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
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
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteHistory(i)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        </Box>

        <Dialog
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#4caf50" }}
              >
                <SummarizeIcon sx={{ mr: 1 }} /> File Summary
              </Typography>
              <IconButton onClick={() => setSummaryOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", fontFamily: "unset" }}
            >
              {summaryContent}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSummaryOpen(false)}
              color="success"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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
