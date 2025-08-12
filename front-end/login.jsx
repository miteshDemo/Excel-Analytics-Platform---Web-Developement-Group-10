import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import api from "../back-end/api";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const LoginForm = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("user"); // default

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await api.post("/auth/login", { ...values, role });
        const { token, role: serverRole } = res.data || {};

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", serverRole || role);

          // Redirect based on role
          if (serverRole === "admin") navigate("/admin-dashboard");
          else navigate("/user-dashboard");
        } else {
          alert("Invalid login response from server");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert(err.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: role === "admin" ? "pink" : "grey", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: isSmallScreen ? 2 : 4,
            mt: isSmallScreen ? 2 : 5,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Role Toggle */}
          <Box display="flex" justifyContent="center" mb={2}>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(e, newRole) => newRole && setRole(newRole)}
              color="primary"
            >
              <ToggleButton value="user">User Login</ToggleButton>
              <ToggleButton value="admin">Admin Login</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Title */}
          <Typography
            sx={{
              color: role === "admin" ? "darkred" : "darkblue",
              fontFamily: "sans-serif",
              fontWeight: "bold",
            }}
            variant={isSmallScreen ? "h5" : "h4"}
            align="center"
            gutterBottom
          >
            {role === "admin" ? "Admin Login" : "User Login"}
          </Typography>

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>

              <Grid item>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item>
                <Box display="flex" justifyContent="center">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ fontWeight: "bold", minWidth: 120 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Box>
              </Grid>

              {role === "user" && (
                <Grid item>
                  <Typography
                    sx={{
                      color: "darkblue",
                      fontFamily: "sans-serif",
                      fontWeight: "bold",
                    }}
                    variant="body2"
                    align="center"
                    mt={2}
                  >
                    Are you a new user?{" "}
                    <Link href="/register" underline="hover">
                      Register
                    </Link>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginForm;
