import React from "react";
import {
  Container,
  Box,
  Grid,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";

const LoadingSkeleton = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Skeleton
        variant="rectangular"
        height={160}
        sx={{ borderRadius: "24px", mb: 4 }}
      />
      <Grid container spacing={4}>
        <Grid item xs={12} lg={3}>
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: "24px" }}
          />
        </Grid>
        <Grid item xs={12} lg={9}>
          <Skeleton width={300} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={6} lg={3}>
                <Card sx={{ borderRadius: "20px" }}>
                  <Skeleton variant="rectangular" height={240} />
                  <CardContent>
                    <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={20} sx={{ mb: 2 }} />
                    <Skeleton width="100%" height={80} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoadingSkeleton;
