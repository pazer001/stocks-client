import React, { useEffect, useMemo, useState } from "react";
import { startCase } from "lodash";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useRecoilValue } from "recoil";
import {
  getByType,
  getPricesMode,
  getSelectedSignal,
  getSymbolData,
} from "../../atoms/symbol";
import axios from "axios";

const API_HOST = import.meta.env.VITE_API_HOST;

const SymbolInfo = () => {
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const byType = useRecoilValue(getByType);
  const priceMode = useRecoilValue(getPricesMode);
  const [strategyName, setStrategyName] = useState<string>("");
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);
  const [strategyDescription, setStrategyDescription] = useState<string>("");
  const [indicatorInfoDialog, setIndicatorInfoDialog] =
    useState<boolean>(false);

  useEffect(() => {
    const getStrategyDescription = async () => {
      if (strategyName) {
        try {
          const strategyDescriptionResult = await axios.get(
            `${API_HOST}/strategies/strategyDescription/${strategyName}`
          );
          const strategyDescription =
            strategyDescriptionResult.data.description;
          setStrategyDescription(strategyDescription);
        } catch (e) {
          console.error(e);
        }
      }
    };

    getStrategyDescription();
  }, [strategyName]);

  // if (!symbolData) return null;
  const showStrategyModal = (strategyName: string) => {
    setStrategyName(() => strategyName);
    setStrategyModalOpen(() => true);
  };
  const getRecommendation = () => {
    if (symbolData !== undefined && symbolData.recommendationBacktest) {
      const { minBuy, minSell } =
        symbolData.recommendationBacktest.bestPermutation;
      const currentRecommendation =
        symbolData.prices[symbolData.prices.length - 1].recommendation;

      if (currentRecommendation.score > minBuy) {
        return `Strong buy`;
      } else if (currentRecommendation.score > 0) {
        return `Buy`;
      } else if (currentRecommendation.score < minSell) {
        return `Strong sell`;
      } else if (currentRecommendation.score < 0) {
        return `Sell`;
      } else {
        return `Hold`;
      }
    } else {
      return `Not enough data`;
    }
  };

  const getTotalScannedPermutations = (strategies: any) => {
    if (!strategies) return 0;
    let totalScannedPermutation = 0;

    for (let strategyName in strategies) {
      const strategyData = strategies[strategyName];

      totalScannedPermutation += strategyData.scannedPermutations;
    }

    return totalScannedPermutation.toLocaleString("en-US");
  };

  return useMemo(
    () => (
      <>
        {symbolData && strategyModalOpen && strategyName && (
          <Dialog open={strategyModalOpen} onClose={() => setStrategyName("")}>
            <DialogTitle>{startCase(strategyName)}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <b>Best Permutation:</b> [
                {Object.keys(
                  symbolData.analyzedResult.results[priceMode][byType][
                    strategyName
                  ].bestPermutation
                )
                  .map(
                    (param) =>
                      `${startCase(param)}: ${
                        symbolData.analyzedResult.results[priceMode][byType][
                          strategyName
                        ].bestPermutation[param]
                      }`
                  )
                  .join(", ")}
                ]
              </DialogContentText>
              <DialogContentText>
                <b>Scanned Permutations: </b>
                {new Intl.NumberFormat().format(
                  symbolData.analyzedResult.results[priceMode][byType][
                    strategyName
                  ].scannedPermutations
                )}
              </DialogContentText>
              <DialogContentText>
                <b>Win Rate: </b>
                {symbolData.analyzedResult.results[priceMode][byType][
                  strategyName
                ].winRate.toFixed(2)}
                %
              </DialogContentText>
              {strategyDescription && (
                <DialogContentText>
                  <b>Description: </b>{" "}
                  {strategiesDescriptionsComponents[strategyName]}
                </DialogContentText>
              )}
            </DialogContent>
          </Dialog>
        )}

        <IndicatorInfoDialog
          open={indicatorInfoDialog}
          onClose={() => setIndicatorInfoDialog(false)}
        />

        {symbolData && (
          <Card sx={{ overflowY: "scroll", height: "47vh" }}>
            <CardHeader
              title="Indicator info"
              action={
                <IconButton onClick={() => setIndicatorInfoDialog(true)}>
                  <InfoIcon />
                </IconButton>
              }
            />
            <CardContent>
              {
                <>
                  {symbolData?.recommendationBacktest && (
                    <Typography>
                      <b>Indicator Win Rate: </b>
                      {symbolData?.recommendationBacktest.winRate.toFixed(2)}%
                    </Typography>
                  )}
                  {symbolData?.recommendationBacktest && (
                    <Typography>
                      <b>Indicator Profit: </b>
                      {symbolData?.recommendationBacktest.profit
                        ? symbolData?.recommendationBacktest.profit.toFixed(2)
                        : 0}
                    </Typography>
                  )}
                  <Typography>
                    <b>Indicator recommendations:</b> {getRecommendation()}
                  </Typography>

                  <Typography>
                    <b>Based on: </b>
                    {symbolData?.recommendationBacktest.totalTrades} trades
                  </Typography>
                  <Typography>
                    <b>Total scaned permutations: </b>
                    {getTotalScannedPermutations(
                      symbolData.analyzedResult.results[priceMode][byType]
                    )}
                  </Typography>
                </>
              }
              <br />
              {symbolData &&
                selectedSignal === undefined &&
                symbolData?.recommendationBacktest && (
                  <Typography>
                    Click on a signal on the indicator to get full details ...
                  </Typography>
                )}
              {selectedSignal !== undefined && (
                <>
                  {Boolean(
                    symbolData?.prices[selectedSignal].recommendation.buyReasons
                      .length
                  ) && (
                    <>
                      <b>Reasons to buy:</b>{" "}
                      <List dense disablePadding>
                        {symbolData?.prices[
                          selectedSignal
                        ].recommendation.buyReasons.map(
                          (strategyName: string) => (
                            <ListItem key={strategyName} dense disablePadding>
                              <ListItemIcon
                                onClick={() => showStrategyModal(strategyName)}
                              >
                                <IconButton>
                                  <InfoIcon />
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText
                                primary={startCase(strategyName)}
                              ></ListItemText>
                            </ListItem>
                          )
                        )}
                      </List>
                    </>
                  )}
                  {Boolean(
                    symbolData?.prices[selectedSignal].recommendation
                      .sellReasons.length
                  ) && (
                    <>
                      <b>Reasons to sell:</b>{" "}
                      <List dense disablePadding>
                        {symbolData?.prices[
                          selectedSignal
                        ].recommendation.sellReasons.map(
                          (strategyName: string) => (
                            <ListItem key={strategyName} dense disablePadding>
                              <ListItemIcon
                                onClick={() => showStrategyModal(strategyName)}
                              >
                                <IconButton>
                                  <InfoIcon />
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText
                                primary={startCase(strategyName)}
                              ></ListItemText>
                            </ListItem>
                          )
                        )}
                      </List>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </>
    ),
    [
      symbolData,
      strategyModalOpen,
      strategyName,
      selectedSignal,
      byType,
      strategyName,
      indicatorInfoDialog,
      strategyDescription,
    ]
  );
};

interface IIndicatorInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const IndicatorInfoDialog = (props: IIndicatorInfoDialogProps) => {
  const { open, onClose } = props;
  return useMemo(
    () => (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Indicator Info</DialogTitle>
        <DialogContent>
          After collecting data from various strategies, an accumulation
          indicator is generated that summarizes the results of the strategies.{" "}
          <br />
          A logical approach is to initiate a long trade when the indicator
          value is greater than 0 and to sell when it is less than 0. <br />
          However, we conduct additional backtesting on the accumulation
          indicator to determine the optimal threshold for buying/selling.{" "}
          <br /> <br />
          The outcome is represented by two lines - green and red - along with
          corresponding Win Rate/Profit values. <br />
          These metrics are derived from a subset of trades where the buy signal
          was above the green line and the sell signal was below the red line.
        </DialogContent>
      </Dialog>
    ),
    [open, onClose]
  );
};

const SymbolInfoHelper = () => {};

export default SymbolInfo;

const RSIOverboughtOversold = () => {
  return (
    <>
      The Relative Strength Index (RSI) is a powerful momentum-based technical
      analysis indicator developed by J. Welles Wilder in 1978. It is widely
      used by professional traders to identify overbought and oversold
      conditions in the market, helping to generate buy and sell signals. This
      document outlines the key concepts of the RSI Overbought Oversold Strategy
      and provides specific buy and sell rules for professional traders to
      implement and benefit from this approach.
      <br />
      <br />
      <b>I. RSI Overview</b>
      <br />
      The RSI is a momentum oscillator that measures the speed and change of
      price movements. It ranges from 0 to 100 and is calculated by comparing
      the average gain and average loss over a specified period, typically 14
      periods. The RSI helps traders to identify potential trend reversals and
      gauge the strength of the underlying trend.
      <br />
      <br />
      <b>II. Overbought and Oversold Levels</b>
      <br />
      An asset is considered overbought when the RSI exceeds a predefined
      threshold, typically 70, suggesting that it may be overvalued and due for
      a price correction. Conversely, an asset is considered oversold when the
      RSI falls below a predefined threshold, typically 30, indicating that it
      may be undervalued and due for a price rebound. These levels can be
      adjusted based on the trader's risk tolerance and the specific
      characteristics of the asset being analyzed.
      <br />
      <br />
      <b>III. RSI Overbought Oversold Strategy</b>
      <br />
      The RSI Overbought Oversold Strategy involves generating buy and sell
      signals based on the RSI crossing predefined overbought and oversold
      levels. The exact rules for entering and exiting trades are as follows:
      <br />
      <br />
      <b>Buy Rules:</b>
      <br />
      1. The RSI crosses below the oversold level (e.g., 30). 2. Wait for the
      RSI to rise back above the oversold level. 3. Enter a long position (buy)
      when the RSI moves above the oversold level.
      <br />
      <br />
      <b>Sell Rules:</b>
      <br />
      1. The RSI crosses above the overbought level (e.g., 70). 2. Wait for the
      RSI to fall back below the overbought level. 3. Enter a short position
      (sell) when the RSI moves below the overbought level.
      <br />
      <br />
      <b>IV. Additional Considerations</b>
      <br />
      1. Timeframe: The RSI Overbought Oversold Strategy can be applied to
      various timeframes, from intraday to daily or weekly charts. However, it
      is important to consider that lower timeframes may generate more false
      signals due to increased market noise. 2. Risk Management: As with any
      trading strategy, it is essential to apply strict risk management
      principles, such as setting stop losses and position sizing appropriately.
      3. Confirmation Signals: To increase the reliability of the RSI Overbought
      Oversold Strategy, traders can look for additional confirmation signals,
      such as price action patterns, support and resistance levels, or other
      technical indicators.
      <br />
      <br />
      <b>Conclusion</b>
      <br />
      The RSI Overbought Oversold Strategy is a simple yet effective trading
      approach that helps professional traders identify potential market
      reversals by utilizing the RSI indicator. By following the outlined buy
      and sell rules and incorporating additional considerations, traders can
      benefit from the opportunities presented by overbought and oversold market
      conditions. As always, strict risk management and ongoing education are
      essential components of a successful trading career.
    </>
  );
};

const strategiesDescriptionsComponents: Record<string, any> = {
  RSIOverboughtOversold: <RSIOverboughtOversold />,
};
