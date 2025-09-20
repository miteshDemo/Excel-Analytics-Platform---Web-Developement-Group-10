import React, { useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

// Facility data with icons
const facilities = [
  {
    title: "Excel File Upload",
    description: "Upload your Excel files with just a click.",
    icon: <CloudUploadIcon fontSize="large" color="primary" />,
  },
  {
    title: "2D & 3D Charts",
    description: "Visualize insights in stunning 2D & 3D charts.",
    icon: <BarChartIcon fontSize="large" color="secondary" />,
  },
  {
    title: "Dynamic Axis Selection",
    description: "Select columns dynamically to map on chart axes.",
    icon: <AutoGraphIcon fontSize="large" color="success" />,
  },
  {
    title: "Downloadable Reports",
    description: "Export and download your analysis reports instantly.",
    icon: <DownloadIcon fontSize="large" color="warning" />,
  },
  {
    title: "Analysis History",
    description: "Access your entire analysis history anytime.",
    icon: <HistoryIcon fontSize="large" color="error" />,
  },
];

const StartPage = () => {
  const navigate = useNavigate();
  const facilitiesRef = useRef(null);
  const contactRef = useRef(null);
  const aboutRef = useRef(null);

  // Read user info
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!storedUser;
  const userRole = storedUser?.role || "user";

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleEnterClick = () => navigate("/register");

  const handleGoToDashboard = () => {
    if (userRole === "superadmin") navigate("/superadmin/dashboard");
    else if (userRole === "admin") navigate("/admin/dashboard");
    else navigate("/dashboard");
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const navLabels = isLoggedIn
    ? ["Home", "Facilities", "About"]
    : ["Home", "Facilities", "Contact", "About"];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await axios.post("http://localhost:5000/api/contact", {
          ...formData,
          subject: "Contact Form Submission",
        });

        if (res.status === 201) {
          setDialogState({
            isOpen: true,
            title: "Success",
            message: "Message sent successfully! 🎉",
          });
          setFormData({ name: "", email: "", message: "" });
        }
      } catch (err) {
        setDialogState({
          isOpen: true,
          title: "Error",
          message: "Something went wrong. Please try again. 😥",
        });
      }
    }
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9" }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          color: "black",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Excel Analytics
          </Typography>
          {navLabels.map((label, i) => (
            <Button
              key={i}
              sx={{ fontWeight: "bold", mx: 1 }}
              onClick={() => {
                if (label === "Home")
                  window.scrollTo({ top: 0, behavior: "smooth" });
                if (label === "Facilities") scrollTo(facilitiesRef);
                if (label === "Contact") scrollTo(contactRef);
                if (label === "About") scrollTo(aboutRef);
              }}
            >
              {label}
            </Button>
          ))}
          {isLoggedIn ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="contained" onClick={handleGoToDashboard}>
                Dashboard
              </Button>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </Stack>
          ) : (
            <Button variant="contained" onClick={handleEnterClick}>
              Get Started
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          height: "100vh",
          background:
            "linear-gradient(to right, #1976d2 40%, #42a5f5 100%), url('https://img.freepik.com/free-photo/abstract-background-with-low-poly-design_1048-15104.jpg')",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "white",
          px: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" fontWeight="bold">
            Unlock Insights from Excel
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 4 }}>
            Upload, Analyze, and Visualize your data in seconds.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ px: 5, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
            onClick={isLoggedIn ? handleGoToDashboard : handleEnterClick}
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </Button>
        </motion.div>
      </Box>

      {/* Facilities */}
      <Container ref={facilitiesRef} sx={{ py: 8 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Platform Facilities
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {facilities.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {f.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {f.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact */}
      {!isLoggedIn && (
        <Container ref={contactRef} sx={{ py: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Get in Touch
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                      <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                      <TextField
                        label="Message"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleFormChange}
                        error={!!errors.message}
                        helperText={errors.message}
                      />
                      <Button type="submit" variant="contained" size="large">
                        Send Message
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.img
                src="https://img.freepik.com/free-vector/contact-us-concept-illustration_114360-1499.jpg"
                alt="Contact illustration"
                style={{ width: "100%", borderRadius: "16px" }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              />
            </Grid>
          </Grid>
        </Container>
      )}

      {/* About */}
      <Container ref={aboutRef} sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              align="center"
            >
              About Us
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}
            >
              At <strong>Excel Analytics</strong>, our mission is to simplify
              data analysis for everyone. We help businesses and individuals
              turn raw spreadsheets into meaningful insights through powerful
              visualizations, smart automation, and intuitive design.
            </Typography>

            {/* Values Grid */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {[
                {
                  title: "🚀 Innovation",
                  desc: "We continuously adopt modern technologies to deliver fast, scalable, and intelligent solutions.",
                },
                {
                  title: "🤝 Collaboration",
                  desc: "We work hand-in-hand with our users, ensuring a smooth journey from upload to insight.",
                },
                {
                  title: "🔒 Reliability",
                  desc: "Security and performance are at the heart of our platform, empowering users with peace of mind.",
                },
              ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        height: "100%",
                        textAlign: "center",
                        transition: "0.3s",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onClose={() =>
          setDialogState({ ...dialogState, isOpen: false })
        }
      >
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent>
          <Typography>{dialogState.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogState({ ...dialogState, isOpen: false })
            }
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StartPage;
