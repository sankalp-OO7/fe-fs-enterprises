import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAdmin: () => false,
});

export default AuthContext;
