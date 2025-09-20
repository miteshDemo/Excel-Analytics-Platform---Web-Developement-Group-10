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
  TextField,
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [avatarOptions] = useState([
    { color: "#4caf50", emoji: "😊" },
    { color: "#2196f3", emoji: "🚀" },
    { color: "#ff9800", emoji: "⭐" },
    { color: "#9c27b0", emoji: "💼" },
    { color: "#f44336", emoji: "🔥" },
    { color: "#009688", emoji: "🌐" },
  ]);
  const [selectedAvatar, setSelectedAvatar] = useState({
    color: "#4caf50",
    emoji: "😊",
  });

  // Refs for chart elements to capture
  const chart2DRef = useRef(null);
  const chart3DRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("token", "mock-token");
    }

    setUserName(localStorage.getItem("name") || "John Doe");
    setUserEmail(localStorage.getItem("email") || "john.doe@example.com");
    setUserRole(localStorage.getItem("role") || "user");

    // Load avatar from localStorage if exists
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
      setSelectedAvatar(JSON.parse(savedAvatar));
    }

    // Load API key from localStorage if exists
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

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

    try {
      // For analysis, we'll use OpenAI to generate chart data
      const OPENAI_API_KEY = apiKey;
      const API_URL = "https://api.openai.com/v1/chat/completions";

      const prompt = `Generate JSON data for a bar chart analysis of a file named "${file.name}". 
      Create 5-7 categories with relevant values. Return ONLY valid JSON in this format:
      [
        {"category": "Category1", "value": 85},
        {"category": "Category2", "value": 45},
        ...
      ]
      Make the categories relevant to file analysis (like: Data Quality, Completeness, Accuracy, etc.)`;

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
              content:
                "You are a data analysis assistant. Generate only valid JSON output for chart data.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || response.status}`
        );
      }

      const result = await response.json();
      const jsonText = result.choices[0].message.content.trim();

      // Clean and parse the JSON response
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from AI");
      }

      const data = JSON.parse(jsonMatch[0]);

      if (data && data.length > 0) {
        setSelectedFileData(data);
        setXAxis("category");
        setYAxis("value");
        setChartOpen(true);

        const analysis = {
          file: file.name,
          date: new Date().toLocaleString(),
          type: "AI-Powered Analysis",
        };
        setHistory((prev) => [...prev, analysis]);

        setNotification({
          open: true,
          message: `AI analysis completed for ${file.name}`,
          severity: "success",
        });
      } else {
        throw new Error("No data received from AI");
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);

      // Fallback to mock data
      const mockData = [
        {
          category: "Data Quality",
          value: Math.floor(Math.random() * 90) + 10,
        },
        {
          category: "Completeness",
          value: Math.floor(Math.random() * 90) + 10,
        },
        { category: "Accuracy", value: Math.floor(Math.random() * 90) + 10 },
        { category: "Consistency", value: Math.floor(Math.random() * 90) + 10 },
        { category: "Relevance", value: Math.floor(Math.random() * 90) + 10 },
      ];

      setSelectedFileData(mockData);
      setXAxis("category");
      setYAxis("value");
      setChartOpen(true);

      const analysis = {
        file: file.name,
        date: new Date().toLocaleString(),
        type: "Analysis (Using Demo Data)",
      };
      setHistory((prev) => [...prev, analysis]);

      setNotification({
        open: true,
        message: "Using demo data for analysis",
        severity: "info",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSummarizeFile = async (file) => {
    setSummarizeLoading(true);

    try {
      const OPENAI_API_KEY = apiKey;
      const API_URL = "https://api.openai.com/v1/chat/completions";

      // In a real application, you would read the actual file content here
      // For this demo, we'll simulate file content based on file type
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let simulatedContent = "";

      switch (fileExtension) {
        case "pdf":
          simulatedContent =
            "This PDF document contains important business reports and financial data spanning multiple quarters.";
          break;
        case "doc":
        case "docx":
          simulatedContent =
            "This Word document includes detailed project documentation, meeting notes, and strategic plans.";
          break;
        case "xls":
        case "xlsx":
          simulatedContent =
            "This spreadsheet contains financial data, sales figures, and analytical calculations with multiple worksheets.";
          break;
        case "csv":
          simulatedContent =
            "This CSV file includes structured data with multiple columns containing customer information and transaction records.";
          break;
        default:
          simulatedContent =
            "This file contains various types of data and information relevant to business operations and analysis.";
      }

      const prompt = `Please provide a comprehensive yet concise summary of the following file content. 
      The file is named "${file.name}" and appears to contain: ${simulatedContent}
      
      Provide a professional summary that includes:
      1. Main topics or themes
      2. Key findings or data points
      3. Potential insights or recommendations
      4. Overall assessment
      
      Keep the summary under 300 words and make it useful for business analysis.`;

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
              content:
                "You are a professional document analysis assistant. Provide clear, concise, and insightful summaries.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || response.status}`
        );
      }

      const result = await response.json();
      const summary = result.choices[0].message.content.trim();

      setSummaryContent(summary);
      setSummaryOpen(true);

      const newHistory = {
        file: file.name,
        date: new Date().toLocaleString(),
        type: "AI Summary",
      };
      setHistory((prev) => [...prev, newHistory]);

      setNotification({
        open: true,
        message: `AI summary generated for ${file.name}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error generating summary:", err);

      // Fallback summary
      setSummaryContent(
        `Summary for: ${file.name}

This file appears to be a ${file.name
          .split(".")
          .pop()
          .toUpperCase()} document containing valuable business data.
While we couldn't generate a full AI-powered summary due to technical constraints, this file likely contains:

• Structured data and information
• Potential insights for business analysis
• Opportunities for further examination

To get a complete AI-powered summary, please ensure your API key is valid and has sufficient credits.`
      );
      setSummaryOpen(true);

      setNotification({
        open: true,
        message: "Summary generated with limited features",
        severity: "warning",
      });
    } finally {
      setSummarizeLoading(false);
    }
  };

  const downloadChartAsPNG = async (chartRef, fileName) => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = image;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        open: true,
        message: `${fileName} downloaded as PNG`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading chart as PNG:", error);
      setNotification({
        open: true,
        message: "Failed to download chart as PNG",
        severity: "error",
      });
    }
  };

  const downloadChartAsPDF = async (chartRef, fileName) => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`${fileName}.pdf`);

      setNotification({
        open: true,
        message: `${fileName} downloaded as PDF`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading chart as PDF:", error);
      setNotification({
        open: true,
        message: "Failed to download chart as PDF",
        severity: "error",
      });
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("openai_api_key", apiKey);
    setSettingsOpen(false);
    setNotification({
      open: true,
      message: "API key saved successfully",
      severity: "success",
    });
  };

  const handleSaveAvatar = () => {
    localStorage.setItem("userAvatar", JSON.stringify(selectedAvatar));
    setAvatarEditOpen(false);
    setNotification({
      open: true,
      message: "Avatar updated successfully",
      severity: "success",
    });
  };

  const chartColors = [
    "#4caf50",
    "#8bc34a",
    "#aed581",
    "#66bb6a",
    "#c8e6c9",
    "#81c784",
    "#a5d6a7",
  ];

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
              <Avatar
                sx={{
                  bgcolor: selectedAvatar.color,
                  color: "white",
                  fontSize: "1.2rem",
                }}
              >
                {selectedAvatar.emoji}
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
                bgcolor: selectedAvatar.color,
                width: 60,
                height: 60,
                fontSize: "1.5rem",
                mx: "auto",
                mb: 1,
              }}
            >
              {selectedAvatar.emoji}
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
              sx={{ fontWeight: "bold", fontFamily: "unset", mb: 1 }}
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setAvatarEditOpen(true)}
              fullWidth
            >
              Change Avatar
            </Button>
            <Button
              sx={{ fontWeight: "bold", fontFamily: "unset", mb: 1 }}
              variant="outlined"
              color="info"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
              fullWidth
            >
              API Settings
            </Button>
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

          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              background: "linear-gradient(135deg, #4caf50 0%, #2196f3 100%)",
              borderRadius: 3,
              p: 3,
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Roboto', sans-serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                mb: 1,
              }}
            >
              Welcome, {userName || "User"}! 👋
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Roboto', sans-serif",
                opacity: 0.9,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Ready to analyze your data and gain valuable insights?
            </Typography>
          </Box>

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
                            color="info"
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

              <Box sx={{ mb: 3 }} ref={chart2DRef}>
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
                        text: `Analysis of ${xAxis.toUpperCase()} vs ${yAxis.toUpperCase()}`,
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
                ref={chart3DRef}
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

              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="h6" sx={{ width: "100%", mb: 1 }}>
                  Download Charts:
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ImageIcon />}
                  onClick={() => downloadChartAsPNG(chart2DRef, "2D_Chart")}
                  sx={{ fontWeight: "bold", fontFamily: "unset" }}
                >
                  Download 2D Chart (PNG)
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => downloadChartAsPDF(chart2DRef, "2D_Chart")}
                  sx={{ fontWeight: "bold", fontFamily: "unset" }}
                >
                  Download 2D Chart (PDF)
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ImageIcon />}
                  onClick={() => downloadChartAsPNG(chart3DRef, "3D_Chart")}
                  sx={{ fontWeight: "bold", fontFamily: "unset" }}
                >
                  Download 3D Chart (PNG)
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => downloadChartAsPDF(chart3DRef, "3D_Chart")}
                  sx={{ fontWeight: "bold", fontFamily: "unset" }}
                >
                  Download 3D Chart (PDF)
                </Button>
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
          maxWidth="md"
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
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "unset",
                lineHeight: 1.6,
              }}
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

        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
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
                <SettingsIcon sx={{ mr: 1 }} /> API Settings
              </Typography>
              <IconButton onClick={() => setSettingsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Configure your OpenAI API key for AI-powered analysis and
              summarization features.
            </Typography>
            <TextField
              fullWidth
              label="OpenAI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              margin="normal"
              type="password"
              helperText="Your API key is stored locally in your browser"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveApiKey}
              color="success"
              variant="contained"
            >
              Save API Key
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={avatarEditOpen}
          onClose={() => setAvatarEditOpen(false)}
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
                <EditIcon sx={{ mr: 1 }} /> Change Avatar
              </Typography>
              <IconButton onClick={() => setAvatarEditOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Select your preferred avatar style:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {avatarOptions.map((avatar, index) => (
                <Avatar
                  key={index}
                  sx={{
                    bgcolor: avatar.color,
                    width: 60,
                    height: 60,
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    border:
                      selectedAvatar.emoji === avatar.emoji
                        ? "3px solid #4caf50"
                        : "none",
                    transform:
                      selectedAvatar.emoji === avatar.emoji
                        ? "scale(1.1)"
                        : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar.emoji}
                </Avatar>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarEditOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveAvatar}
              color="success"
              variant="contained"
            >
              Save Avatar
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
