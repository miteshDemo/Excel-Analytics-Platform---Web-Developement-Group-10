import React, { useEffect, useState, useCallback } from "react";
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  alpha,
  Slide,
  Fade,
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  Dashboard,
  People,
  Message,
  Logout,
  Menu,
  Person,
  AdminPanelSettings,
  Email,
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32",
      light: "#4CAF50",
      dark: "#1B5E20",
      contrastText: "#fff",
    },
    secondary: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFA000",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#546E7A",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 500,
          padding: "8px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 6px 16px 0 rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px 0 rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td, &:last-child th": { border: 0 },
          "&:hover": {
            backgroundColor: alpha("#2E7D32", 0.03),
          },
        },
      },
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });
  const [summary, setSummary] = useState({});
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [messages, setMessages] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // === USERS FETCH ===
  const fetchUsers = useCallback(() => {
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
  }, [navigate, token]);

  // === SUMMARY FETCH ===
  const fetchSummary = useCallback(() => {
    axios
      .get("http://localhost:5000/api/admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to fetch summary:", err));
  }, [token]);

  // === CONTACT MESSAGES FETCH ===
  const fetchMessages = useCallback(() => {
    axios
      .get("http://localhost:5000/api/contact", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to fetch messages:", err));
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchSummary();
    fetchMessages();
  }, [fetchUsers, fetchSummary, fetchMessages]);

  // === LOGOUT ===
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
      navigate("/");
    }, 2000);
  };
  const cancelLogout = () => setOpenLogoutDialog(false);

  // === USER CRUD ===
  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };
  const handleCancel = () => {
    setEditingUser(null);
    setEditData({ name: "", email: "", role: "" });
  };
  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // === MESSAGE DELETE ===
  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const admins = users.filter((u) => u.role === "admin");
  const normalUsers = users.filter((u) => u.role === "user");

  const drawer = (
    <Box sx={{ overflow: "auto" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <AdminPanelSettings sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" noWrap component="div" color="primary">
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={tabValue === 0}
            onClick={() => setTabValue(0)}
          >
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={tabValue === 1}
            onClick={() => setTabValue(1)}
          >
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="User Management" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={tabValue === 2}
            onClick={() => setTabValue(2)}
          >
            <ListItemIcon>
              <Message />
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const renderUserTable = (data, title) => (
    <Paper sx={{ mb: 4, overflow: "hidden" }} elevation={0}>
      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.dark" }}>
          {title} ({data.length})
        </Typography>
      </Box>
      <Divider />
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>User</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Role</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((u) => (
            <TableRow key={u._id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                    {u.name.charAt(0).toUpperCase()}
                  </Avatar>
                  {editingUser === u._id ? (
                    <TextField
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      size="small"
                    />
                  ) : (
                    <Typography variant="subtitle1">{u.name}</Typography>
                  )}
                </Box>
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
                  <Chip 
                    label={u.role} 
                    color={u.role === "admin" ? "primary" : "default"}
                    size="small"
                  />
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
    </Paper>
  );

  const renderMessagesTable = () => (
    <Paper sx={{ overflow: "hidden" }} elevation={0}>
      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.dark" }}>
          Contact Messages ({messages.length})
        </Typography>
      </Box>
      <Divider />
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>From</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Message</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Date</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((m) => (
            <TableRow key={m._id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                    {m.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="subtitle1">{m.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {m.message}
                </Typography>
              </TableCell>
              <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
              <TableCell align="center">
                <IconButton color="error" onClick={() => handleDeleteMessage(m._id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - 240px)` },
            ml: { md: `240px` },
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: "#fff",
            color: theme.palette.text.primary,
            boxShadow: "0 2px 10px 0 rgba(0,0,0,0.05)",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Admin Dashboard
            </Typography>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogoutClick}
              sx={{ fontWeight: "medium" }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - 240px)` },
            mt: 8,
          }}
        >
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab icon={<Dashboard />} iconPosition="start" label="Dashboard" />
              <Tab icon={<People />} iconPosition="start" label="Users" />
              <Tab icon={<Message />} iconPosition="start" label="Messages" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Fade in={tabValue === 0} timeout={500}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                          <People />
                        </Avatar>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                          Total Users
                        </Typography>
                        <Typography variant="h4">{normalUsers.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                          <AdminPanelSettings />
                        </Avatar>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                          Admins
                        </Typography>
                        <Typography variant="h4">{admins.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: "secondary.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                          <Email />
                        </Avatar>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                          Messages
                        </Typography>
                        <Typography variant="h4">{messages.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar sx={{ bgcolor: alpha("#9E9E9E", 0.1), color: "#9E9E9E", width: 56, height: 56, mx: "auto", mb: 2 }}>
                          <Person />
                        </Avatar>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                          Active Sessions
                        </Typography>
                        <Typography variant="h4">{users.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Fade>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Slide direction="left" in={tabValue === 1} mountOnEnter unmountOnExit timeout={500}>
                <Box>
                  {renderUserTable(admins, "Administrators")}
                  {renderUserTable(normalUsers, "Users")}
                </Box>
              </Slide>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Slide direction="left" in={tabValue === 2} mountOnEnter unmountOnExit timeout={500}>
                <Box>{renderMessagesTable()}</Box>
              </Slide>
            </TabPanel>
          </Container>
        </Box>

        {/* Logout Dialog */}
        <Dialog open={openLogoutDialog} onClose={cancelLogout} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Confirm Logout</DialogTitle>
          <DialogContent>
            {loadingLogout ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress size={24} />
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