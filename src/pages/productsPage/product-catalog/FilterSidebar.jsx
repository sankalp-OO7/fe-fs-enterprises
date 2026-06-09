import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredCount,
  onClearFilters,
}) => {
  const whiteInputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontSize: "0.875rem",
      backgroundColor: "white",
      "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
      "&:hover fieldset": { borderColor: "white" },
      "&.Mui-focused fieldset": { borderColor: "white", borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { color: "#6366f1", fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4f46e5" },
    "& input": { color: "#1e1b4b" },
    "& .MuiSelect-select": { color: "#1e1b4b !important" },
    "& .MuiSvgIcon-root": { color: "#6366f1" },
    "& .MuiSelect-icon": { color: "#6366f1" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      {/* Search */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search products…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "#6366f1" }} />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchTerm("")}
                edge="end"
                sx={{ p: 0.25, color: "#6366f1" }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, minWidth: { xs: 0, sm: 180 }, ...whiteInputSx }}
      />

      {/* Category */}
      <FormControl
        variant="outlined"
        size="small"
        sx={{ minWidth: { xs: 110, sm: 150 }, flexShrink: 0, ...whiteInputSx }}
      >
        <InputLabel sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>
          Category
        </InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          label="Category"
          sx={{ color: "#1e1b4b" }}
          MenuProps={{
            PaperProps: { sx: { borderRadius: 2, mt: 0.5 } },
          }}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id} sx={{ fontSize: "0.875rem" }}>
                {cat.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Clear filters */}
      {(searchTerm || selectedCategory) && (
        <IconButton
          size="small"
          onClick={onClearFilters}
          title="Clear filters"
          sx={{
            color: "#6366f1",
            backgroundColor: "white",
            borderRadius: "10px",
            p: 0.75,
            flexShrink: 0,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.85)" },
          }}
        >
          <ClearIcon sx={{ fontSize: 17 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default FilterBar;
