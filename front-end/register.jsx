// src/front-end/register.jsx
import React from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Link,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import api from "../back-end/api"; 

const validationSchema = Yup.object({
  fullName: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function RegistrationForm() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { confirmPassword, fullName, ...rest } = values;
        const userData = { name: fullName, ...rest };

        const response = await api.post("/auth/register", userData);
        if (response.status === 201 || response.status === 200) {
          alert("Registration Successful! Please login.");
          resetForm();
          navigate("/login");
        }
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Registration Failed");
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
            p: isSmallScreen ? 3 : 4,
            bgcolor: "rgba(255,255,255,0.95)",
            borderRadius: 3,
            boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            align="center"
            sx={{ fontWeight: "bold", color: "#1a2a6c" }}
            variant={isSmallScreen ? "h5" : "h4"}
            gutterBottom
          >
            Create Account
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Grid container direction="column" spacing={2}>
              {[
                { name: "fullName", label: "Full Name" },
                { name: "email", label: "Email" },
                { name: "password", label: "Password", type: "password" },
                { name: "confirmPassword", label: "Confirm Password", type: "password" },
              ].map((field) => (
                <Grid item key={field.name}>
                  <TextField
                    fullWidth
                    type={field.type || "text"}
                    id={field.name}
                    name={field.name}
                    label={field.label}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                    helperText={formik.touched[field.name] && formik.errors[field.name]}
                  />
                </Grid>
              ))}
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.3,
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #1a2a6c, #b21f1f)",
                    "&:hover": {
                      background: "linear-gradient(90deg, #1a2a6c, #fdbb2d)",
                    },
                  }}
                >
                  Register
                </Button>
              </Grid>
              <Grid item>
                <Typography align="center">
                  Already have an account?{" "}
                  <Link href="/login" sx={{ fontWeight: "bold", color: "#b21f1f" }}>
                    Login
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
