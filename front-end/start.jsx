import React from 'react';
import { Box, Button, Typography, Container, Stack, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const facilities = [
  {
    title: 'Excel File Upload',
    description: 'Easily upload .xls or .xlsx files for analysis.',
    direction: 'left',
  },
  {
    title: '2D & 3D Charts',
    description: 'Visualize your data in interactive 2D and 3D graphs.',
    direction: 'right',
  },
  {
    title: 'Dynamic Axis Selection',
    description: 'Choose which columns to map to chart axes.',
    direction: 'left',
  },
  {
    title: 'Downloadable Reports',
    description: 'Export analysis results as images or reports.',
    direction: 'right',
  },
  {
    title: 'Analysis History',
    description: 'Access your past uploads and analysis anytime.',
    direction: 'left',
  },
];

const StartPage = () => {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    navigate('/register');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        py: 6,
        color: 'text.primary',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Background Image Layer */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('https://static.vecteezy.com/system/resources/thumbnails/030/720/132/small/green-wall-texture-green-abstract-background-photo.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* Foreground Content */}
      <Container maxWidth="md" sx={{ zIndex: 1, textAlign: 'center', mt: 6 }}>
        <Stack spacing={4} alignItems="center">
          <Box>
            <img
              src="https://i.ibb.co/d4xNZbb0/233-2338894-eap-photography-video-port-jefferson-station-ny-sb-logo-removebg-preview-1.png"
              alt="Excel Analytics"
              style={{
                width: '200px',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: '20px',
              }}
            />
          </Box>

          <Typography variant="h3" component="h1" fontWeight="bold">
            Welcome to Excel Analytics Platform
          </Typography>

          <Typography variant="body1" maxWidth="sm">
            Upload your Excel files, analyze your data with powerful 2D/3D visualizations, and gain insights — all in one platform.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleEnterClick}
            sx={{ mt: 2, px: 4 }}
          >
            Enter the Platform
          </Button>
        </Stack>
      </Container>

      {/* Facilities Section */}
      <Container maxWidth="lg" sx={{ mt: 8, zIndex: 1 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Platform Facilities
        </Typography>

        <Grid container spacing={4}>
          {facilities.map((facility, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ x: facility.direction === 'left' ? -200 : 200, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
              >
                <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {facility.title}
                  </Typography>
                  <Typography variant="body2">{facility.description}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StartPage;
