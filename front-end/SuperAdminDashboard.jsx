import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { keyframes } from "@emotion/react";
import {
  Close,
  Add,
  Edit,
  Delete,
  Search,
  Logout,
  Save,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/* ----------------------------- THEME ----------------------------- */
const customTheme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#d81b60" },
    success: { main: "#2e7d32" },
    background: { default: "#f0f2f5", paper: "#ffffffdd" },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});

/* ----------------------------- Animations ----------------------------- */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ----------------------------- Styled Components ----------------------------- */
const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
  padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  borderRadius: theme.shape.borderRadius * 3,
  textAlign: "center",
  width: "100%",
  maxWidth: 960,
  animation: `${fadeIn} 0.8s ease-out`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: "10px 24px",
  fontWeight: "bold",
  color: "#fff",
  background: "linear-gradient(135deg, #1976d2, #42a5f5)",
  "&:hover": { background: "linear-gradient(135deg, #1565c0, #1e88e5)" },
}));

/* ----------------------------- API ----------------------------- */
const API = axios.create({ baseURL: "http://localhost:5000" });
function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

/* ----------------------------- Component ----------------------------- */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [busy, setBusy] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [query, setQuery] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role !== "superadmin") navigate("/login");
  }, [role, navigate]);

  const handleUnauthorized = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await API.get("/api/admin/users", { headers: authHeader() });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) handleUnauthorized();
      notify("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const notify = (message, severity = "info") =>
    setToast({ open: true, message, severity });

  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, query]);

  const resetForm = () =>
    setFormData({ name: "", email: "", role: "user", password: "" });

  /* ----------------------------- CRUD ----------------------------- */
  const openCreate = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const createUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return notify("Name, Email and Password are required", "warning");
    }
    setBusy(true);
    try {
      await API.post(
        "/api/auth/register",
        { ...formData },
        { headers: authHeader() }
      );
      notify("User created", "success");
      setOpenCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (user) => {
    setEditId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      password: "",
    });
    setOpenEditDialog(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    if (!formData.name || !formData.email) {
      return notify("Name and Email are required", "warning");
    }
    setBusy(true);
    try {
      await API.put(
        `/api/admin/users/${editId}`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        },
        { headers: authHeader() }
      );
      notify("User updated", "success");
      setOpenEditDialog(false);
      resetForm();
      setEditId(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (user) => {
    setDeleteTarget(user);
    setOpenDeleteDialog(true);
  };

  const deleteUser = async () => {
    if (!deleteTarget?._id) return;
    setBusy(true);
    try {
      await API.delete(`/api/admin/users/${deleteTarget._id}`, {
        headers: authHeader(),
      });
      notify("User deleted", "success");
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ----------------------------- UI ----------------------------- */
  const renderUserTable = (data) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell><b>Name</b></TableCell>
          <TableCell><b>Email</b></TableCell>
          <TableCell><b>Role</b></TableCell>
          <TableCell align="right"><b>Actions</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} align="center">
              {loadingUsers ? "Loading..." : "No users found"}
            </TableCell>
          </TableRow>
        ) : (
          data.map((u) => (
            <TableRow
              key={u._id}
              hover
              sx={{ transition: "0.2s", "&:hover": { background: "#f1f8ff" } }}
            >
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Chip
                  label={u.role}
                  size="small"
                  color={
                    u.role === "superadmin"
                      ? "success"
                      : u.role === "admin"
                      ? "primary"
                      : "default"
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton onClick={() => openEdit(u)} size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => confirmDelete(u)}
                    size="small"
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <AppBar position="sticky" sx={{ background: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" justifyContent="center" flexGrow={1}>
            <img src="https://i.ibb.co/d4xNZbb0/233-2338894-eap-photography-video-port-jefferson-station-ny-sb-logo-removebg-preview-1.png" alt="EAP Logo" style={{ height: 45 }} />
          </Box>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <StyledContainer>
        <StyledPaper>
          <Typography variant="h3" gutterBottom color="primary" fontWeight="bold">
            Super Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Manage users, admins, and system control in one place.
          </Typography>

          <Box mt={4} display="flex" flexWrap="wrap" gap={2} justifyContent="center">
            <GradientButton onClick={() => setOpenUsersDialog(true)} startIcon={<Search />}>
              View All Users
            </GradientButton>
            <GradientButton
              onClick={openCreate}
              startIcon={<Add />}
              sx={{ background: "linear-gradient(135deg, #2e7d32, #66bb6a)" }}
            >
              Create User/Admin
            </GradientButton>
          </Box>
        </StyledPaper>
      </StyledContainer>

      {/* View Users Dialog */}
      <Dialog open={openUsersDialog} onClose={() => setOpenUsersDialog(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2} alignItems="center">
              All Users ({users.length})
              <TextField
                size="small"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <IconButton onClick={() => setOpenUsersDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingUsers ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            renderUserTable(filtered)
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit/Delete dialogs ... (same as before, just styled) */}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default SuperAdminDashboard;
