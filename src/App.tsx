import "./App.css";
import React from "react";
import { Alert, Box, Divider, Paper, Snackbar } from "@mui/material";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Chart from "./components/StockSystem/Chart";
import SymbolsList from "./components/StockSystem/SymbolsList";
import SymbolInfo from "./components/StockSystem/SymbolInfo";
import Toolbox from "./components/StockSystem/Toolbox";
import { getAlertMessage, getAlertShow, getMainLoaderShow } from "./atoms/view";
import { useRecoilValue } from "recoil";

function App() {
  const mainLoaderShow = useRecoilValue(getMainLoaderShow);
  const alertShow = useRecoilValue(getAlertShow);
  const alertMessage = useRecoilValue(getAlertMessage);
  return (
    <>
      {mainLoaderShow && (
        <LinearProgress sx={{ position: "fixed", width: "100%" }} />
      )}

      <Snackbar open={alertShow}>
        <Alert severity="error">{alertMessage}</Alert>
      </Snackbar>
      <Grid
        container
        sx={{ height: "100vh", width: "100%" }}
        direction="column"
      >
        <Grid item sx={{ minHeight: "6vh" }}>
          <Toolbox />
        </Grid>
        <Grid item sx={{ height: "94vh" }}>
          <Grid container spacing={1} sx={{ height: "100%" }}>
            <Grid item xs={9} md={9}>
              <Paper sx={{ height: "100%", width: "100%" }}>
                <Chart />
              </Paper>
            </Grid>
            <Grid item xs={3} md={3}>
              <Grid container direction="column">
                <Grid item xs md sx={{ height: "47vh" }}>
                  <Paper>
                    <SymbolsList />
                  </Paper>
                </Grid>
                {/*<Divider />*/}
                <Grid item xs md sx={{ height: "45vh", marginTop: "1vh" }}>
                  <Paper sx={{ height: "100%", overflowY: "scroll" }}>
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
