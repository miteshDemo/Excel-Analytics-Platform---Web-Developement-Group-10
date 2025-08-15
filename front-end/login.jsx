// LoginForm.jsx
import React, { useState } from "react";
import { Container, Typography, Grid, TextField, Button, Box, CircularProgress, Link } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import api from "../back-end/api";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await api.post("/auth/login", { ...values, role: "user" });
        const { token, name, email } = res.data || {};

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", "user");
          if (name) localStorage.setItem("name", name);
          if (email) localStorage.setItem("email", email);
          navigate("/dashboard");
        } else {
          alert("Invalid login response from server");
        }
      } catch (err) {
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
        background: "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            bgcolor: "rgba(255,255,255,0.95)",
            borderRadius: 3,
            boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
          }}
        >
          <Typography align="center" sx={{ fontWeight: "bold", color: "#1a2a6c" }} variant="h4" gutterBottom>
            User Login
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField fullWidth id="email" name="email" label="Email"
                  value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email} />
              </Grid>
              <Grid item>
                <TextField fullWidth id="password" name="password" type="password" label="Password"
                  value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password} />
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" fullWidth
                  sx={{
                    py: 1.3,
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #1a2a6c, #b21f1f)",
                    "&:hover": { background: "linear-gradient(90deg, #1a2a6c, #fdbb2d)" },
                  }}
                  disabled={loading}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </Button>
              </Grid>
              <Grid item>
                <Typography align="center">
                  New here?{" "}
                  <Link href="/register" sx={{ fontWeight: "bold", color: "#b21f1f" }}>
                    Create Account
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </Box>
  );
}
