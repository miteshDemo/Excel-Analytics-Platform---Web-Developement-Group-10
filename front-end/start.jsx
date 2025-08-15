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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const facilities = [
  { title: "Excel File Upload", description: "Easily upload .xls or .xlsx files for analysis.", direction: "left" },
  { title: "2D & 3D Charts", description: "Visualize your data in interactive 2D and 3D graphs.", direction: "right" },
  { title: "Dynamic Axis Selection", description: "Choose which columns to map to chart axes.", direction: "left" },
  { title: "Downloadable Reports", description: "Export analysis results as images or reports.", direction: "right" },
  { title: "Analysis History", description: "Access your past uploads and analysis anytime.", direction: "left" },
];

const StartPage = () => {
  const navigate = useNavigate();
  const facilitiesRef = useRef(null);
  const contactRef = useRef(null);
  const aboutRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const handleEnterClick = () => navigate("/register");
  const scrollToFacilities = () => facilitiesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
      {/* Navbar */}
      <AppBar position="fixed" sx={{ backgroundColor: "white", color: "black", boxShadow: "0px 2px 10px rgba(0,0,0,0.08)" }}>
        <Toolbar sx={{ minHeight: 58 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img src="https://i.ibb.co/d4xNZbb0/233-2338894-eap-photography-video-port-jefferson-station-ny-sb-logo-removebg-preview-1.png"
              alt="Logo"
              style={{ width: "45px", marginRight: "10px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "unset" }}>Excel Analytics Platform</Typography>
          </Box>

          {["Home", "Facilities", "Contact", "About"].map((label, i) => (
            <Button
              key={i}
              onClick={
                label === "Home" ? () => navigate("/") :
                label === "Facilities" ? scrollToFacilities :
                label === "Contact" ? scrollToContact :
                scrollToAbout
              }
              sx={{
                fontWeight: "bold",
                fontFamily: "unset",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: 0,
                  height: "2px",
                  bottom: 0,
                  left: 0,
                  backgroundColor: "#1976d2",
                  transition: "width 0.3s",
                },
                "&:hover::after": { width: "100%" },
              }}
            >
              {label}
            </Button>
          ))}
          <Button variant="contained" color="primary" sx={{ fontWeight: "bold", fontFamily: "unset" }} onClick={() => navigate("/register")}>
            Get Started / Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Background */}
      <Box sx={{
        position: "absolute", top: 58, left: 0, width: "100%", height: "100%",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('https://static.vecteezy.com/system/resources/thumbnails/030/720/132/small/green-wall-texture-green-abstract-background-photo.jpg')`,
        backgroundSize: "cover", backgroundPosition: "center", zIndex: 0
      }} />

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ zIndex: 1, textAlign: "center", mt: 14 }}>
        <Stack spacing={3} alignItems="center">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            src="https://i.ibb.co/d4xNZbb0/233-2338894-eap-photography-video-port-jefferson-station-ny-sb-logo-removebg-preview-1.png"
            alt="Excel Analytics"
            style={{ width: "140px" }}
          />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography variant="h3" fontWeight="bold" fontFamily="unset" color="white">Welcome to Excel Analytics Platform</Typography>
            <Typography variant="body1" maxWidth="sm" color="#f0f0f0" sx={{ mt: 1 }}>
              Upload your Excel files, analyze data with powerful 2D/3D visualizations, and gain insights — all in one place.
            </Typography>
          </motion.div>
          <Button variant="contained" color="primary" size="large" onClick={handleEnterClick} sx={{ mt: 2, px: 4, fontFamily: "unset", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
            Get Started
          </Button>
        </Stack>
      </Container>

      {/* Facilities */}
      <Container ref={facilitiesRef} maxWidth="lg" sx={{ mt: 8, zIndex: 1, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 4, fontFamily: "unset" }}>Platform Facilities</Typography>
        <Grid container spacing={4}>
          {facilities.map((facility, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ x: facility.direction === "left" ? -200 : 200, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 3, borderRadius: 3,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: "0px 10px 25px rgba(0,0,0,0.15)" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img src="https://i.ibb.co/d4xNZbb0/233-2338894-eap-photography-video-port-jefferson-station-ny-sb-logo-removebg-preview-1.png"
                      alt="Facility" style={{ width: "45px", marginRight: "15px" }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{facility.title}</Typography>
                      <Typography variant="body2">{facility.description}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Quick Contact */}
      <Container ref={contactRef} maxWidth="lg" sx={{ mb: 6, zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" fontFamily="unset" gutterBottom>Quick Contact</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Have questions? Send us a message and we'll get back to you.</Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={!!errors.name} helperText={errors.name} />
                <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!errors.email} helperText={errors.email} />
                <TextField label="Message" fullWidth multiline rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} error={!!errors.message} helperText={errors.message} />
                <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontWeight: "bold" }}>Send Message</Button>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>

      {/* About Section */}
      <Container ref={aboutRef} maxWidth="lg" sx={{ mb: 6, zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3, backgroundColor: "#fafafa" }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>About Us</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Excel Analytics Platform is your all-in-one solution for turning raw spreadsheet data into actionable insights.
            </Typography>
            <Typography variant="body1">
              From dynamic charting to exportable reports, we’re committed to helping you make data-driven decisions efficiently and effectively.
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default StartPage;
