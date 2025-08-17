import React, { useState } from "react";
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
  Snackbar,
  Alert,
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

  const [open, setOpen] = useState(false); // for success popup
  const [errorMessage, setErrorMessage] = useState(""); // for error popup

  const handleClose = () => setOpen(false);

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
          setOpen(true); // ✅ show success popup
          resetForm();
          setTimeout(() => navigate("/login"), 2000); // redirect after 2s
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(error.response?.data?.message || "Registration Failed");
        setOpen(true); // ✅ show error popup
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #006400, #228B22, #ffffff)",
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
            sx={{ fontWeight: "bold", color: "darkblue", fontFamily: "unset" }}
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
                {
                  name: "confirmPassword",
                  label: "Confirm Password",
                  type: "password",
                },
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
                    error={
                      formik.touched[field.name] &&
                      Boolean(formik.errors[field.name])
                    }
                    helperText={
                      formik.touched[field.name] && formik.errors[field.name]
                    }
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
                    fontFamily: "unset",
                    background: "linear-gradient(90deg, #006400, #228B22)",
                    "&:hover": {
                      background: "linear-gradient(90deg, #004d00, #006400)",
                    },
                  }}
                >
                  Register
                </Button>
              </Grid>
              <Grid item>
                <Typography align="center" sx={{ fontFamily: "unset" }}>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    sx={{ fontWeight: "bold", color: "blue" }}
                  >
                    Login
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>

      {/* ✅ Snackbar for Success & Error */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={errorMessage ? "error" : "success"}
          sx={{ width: "100%", fontWeight: "bold" }}
        >
          {errorMessage || "🎉 User Created Successfully!"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
