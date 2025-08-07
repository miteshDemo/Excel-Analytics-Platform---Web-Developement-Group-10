import React from "react";
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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
// import { useNavigate } from "react-router-dom"; // For routing

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const LoginForm = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  //   const navigate = useNavigate(); // To redirect on successful login

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Login Form Data:", values);
      alert("Login Successful!");
      // navigate("/dashboard"); // Redirect to dashboard or home page
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "pink",
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
          <Typography
            sx={{
              color: "darkblue",
              fontFamily: "sans-serif",
              fontWeight: "bold",
            }}
            variant={isSmallScreen ? "h5" : "h4"}
            align="center"
            gutterBottom
          >
            Login
          </Typography>

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
                    sx={{ fontWeight: "bold" }}
                  >
                    Login
                  </Button>
                </Box>
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
                  mt={2}
                >
                  Are you a new user?{" "}
                  <Link href="/register" underline="hover">
                    Register
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

export default LoginForm;
