// components/admin/MemoOrders/shared/StyledTableRow.jsx
import { styled } from "@mui/material/styles";
import { TableRow } from "@mui/material";
import { alpha } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
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

export default StyledTableRow;