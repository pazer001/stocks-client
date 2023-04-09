import "./App.css";
import React from "react";
import { Paper } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
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
      <Grid2
        container
        sx={{ height: "100vh", width: "100%" }}
        direction="column"
      >
        <Grid2 sx={{ height: "5%" }}>
          <Toolbox />
        </Grid2>
        <Grid2 sx={{ height: "95%" }}>
          <Grid2 container spacing={1} sx={{ height: "100%" }}>
            <Grid2 xs={10} md={10}>
              <Paper>
                <Chart />
              </Paper>
            </Grid2>
            <Grid2 xs={2} md={2}>
              <Grid2 container direction="column">
                <Grid2 xs md>
                  <Paper>
                    <SymbolsList />
                  </Paper>
                </Grid2>
                <Grid2 xs md>
                  <Paper>
                    <SymbolInfo />
                  </Paper>
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </>
  );
}

export default App;
