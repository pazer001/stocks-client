import "./App.css";
import React from "react";
import { Box, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Chart from "./components/StockSystem/Chart";
import SymbolsList from "./components/StockSystem/SymbolsList";
import SymbolInfo from "./components/StockSystem/SymbolInfo";
import Toolbox from "./components/StockSystem/Toolbox";
import { getMainLoaderShow } from "./atoms/view";
import { useRecoilValue } from "recoil";

function App() {
  const mainLoaderShow = useRecoilValue(getMainLoaderShow);
  return (
    <>
      {mainLoaderShow && (
        <LinearProgress sx={{ position: "fixed", width: "100%" }} />
      )}
      <Grid
        container
        sx={{ height: "100vh", width: "100%" }}
        direction="column"
      >
        <Grid item sx={{ height: "6%" }}>
          <Toolbox />
        </Grid>
        <Grid item sx={{ height: "94%" }}>
          <Grid container spacing={1} sx={{ height: "100%" }}>
            <Grid item xs={9} md={9}>
              <Paper>
                <Chart />
              </Paper>
            </Grid>
            <Grid item xs={3} md={3}>
              <Grid container direction="column">
                <Grid item xs md sx={{ height: "50%" }}>
                  <Paper>
                    <SymbolsList />
                  </Paper>
                </Grid>
                <Grid item xs md sx={{ height: "44%" }}>
                  <Paper>
                    <SymbolInfo />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
