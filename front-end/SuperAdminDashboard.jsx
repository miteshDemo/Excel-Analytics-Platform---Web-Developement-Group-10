import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Button,
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

/* ----------------------------- THEME (kept) ----------------------------- */
const customTheme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#2e7d32" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: { fontFamily: "Roboto, sans-serif" },
});

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(4),
  animation: `${fadeIn} 1s ease-out`,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[10],
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: "center",
  width: "100%",
  maxWidth: 900,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: "bold",
  textTransform: "uppercase",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[5],
  },
}));

/* -------------------------- Helper: API + Auth -------------------------- */
const API = axios.create({
  baseURL: "http://localhost:5000",
});

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

/* ---------------------------- Main Component ---------------------------- */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);

  // Create / Edit Dialog state
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

  // Delete confirm
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search/filter
  const [query, setQuery] = useState("");

  // Toaster
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Guard: only superadmin can be here
  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role !== "superadmin") {
      // fallback safety: bounce non-superadmins
      navigate("/login");
    }
  }, [role, navigate]);

  /* ------------------------------- Fetchers ------------------------------ */
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
      console.error("Fetch users failed:", err);
      if (err.response?.status === 401) handleUnauthorized();
      notify("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ------------------------------- Helpers ------------------------------- */
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

  /* -------------------------------- Create ------------------------------- */
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
      // FIX: Changed API endpoint to match the known working registration endpoint
      await API.post(
        "/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        },
        { headers: authHeader() }
      );
      notify("User created");
      setOpenCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Create user failed:", err);
      notify(err.response?.data?.message || "Failed to create user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  /* --------------------------------- Edit -------------------------------- */
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
    if (!formData.name || !formData.email || !formData.role) {
      return notify("Name, Email and Role are required", "warning");
    }
    setBusy(true);
    try {
      await API.put(
        `/api/admin/users/${editId}`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          // Optional password reset if provided
          ...(formData.password ? { password: formData.password } : {}),
        },
        { headers: authHeader() }
      );
      notify("User updated");
      setOpenEditDialog(false);
      resetForm();
      setEditId(null);
      fetchUsers();
    } catch (err) {
      console.error("Update user failed:", err);
      notify(err.response?.data?.message || "Failed to update user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  /* -------------------------------- Delete ------------------------------- */
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
      notify("User deleted");
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user failed:", err);
      notify(err.response?.data?.message || "Failed to delete user", "error");
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setBusy(false);
    }
  };

  /* --------------------------------- UI ---------------------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleViewUsers = () => setOpenUsersDialog(true);
  const handleCloseUsers = () => setOpenUsersDialog(false);

  const renderUserTable = (data) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell align="right">Actions</TableCell>
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
            <TableRow key={u._id}>
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
    <StyledContainer>
      <StyledPaper>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight : "bold", fontFamily : "unset"}} variant="h3" component="h1" gutterBottom color="primary">
            Super Admin Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Logout">
              <IconButton color="error" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box my={2}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight : "bold", fontFamily : "unset"}}>
            Your hub for complete system control.
          </Typography>
        </Box>

        <Box mt={4} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <StyledButton
            sx={{ fontWeight : "bold", fontFamily : "unset"}}
              variant="contained"
              color="primary"
              onClick={handleViewUsers}
              startIcon={<Search />}
            >
              View All Users & Admins
            </StyledButton>
            <StyledButton
            sx={{ fontWeight : "bold", fontFamily : "unset"}}
              variant="contained"
              color="success"
              onClick={openCreate}
              startIcon={<Add />}
            >
              Create New User/Admin
            </StyledButton>
            <StyledButton
            sx={{ fontWeight : "bold", fontFamily : "unset"}}
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>

      {/* View Users Dialog */}
      <Dialog
        open={openUsersDialog}
        onClose={handleCloseUsers}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            All Users ({users.length})
            <TextField
              autoFocus
              size="small"
              placeholder="Search name, email or role"
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
          <IconButton onClick={handleCloseUsers}>
            <Close />
          </IconButton>
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

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => !busy && setOpenCreateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New User/Admin</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            margin="normal"
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((s) => ({ ...s, email: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((s) => ({ ...s, password: e.target.value }))
            }
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData((s) => ({ ...s, role: e.target.value }))
            }
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superadmin">Super Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={busy}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={createUser}
            variant="contained"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={18} /> : <Save />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => !busy && setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            margin="normal"
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((s) => ({ ...s, email: e.target.value }))
            }
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData((s) => ({ ...s, role: e.target.value }))
            }
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superadmin">Super Admin</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Reset Password (optional)"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((s) => ({ ...s, password: e.target.value }))
            }
            helperText="Leave blank to keep the current password"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditDialog(false)}
            disabled={busy}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={saveEdit}
            variant="contained"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={18} /> : <Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !busy && setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This
            will also remove their related data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setOpenDeleteDialog(false)}
            disabled={busy}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={deleteUser}
            color="error"
            variant="contained"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={18} /> : <Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

/* ------------------------------ Themed export ----------------------------- */
const ThemedSuperAdminDashboard = () => (
  <ThemeProvider theme={customTheme}>
    <SuperAdminDashboard />
  </ThemeProvider>
);

export default ThemedSuperAdminDashboard;
