import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Divider,
  IconButton,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Edit, Delete, Save, Cancel, Refresh } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e8449",
      light: "#4caf50",
      contrastText: "#fff",
    },
    secondary: {
      main: "#fbc02d",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
        },
      },
    },
  },
});

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });
  const [summary, setSummary] = useState({});
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchUsers();
    fetchSummary();
  }, []);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }
      });
  };

  const fetchSummary = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to fetch summary:", err));
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const confirmLogout = () => {
    setLoadingLogout(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setLoadingLogout(false);
      setOpenLogoutDialog(false);
      navigate("/login");
    }, 2000);
  };

  const cancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditData({ name: "", email: "", role: "" });
  };

  const handleSave = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const admins = users.filter((u) => u.role === "admin");
  const normalUsers = users.filter((u) => u.role === "user");

  const renderTable = (data) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((u) => (
          <TableRow key={u._id}>
            <TableCell>
              {editingUser === u._id ? (
                <TextField
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  size="small"
                />
              ) : (
                u.name
              )}
            </TableCell>
            <TableCell>
              {editingUser === u._id ? (
                <TextField
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  size="small"
                />
              ) : (
                u.email
              )}
            </TableCell>
            <TableCell>
              {editingUser === u._id ? (
                <TextField
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({ ...editData, role: e.target.value })
                  }
                  size="small"
                />
              ) : (
                u.role
              )}
            </TableCell>
            <TableCell align="center">
              {editingUser === u._id ? (
                <>
                  <IconButton color="success" onClick={() => handleSave(u._id)}>
                    <Save />
                  </IconButton>
                  <IconButton color="error" onClick={handleCancel}>
                    <Cancel />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton color="primary" onClick={() => handleEdit(u)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u._id)}>
                    <Delete />
                  </IconButton>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Top Navbar */}
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                fontWeight: "bold",
                color: theme.palette.primary.contrastText,
              }}
            >
              Admin Dashboard
            </Typography>
            <IconButton color="inherit" onClick={fetchSummary}>
              <Refresh />
            </IconButton>
            <Button
              color="secondary"
              variant="contained"
              onClick={handleLogoutClick}
              sx={{ fontWeight: "bold" }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 6 }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="h6">Total Admins</Typography>
                <Typography variant="h4">{admins.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{normalUsers.length}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ mb: 4, overflow: "hidden" }} elevation={2}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
              Admins
            </Typography>
            <Divider />
            {renderTable(admins)}
          </Paper>

          <Paper elevation={2} sx={{ overflow: "hidden" }}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
              Users
            </Typography>
            <Divider />
            {renderTable(normalUsers)}
          </Paper>
        </Container>

        <Dialog open={openLogoutDialog} onClose={cancelLogout}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            {loadingLogout ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={2}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Logging out...</Typography>
              </Box>
            ) : (
              <Typography>Are you sure you want to logout?</Typography>
            )}
          </DialogContent>
          {!loadingLogout && (
            <DialogActions>
              <Button onClick={cancelLogout} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmLogout} color="error" variant="contained">
                Logout
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
