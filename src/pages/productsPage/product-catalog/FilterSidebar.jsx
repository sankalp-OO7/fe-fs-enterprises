import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { styled, alpha } from "@mui/material/styles";

// Styled Paper for the horizontal bar
const FilterPaper = styled(Paper)(({ theme }) => ({
  // Ensure the paper component always takes the full available width
  width: "100%",

  // Reduced padding for a less bulky, bar-like appearance
  padding: theme.spacing(2, 3),
  borderRadius: "16px", // Slightly smaller radius
  // Simplified background for a clean bar look
  background:
    theme.palette.mode === "light"
      ? "white"
      : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: "blur(8px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",

  // Removed explicit flex rules here; relying on the inner Stack for responsive layout
}));

// Styled TextField remains useful
const StyledTextField = styled(TextField)(({ theme }) => ({
  // We remove fixed min/max width here and let responsive props handle it in the component
  flexGrow: 1,

  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    transition: "all 0.3s ease",
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      "& > fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "&.Mui-focused": {
      "& > fieldset": {
        borderWidth: "2px",
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

// Renamed to FilterBar to reflect its new purpose
const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredCount,
  onClearFilters,
}) => {
  const theme = useTheme();
  return (
    <FilterPaper elevation={0}>
      {/* Main Responsive Container Stack 
        Switches between vertical (column) stacking on mobile (xs) and horizontal (row) on desktop (md) 
      */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ xs: "stretch", md: "center" }} // Stretch items to 100% width on mobile
        sx={{ width: "100%" }}
      >
        {/* The Title is now conditionally displayed using responsive sx props */}
        <Typography
          variant="h6"
          sx={{
            // Hide on extra-small screens, show on medium screens and up
            display: { xs: "none", md: "block" },
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "text.primary",
            mr: 3,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Product Filters
        </Typography>

        {/* Filter Controls Stack (Handles Search, Category, Clear) */}
        <Stack
          // This inner stack allows Search/Category/Clear to attempt a row layout on tablets (sm+)
          // but forces a column layout on small phones (xs) if space is limited.
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }} // Ensures full width inputs on mobile
          sx={{ flexGrow: 1, width: { xs: "100%", md: "auto" } }}
        >
          <StyledTextField
            label="Search Products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            placeholder="Type to search..."
            sx={{
              flexGrow: 1,
              // Ensure full width on mobile, and a healthy minimum width on larger screens
              minWidth: { xs: "100%", sm: 200 },
            }}
          />

          <FormControl
            variant="outlined"
            size="small"
            sx={{
              // Ensure full width on mobile, fixed width on tablets/desktop
              minWidth: { xs: "100%", sm: 180 },
              flexShrink: 0,
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              sx={{
                borderRadius: "12px",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {(searchTerm || selectedCategory) && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              sx={{
                borderRadius: "12px",
                px: 2,
                fontWeight: 600,
                textTransform: "none",
                flexShrink: 0,
                // Make the button full width on mobile for easier tapping, auto on desktop
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {/* Filtered Count Display */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          // Center the count text on mobile, align to the left on desktop
          justifyContent={{ xs: "center", md: "flex-start" }}
          sx={{
            py: 1,
            px: 2,
            borderRadius: "12px",
            background: "linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%)",
            border: "1px solid rgba(33, 150, 243, 0.2)",
            flexShrink: 0,
            // Ensure full width on mobile, with spacing adjusted
            width: { xs: "100%", md: "auto" },
            mt: { xs: 2, md: 0 }, // Add top margin on mobile to separate it from controls
            ml: { xs: 0, md: 3 }, // Remove left margin on mobile
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: "primary.main" }}
          >
            {filteredCount}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Found
          </Typography>
        </Stack>
      </Stack>
    </FilterPaper>
  );
};

export default FilterBar;
