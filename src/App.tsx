import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  CardHeader,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/highstock";
import HighContrastDark from "highcharts/themes/high-contrast-dark";
import AnnotationsModule from "highcharts/modules/annotations";
import Grid2 from "@mui/material/Unstable_Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "@emotion/styled";
import { startCase } from "lodash";

AnnotationsModule(HighchartsStock);
HighContrastDark(HighchartsStock);

const HighchartsStyle = styled.div``;

interface SymbolData {
  prices: Array<{
    point: {
      adjClose: number;
      close: number;
      timestamp: number;
      high: number;
      low: number;
      open: number;
      volume: number;
    };
    recommendation: Recommendation;
  }>;
  analyzedResult: {
    interval: string;
    symbol: string;
    results: Record<
      string,
      {
        plAmount: number;
        bestPermutation: Record<string, number>;
        scannedPermutations: number;
        winRate: number;
      }
    >;
  };
}

interface Recommendation {
  buyCount: number;
  buyReasons: Array<string>;
  sellCount: number;
  sellReasons: Array<string>;
  buySellSum: number;
  winRateScore: number;
}

enum RecommendationType {
  neutral,
  buy,
  sell,
}

interface ISupportedSymbols {
  label: string;
}


function App() {
  const [symbol, setSymbol] = useState<string>("");
  const [symbolData, setSymbolData] = useState<SymbolData>();
  const [loadingSymbolData, setLoadingSymbolData] = useState<boolean>(false);
  const [selectedSignal, setSelectedSignal] = useState();
  const [supportedSymbols, setSupportedSymbols] = useState<
    Array<ISupportedSymbols>
  >([]);

  const onStockInputChange = (e: any, symbol: ISupportedSymbols) => {
    setSymbol(symbol.label);
  };

  const analyzeSymbol = async (): Promise<Promise<SymbolData> | undefined> => {
    if (!symbol) return;

    const symbolAnalyze: AxiosResponse<SymbolData> = await axios.get(
      `http://stockserver-env.eba-mrsmcfgs.eu-north-1.elasticbeanstalk.com/analyze/analyzedResult/${symbol}/1d`
    );

    if (!symbolAnalyze || !symbolAnalyze.data) {
      setLoadingSymbolData(true);
      return;
    }

    setSymbolData(symbolAnalyze.data);
    // @ts-ignore
    setStockChartOptions((prevStockChartOptions) => ({
      ...prevStockChartOptions,
      title: {
        text: `${symbol} Chart`,
      },

      series: [
        {
          upColor: `green`,
          // downColor: "red",
          type: "candlestick",
          name: symbol,
          data: symbolAnalyze.data.prices.map((data) => [
            data.point.timestamp,
            data.point.open,
            data.point.high,
            data.point.low,
            data.point.close,
          ]),
          yAxis: 0,
          // allowPointSelect: true,
          colors: symbolAnalyze.data.prices.map((data, index) => {
            if (
              symbolAnalyze.data.prices[index - 1] &&
              symbolAnalyze.data.prices[index].point.close >
                symbolAnalyze.data.prices[index - 1].point.close
            ) {
              return `green`;
            } else {
              return `red`;
            }
          }),
        },
        {
          type: "area",
          name: "Score",
          data: symbolAnalyze.data.prices.map((data) => [
            data.point.timestamp,
            Number(data.recommendation.winRateScore.toFixed()),
          ]),
          yAxis: 1,
        },
      ],
    }));
    setLoadingSymbolData(false);
    return symbolAnalyze.data;
  };

  useEffect(() => {
    const getSupportedSymbols = async () => {
      const supportedSymbolsResult: AxiosResponse<Array<{ symbol: string }>> =
        await axios.get(`http://stockserver-env.eba-mrsmcfgs.eu-north-1.elasticbeanstalk.com/analyze/supportedSymbols`);

      setSupportedSymbols(
        supportedSymbolsResult.data.map((item: { symbol: any }) => ({
          label: item.symbol,
        }))
      );
    };

    getSupportedSymbols();
  }, []);

  const [stockChartOptions, setStockChartOptions] = useState({
    chart: {
      height: `30%`,
      // width: "70%",
    },
    plotOptions: {
      series: {
        colorByPoint: true,
        point: {
          events: {
            mouseOver: function () {
              // @ts-ignore
              const index = this.index;
              setSelectedSignal(index);
            },
          },
        },
      },
      column: {
        colorByPoint: true,
      },
      area: {
        marker: {
          enabled: false,
          symbol: "circle",
          radius: 2,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
    },
    yAxis: [
      {
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "Stock",
        },
        height: "60%",
        lineWidth: 2,
        resize: {
          enabled: true,
        },
      },
      {
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "Win Rate Score",
        },
        top: "65%",
        height: "35%",
        offset: 0,
        lineWidth: 2,
      },
    ],
  });

  return (
    <>
      <Grid2
        container
        spacing={2}
        display="flex"
        justifyContent="start"
        alignItems="center"
      >
        <Grid2 xs={2}>
          <Autocomplete
            onChange={(e, value) => setSymbol(value ? value.label : "")}
            disablePortal
            options={supportedSymbols}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Symbol" />}
          />
        </Grid2>
        <Grid2 xs={2}>
          <Button variant="contained" onClick={analyzeSymbol} size="large">
            Analyze
          </Button>
        </Grid2>
        <Grid2 xs={1}>
          {loadingSymbolData && <CircularProgress color="info" />}
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 xs={12}>
          <Paper>
            <HighchartsStyle>
              <HighchartsReact
                constructorType={"stockChart"}
                highcharts={HighchartsStock}
                options={stockChartOptions}
              />
            </HighchartsStyle>
          </Paper>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 xs={6}>
          <Paper>
            <Typography variant="h5">Strategies results:</Typography>
            {symbolData &&
              Object.keys(symbolData?.analyzedResult?.results).map(
                (strategyName) => {
                  const {
                    bestPermutation,
                    scannedPermutations,
                    plAmount,
                    winRate,
                  } = symbolData?.analyzedResult?.results[strategyName];

                  if (!bestPermutation) return null;

                  return (
                    <Paper key={strategyName}>
                      <Card>
                        <CardHeader
                          title={startCase(strategyName)}
                        ></CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            <b>Best Permutation:</b> [
                            {Object.keys(bestPermutation)
                              .map(
                                (param) => `${param}: ${bestPermutation[param]}`
                              )
                              .join(", ")}
                            ]
                          </Typography>
                          <Typography variant="body2">
                            <b>scanned Permutations:</b>
                            {scannedPermutations}
                          </Typography>
                          <Typography variant="body2">
                            <b>PL Amount:</b>
                            {plAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="body2">
                            <b>Win Rate:</b>
                            {winRate.toFixed(2)}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Paper>
                  );
                }
              )}
          </Paper>
        </Grid2>
        <Grid2 xs={6}>
          {symbolData && selectedSignal && (
            <Paper>
              <Typography variant="body2">
                <b>Reasons to buy:</b>{" "}
                {symbolData?.prices[selectedSignal].recommendation.buyReasons
                  .map((reason) => startCase(reason))
                  .join(", ")}
              </Typography>
              <Typography variant="body2">
                <b>Reasons to sell:</b>{" "}
                {symbolData?.prices[selectedSignal].recommendation.sellReasons
                  .map((reason) => startCase(reason))
                  .join(", ")}
              </Typography>
            </Paper>
          )}
        </Grid2>
      </Grid2>
    </>
  );
}

export default App;
