import useAuth from "../context/useAuth";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hardware Shop
        </Typography>
        <Box>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/products">
                Products
              </Button>

              {isAdmin() && (
                <Button color="inherit" component={RouterLink} to="/users">
                  Users
                </Button>
              )}

              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
