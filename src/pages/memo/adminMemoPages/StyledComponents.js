// components/admin/MemoOrders/shared/StyledComponents.js
import { styled } from "@mui/material/styles";
import { TableCell, TableHead, TableRow, Tab } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  position: "sticky",
  top: 0,
  zIndex: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.black,
  fontWeight: 700,
  fontSize: "0.875rem",
  borderBottom: "none",
  padding: theme.spacing(2),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: "capitalize",
  fontSize: "0.875rem",
  minHeight: 48,
  transition: "all 0.3s ease",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}));

// ✅ Added StyledTableRow here
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transform: "translateY(-2px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cursor: "pointer",
  transition: "all 0.3s ease",
  borderLeft: "3px solid transparent",
  "&:hover": {
    borderLeftColor: theme.palette.primary.main,
  },
}));