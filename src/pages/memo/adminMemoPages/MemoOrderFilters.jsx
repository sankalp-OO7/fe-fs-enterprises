// components/admin/MemoOrders/MemoOrderFilters.jsx
import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Pagination as MuiPagination,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { fadeIn } from "./Animations";

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
}));

const MemoOrderFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  totalItems,
  totalPages,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        alignItems: "center",
        animation: `${fadeIn} 1s ease`,
      }}
    >
      <SearchField
        size="small"
        placeholder="Search orders, email, name, GST..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { xs: "100%", sm: 300 } }}
      />

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Rows</InputLabel>
        <Select
          label="Rows"
          value={rowsPerPage}
          onChange={(e) => {
            setPage(1);
            setRowsPerPage(e.target.value);
          }}
          sx={{ borderRadius: 2 }}
        >
          {[10, 25, 50, 100].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Sort</InputLabel>
        <Select
          label="Sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="-createdAt">Newest First</MenuItem>
          <MenuItem value="createdAt">Oldest First</MenuItem>
          <MenuItem value="-totalAmount">Amount ↓</MenuItem>
          <MenuItem value="totalAmount">Amount ↑</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ flex: 1 }} />

      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Showing {totalItems > 0 ? (page - 1) * rowsPerPage + 1 : 0}-
        {Math.min(page * rowsPerPage, totalItems)} of {totalItems}
      </Typography>
    </Box>
  );
};

export default MemoOrderFilters;