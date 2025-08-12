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
import api from "../back-end/api"; // ✅ Import axios instance

// ✅ Validation schema
const validationSchema = Yup.object({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const RegistrationForm = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // ✅ Rename `fullName` to `name` for backend compatibility
        const { confirmPassword, fullName, ...rest } = values;
        const userData = { name: fullName, ...rest };

        const response = await api.post("/auth/register", userData);

        const { token, role } = response.data || {};
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", role || "user");
        }

        alert("Registration Successful!");
        resetForm();
        navigate("/login");
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Registration Failed");
      }
    },
  });

  return (
    <Box sx={{ bgcolor: "skyblue", py: 4 }}>
      <Container maxWidth="xs">
        <Box
          sx={{
            p: isSmallScreen ? 2 : 3,
            bgcolor: "#ffffff",
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Typography
            sx={{
              color: "darkblue",
              fontFamily: "sans-serif",
              fontWeight: "bold",
            }}
            variant="h4"
            gutterBottom
            align="center"
            color="primary"
          >
            Register
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Grid container direction="column" spacing={2}>
              {[
                { name: "fullName", label: "Full Name" },
                { name: "email", label: "Email" },
                { name: "phone", label: "Phone Number" },
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
                  color="primary"
                  fullWidth
                  sx={{ py: 1.2, fontWeight: "bold" }}
                >
                  Register
                </Button>
              </Grid>

              <Grid item>
                <Typography
                  sx={{
                    color: "darkblue",
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                  }}
                  variant="body2"
                  align="center"
                  mt={1}
                >
                  Already have an account?{" "}
                  <Link href="/login" underline="hover" color="primary">
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
};

export default RegistrationForm;
