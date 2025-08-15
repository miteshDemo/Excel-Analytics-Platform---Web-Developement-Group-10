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
  List,
  ListItem,
  ListItemText,
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");

    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
    if (storedRole) setUserRole(storedRole);
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    setLoggingOut(true);
    setFadeOut(true);

    setTimeout(() => {
      localStorage.clear();
      navigate("/login", { replace: true });
    }, 1500); // Slightly longer for effect
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .trim()
      .split(" ")
      .map((p) => p[0].toUpperCase())
      .join("");
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFiles((prev) => [
      ...prev,
      { name: file.name, date: new Date().toLocaleString() },
    ]);
    setNotification({
      open: true,
      message: `Uploaded ${file.name}`,
      severity: "success",
    });
  };

  const handleAnalyzeFile = (fileName) => {
    const analysis = {
      file: fileName,
      date: new Date().toLocaleString(),
      type: "Descriptive Analysis",
    };
    setHistory((prev) => [...prev, analysis]);
    setNotification({
      open: true,
      message: `Analysis completed for ${fileName}`,
      severity: "info",
    });
  };

  const handleDownload = (fileName) => {
    setNotification({
      open: true,
      message: `Downloading ${fileName}...`,
      severity: "success",
    });
  };

  return (
    <Fade in={!fadeOut} timeout={800}>
      <Box>
        <AppBar position="static" color="success">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", fontFamily: "unset" }}
            >
              User's Dashboard
            </Typography>
            <IconButton onClick={handleAvatarClick} color="inherit">
              <Avatar sx={{ bgcolor: "secondary.main" }}>
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
              variant="h6"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
            >
              {userName || "Unknown User"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
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
                  color: userRole === "admin" ? "darkred" : "darkgreen",
                }}
              >
                {userRole.toUpperCase()}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Button
              variant="contained"
              color="error"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
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
              <Typography sx={{ fontFamily: "unset", fontWeight: "bold" }}>
                Logging out...
              </Typography>
            </Box>
          )}

          <Typography
            variant="h4"
            sx={{ fontFamily: "unset", fontWeight: "bold" }}
            gutterBottom
          >
            Welcome, {userName || "User"}!
          </Typography>

          {/* Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
              gutterBottom
            >
              <UploadFileIcon /> Upload Excel/CSV File
            </Typography>
            <Button variant="contained" component="label" color="success">
              Choose File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Paper>

          {/* Recent Files */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
              gutterBottom
            >
              <InsertChartIcon /> Recent Files
            </Typography>
            {files.length === 0 ? (
              <Typography variant="body2">No files uploaded yet.</Typography>
            ) : (
              <List>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <>
                        <Button
                          size="small"
                          onClick={() => handleAnalyzeFile(file.name)}
                        >
                          Analyze
                        </Button>
                        <IconButton onClick={() => handleDownload(file.name)}>
                          <DownloadIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`Uploaded: ${file.date}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Analysis History */}
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "unset", fontWeight: "bold" }}
              gutterBottom
            >
              <HistoryIcon /> Analysis History
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2">No analysis history yet.</Typography>
            ) : (
              <List>
                {history.map((h, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${h.file} - ${h.type}`}
                      secondary={`Date: ${h.date}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

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
