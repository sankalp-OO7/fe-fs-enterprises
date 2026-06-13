import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Storefront,
} from "@mui/icons-material";
import useAuth from "../context/useAuth";
import axiosClient from "../api/axiosClient";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // ─── Auto-redirect if already authenticated ───────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/products", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ─── Pre-fill email only (never password) ────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", formData);
      const data = response.data;

      // Persist email (not password) for future convenience
      localStorage.setItem("savedEmail", formData.email);

      // Token + user stored by login() → persists across sessions
      login(data.user, data.token);
      navigate("/products", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "92.5vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #7e22ce 50%, #db2777 75%, #f59e0b 100%)",
        animation: "gradientShift 15s ease infinite",
        "@keyframes gradientShift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        backgroundSize: "200% 200%",
      }}
    >
      {/* Animated blobs */}
      <Box
        sx={{
          position: "absolute", top: "-50%", left: "-10%",
          width: "600px", height: "600px",
          background: "rgba(255,255,255,0.1)", borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%,100%": { transform: "translate(0,0) scale(1)" },
            "50%": { transform: "translate(50px,50px) scale(1.1)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute", bottom: "-30%", right: "-10%",
          width: "500px", height: "500px",
          background: "rgba(255,255,255,0.1)", borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 15s ease-in-out infinite reverse",
        }}
      />

      {/* Left branding (desktop) */}
      <Box
        sx={{
          flex: { xs: 0, md: 1 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          px: 6,
        }}
      >
        <Box
          sx={{
            position: "relative", mb: 4,
            animation: "pulse 3s ease-in-out infinite",
            "@keyframes pulse": {
              "0%,100%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" },
            },
          }}
        >
          <Box
            sx={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: "200px", height: "200px",
              background: "radial-gradient(circle,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0) 70%)",
              borderRadius: "50%", filter: "blur(30px)",
            }}
          />
          <Box
            sx={{
              position: "relative", width: "120px", height: "120px",
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)",
              borderRadius: "30px", display: "flex",
              justifyContent: "center", alignItems: "center",
              border: "2px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2),inset 0 0 20px rgba(255,255,255,0.1)",
            }}
          >
            <Storefront sx={{ fontSize: 70, color: "white" }} />
          </Box>
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800, color: "white", mb: 2,
            textShadow: "0 4px 30px rgba(0,0,0,0.3)",
            letterSpacing: "2px",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          FS Interprises
        </Typography>
        <Box sx={{ width: "80px", height: "4px", background: "linear-gradient(90deg,transparent,white,transparent)", mb: 3, borderRadius: "2px" }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 300, color: "rgba(255,255,255,0.9)",
            textAlign: "center", maxWidth: "500px", lineHeight: 1.6,
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          Empowering businesses with innovative solutions and exceptional service excellence
        </Typography>
        <Box sx={{ mt: 6, display: "flex", gap: 2 }}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{
                width: "12px", height: "12px", borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                animation: `bounce ${1 + item * 0.2}s ease-in-out infinite`,
                "@keyframes bounce": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
                animationDelay: `${item * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Right side — login form */}
      <Box
        sx={{
          flex: 1, display: "flex",
          justifyContent: "center", alignItems: "center",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Mobile logo */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute", top: 40,
            textAlign: "center", width: "100%",
          }}
        >
          <Box
            sx={{
              display: "inline-flex", alignItems: "center", gap: 1.5,
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              px: 3, py: 1.5, borderRadius: "50px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Storefront sx={{ fontSize: 32, color: "white" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "white", letterSpacing: "1px" }}>
              FS Interprises
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: { xs: "90%", sm: "480px" },
            p: { xs: 4, sm: 6 },
            borderRadius: 5,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15),0 0 100px rgba(255,255,255,0.1)",
            mt: { xs: 18, md: 0 },
            position: "relative", overflow: "hidden",
            "&::before": {
              content: '""', position: "absolute", top: 0, left: "-100%",
              width: "100%", height: "3px",
              background: "linear-gradient(90deg,transparent,#7e22ce,transparent)",
              animation: "shimmer 3s ease-in-out infinite",
              "@keyframes shimmer": { "0%": { left: "-100%" }, "100%": { left: "100%" } },
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Lock icon */}
            <Box
              sx={{
                width: 70, height: 70, borderRadius: "20px",
                background: "linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)",
                display: "flex", justifyContent: "center", alignItems: "center",
                mb: 3,
                boxShadow: "0 10px 30px rgba(102,126,234,0.4)",
                animation: "rotateGlow 4s linear infinite",
                "@keyframes rotateGlow": {
                  "0%": { boxShadow: "0 10px 30px rgba(102,126,234,0.4)" },
                  "50%": { boxShadow: "0 10px 40px rgba(240,147,251,0.6)" },
                  "100%": { boxShadow: "0 10px 30px rgba(102,126,234,0.4)" },
                },
              }}
            >
              <LockOutlined sx={{ color: "white", fontSize: 35 }} />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 4, fontSize: "0.95rem" }}>
              Sign in to continue to your account
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%", mb: 3, borderRadius: 3, border: "1px solid rgba(211,47,47,0.2)" }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: "rgba(102,126,234,0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": { background: "rgba(102,126,234,0.05)", "& fieldset": { borderColor: "#667eea" } },
                    "&.Mui-focused": {
                      background: "white",
                      boxShadow: "0 0 0 3px rgba(102,126,234,0.1)",
                      "& fieldset": { borderColor: "#667eea", borderWidth: "2px" },
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        sx={{ color: "#667eea", "&:hover": { background: "rgba(102,126,234,0.1)" } }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: "rgba(102,126,234,0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": { background: "rgba(102,126,234,0.05)", "& fieldset": { borderColor: "#667eea" } },
                    "&.Mui-focused": {
                      background: "white",
                      boxShadow: "0 0 0 3px rgba(102,126,234,0.1)",
                      "& fieldset": { borderColor: "#667eea", borderWidth: "2px" },
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !formData.email || !formData.password}
                sx={{
                  py: 1.8, borderRadius: 3,
                  textTransform: "none", fontSize: "1.05rem", fontWeight: 700,
                  background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                  boxShadow: "0 10px 30px rgba(102,126,234,0.35)",
                  position: "relative", overflow: "hidden",
                  "&::before": {
                    content: '""', position: "absolute",
                    top: 0, left: "-100%", width: "100%", height: "100%",
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                    transition: "left 0.5s ease",
                  },
                  "&:hover": {
                    background: "linear-gradient(135deg,#5568d3 0%,#6a3f8f 100%)",
                    boxShadow: "0 15px 40px rgba(102,126,234,0.5)",
                    transform: "translateY(-2px)",
                    "&::before": { left: "100%" },
                  },
                  "&:disabled": { opacity: 0.7 },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
