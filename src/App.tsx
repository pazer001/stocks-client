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

const API_HOST = `http://localhost:3000`;

const descriptions: Record<string, string> = {
  RSIOverboughtOversold: `The RSI Overbought/Oversold strategy is a technical analysis trading strategy that uses the Relative Strength Index (RSI) indicator to identify potential buy or sell signals based on market conditions. This strategy is commonly used by professional traders to help identify potential overbought or oversold conditions in the market.

The RSI indicator measures the momentum of price movements over a specified period of time and compares the magnitude of gains to losses. The RSI range typically ranges from 0 to 100, with readings above 70 considered overbought and readings below 30 considered oversold. When the RSI value exceeds the overbought or oversold thresholds, it suggests a potential reversal in the market may occur.

To use this strategy, traders typically look for the RSI to cross above the 70 level, indicating an overbought condition, and then look for a bearish signal such as a bearish divergence or a bearish candlestick pattern. Conversely, when the RSI crosses below the 30 level, indicating an oversold condition, traders may look for a bullish signal such as a bullish divergence or a bullish candlestick pattern.

It is important to note that this strategy should not be used in isolation and should be used in conjunction with other technical indicators and analysis to confirm signals and help identify potential trade opportunities. Additionally, it is crucial to have a solid understanding of risk management and position sizing to help mitigate potential losses in volatile market conditions.`,
  RSIDivergence: `The RSI Divergence strategy is a powerful trading approach used by professional traders to identify potential trend reversals in the market. The strategy is based on the Relative Strength Index (RSI), which is a popular momentum oscillator that measures the strength of price movements over a specific time period.

The RSI Divergence strategy involves looking for divergences between the RSI indicator and the price action. A bullish divergence occurs when the RSI is making higher lows while the price is making lower lows. This indicates that the momentum is starting to shift to the upside, and traders can look for long positions. A bearish divergence occurs when the RSI is making lower highs while the price is making higher highs. This indicates that the momentum is starting to shift to the downside, and traders can look for short positions.

Professional traders using this strategy will often combine it with other technical indicators and chart patterns to confirm potential trading opportunities. They may also use multiple time frames to confirm the divergence signals and increase the probability of success.

It's important to note that the RSI Divergence strategy is not foolproof and can result in false signals. Therefore, professional traders will often use risk management techniques, such as stop-loss orders and position sizing, to limit potential losses. Additionally, traders using this strategy will typically have a deep understanding of technical analysis and market behavior, and will be able to adjust their approach as market conditions change.`,
  RSIMovingAverageCrossover: `The RSI Moving Average Crossover strategy is a popular trading technique used by professional traders to identify potential buy and sell signals in the market. It combines two technical indicators, the Relative Strength Index (RSI) and Moving Average (MA), to provide a more reliable signal.

The RSI measures the momentum of a stock by comparing its average gains to its average losses over a specific period of time. It ranges from 0 to 100 and is considered oversold when it falls below 30 and overbought when it rises above 70. The Moving Average, on the other hand, calculates the average price of a security over a given period of time and is used to identify the trend of the stock.

To use the RSI Moving Average Crossover strategy, a trader would first plot both the RSI and MA indicators on a chart for the desired stock or security. The trader would then wait for the RSI to cross above or below the MA line to identify potential buy or sell signals.

A bullish signal occurs when the RSI crosses above the MA line, indicating that the stock is gaining momentum and may continue to rise. A bearish signal occurs when the RSI crosses below the MA line, indicating that the stock is losing momentum and may continue to fall.

It is important for professional traders to carefully analyze the stock's trend, volatility, and other technical indicators in addition to the RSI and MA before making any trading decisions. Additionally, risk management strategies should always be in place to limit potential losses.`,
  RSIDoubleBottomTop: `(RSI) is a momentum oscillator that measures the strength of a security's price action, and is used in conjunction with a double bottom or double top chart pattern.

To implement this strategy, traders first identify a double bottom or double top pattern on the price chart. A double bottom is a bullish reversal pattern that occurs when a security's price creates two consecutive lows that are roughly equal, with a moderate high in between. Conversely, a double top is a bearish reversal pattern that occurs when a security's price creates two consecutive highs that are roughly equal, with a moderate low in between.

Once the double bottom or double top pattern has been identified, traders look for confirmation of a potential reversal by analyzing the RSI. For a double bottom, the RSI should show bullish divergence, which means that the RSI creates a higher low while the price creates a double bottom. This indicates that the selling pressure is weakening, and the bulls may be taking control. Conversely, for a double top, the RSI should show bearish divergence, which means that the RSI creates a lower high while the price creates a double top. This indicates that the buying pressure is weakening, and the bears may be taking control.

Once the double bottom or double top pattern has been confirmed by the RSI divergence, traders can enter a long position for a double bottom or a short position for a double top. A stop-loss order should be placed below the double bottom or above the double top, and a profit target should be set at a level that offers a favorable risk-to-reward ratio.

It is important to note that this strategy is not foolproof and should be used in conjunction with other technical and fundamental analysis tools to make informed trading decisions. Additionally, traders should always use proper risk management techniques and not risk more than they can afford to lose.`,
  SMACross: `The SMA Cross strategy is a popular technical trading strategy used by professional traders to identify potential trading opportunities in the financial markets. It involves using two moving averages of different time periods to identify potential changes in the trend of an asset's price.

The first moving average is a short-term average, typically using a period of 20 days or less, which helps to identify short-term changes in the price trend. The second moving average is a longer-term average, typically using a period of 50 days or more, which helps to identify longer-term changes in the price trend.

The strategy involves looking for a crossover of these two moving averages. When the short-term moving average crosses above the long-term moving average, it is seen as a bullish signal and indicates that the price trend is likely to continue higher. Conversely, when the short-term moving average crosses below the long-term moving average, it is seen as a bearish signal and indicates that the price trend is likely to continue lower.

Professional traders may use additional indicators or filters to confirm the validity of a signal generated by the SMA Cross strategy, such as volume or momentum indicators. They may also use the strategy on multiple timeframes to identify potential trading opportunities across different timeframes.

It is important to note that like any trading strategy, the SMA Cross strategy is not foolproof and can result in false signals. Professional traders will use risk management techniques such as stop-loss orders to limit potential losses in the event that a trade does not work out as expected.`,
  AwesomeOscillatorTwinPeaks: `The Awesome Oscillator Twin Peaks strategy is a trading strategy used by professional traders to identify trend reversals in financial markets. The strategy is based on the Awesome Oscillator, which is a technical analysis indicator that measures the momentum of a security over a specified period.

The Twin Peaks strategy involves looking for two peaks in the Awesome Oscillator histogram, with the second peak being lower than the first. The peaks represent a bullish trend, while the troughs between them indicate a bearish trend. When the second peak is lower than the first, it signals a potential trend reversal.

Traders using this strategy typically wait for a confirmation of the reversal by waiting for the histogram to cross the zero line. If the histogram crosses the zero line from above, it indicates a sell signal, and if it crosses from below, it indicates a buy signal. Traders may also use other technical indicators, such as moving averages or trend lines, to further confirm the reversal.

The Awesome Oscillator Twin Peaks strategy is most effective in trending markets, and it is often used in conjunction with other technical indicators and fundamental analysis to develop a comprehensive trading strategy. It requires patience, discipline, and a thorough understanding of technical analysis principles, making it suitable for professional traders with significant experience in the financial markets.`,
  AwesomeOscillatorSaucer: `The Awesome Oscillator Saucer strategy is a technical analysis approach designed for professional traders to identify trend reversals in the market. The Awesome Oscillator is a popular technical indicator developed by Bill Williams to measure market momentum, and the saucer pattern is used to identify a shift in the trend.

The saucer pattern is formed when the Awesome Oscillator bars move from negative to positive values, indicating a shift from bearish to bullish sentiment. The saucer pattern is complete when the bars move back to the zero line, indicating a period of consolidation before a new trend emerges.

To use the Awesome Oscillator Saucer strategy, traders would look for the formation of the saucer pattern, and wait for a confirmation of the reversal before taking a position. This confirmation could be in the form of a break above a key resistance level, or a bullish candlestick pattern.

Traders should also use other technical indicators and chart patterns to confirm the reversal, such as the Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), or Fibonacci retracement levels. This will help to reduce false signals and increase the probability of a successful trade.

In summary, the Awesome Oscillator Saucer strategy is a technical analysis approach designed for professional traders to identify trend reversals in the market. Traders should look for the formation of the saucer pattern, and use other technical indicators and chart patterns to confirm the reversal before taking a position.`,
};

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
  recommendationBacktest: {
    bestPermutation: {
      minBuy: number;
      minSell: number;
    };
    winRate: number;
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

  const analyzeSymbol = async (): Promise<Promise<SymbolData> | undefined> => {
    if (!symbol) return;

    const symbolAnalyze: AxiosResponse<SymbolData> = await axios.get(
      `${API_HOST}/analyze/analyzedResult/${symbol}/1d`
    );

    if (!symbolAnalyze || !symbolAnalyze.data) {
      setLoadingSymbolData(true);
      return;
    }

    setSymbolData((prevSymbolData) => symbolAnalyze.data);
    // @ts-ignore
    setStockChartOptions((prevStockChartOptions) => ({
      ...prevStockChartOptions,
      title: {
        text: `${symbol} Chart`,
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
          plotLines: [
            {
              value:
                symbolAnalyze.data.recommendationBacktest.bestPermutation
                  .minBuy,
              color: "green",
              dashStyle: "shortdash",
              width: 2,
              label: {
                text: "Buy",
                color: "white",
              },
            },
            {
              value:
                symbolAnalyze.data.recommendationBacktest.bestPermutation
                  .minSell,
              color: "red",
              dashStyle: "shortdash",
              width: 2,
              label: {
                text: "Sell",
                color: "white",
              },
            },
          ],
        },
      ],
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
    setLoadingSymbolData((prevLoadingSymbolData) => false);
    return symbolAnalyze.data;
  };

  useEffect(() => {
    const getSupportedSymbols = async () => {
      const supportedSymbolsResult: AxiosResponse<Array<string>> =
        await axios.get(`${API_HOST}/analyze/supportedSymbols`);

      setSupportedSymbols(
        supportedSymbolsResult.data.map((symbol: string) => ({
          label: symbol,
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
                          <Typography>
                            <b>Description:</b> {descriptions[strategyName]}
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
