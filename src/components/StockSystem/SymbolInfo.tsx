import React, { useEffect, useMemo, useState } from "react";
import { startCase } from "lodash";
import {
  Card,
  CardContent,
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
  getNextEarning,
  getPricesMode,
  getSelectedSignal,
  getSymbolData,
} from "../../atoms/symbol";
import axios from "axios";
// @ts-ignore
import * as percentage from "calculate-percentages";
import { green, red } from "@mui/material/colors";
import { DateTime } from "luxon";
import ReactECharts from "echarts-for-react";

const API_HOST = import.meta.env.VITE_API_HOST;

const SymbolInfo = () => {
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const byType = useRecoilValue(getByType);
  const priceMode = useRecoilValue(getPricesMode);
  const nextEarning = useRecoilValue(getNextEarning);
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
    if (symbolData !== undefined && symbolData.recommendationsLinesModified) {
      const { minBuy, minSell } =
        symbolData.recommendationsLinesModified.bestPermutation;
      const currentRecommendation =
        symbolData.prices[symbolData.prices.length - 1].recommendation;

      if (currentRecommendation.score > minBuy) {
        return "Strong buy";
      } else if (currentRecommendation.score > 0) {
        return "Buy";
      } else if (currentRecommendation.score < minSell) {
        return "Strong sell";
      } else if (currentRecommendation.score < 0) {
        return "Sell";
      } else {
        return `No decision`;
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
      <div className="SymbolInfo" style={{ overflowY: "auto", flex: "1" }}>
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
                  <span
                    dangerouslySetInnerHTML={{ __html: strategyDescription }}
                  />
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
          <Card
            className="Card-SymbolInfo"
            sx={{ overflowY: "auto", maxHeight: `calc(100vh - 504px)` }}
          >
            {/*<CardHeader*/}
            {/*  title="Indicator info"*/}
            {/*  action={*/}
            {/*    <IconButton onClick={() => setIndicatorInfoDialog(true)}>*/}
            {/*      <InfoIcon />*/}
            {/*    </IconButton>*/}
            {/*  }*/}
            {/*/>*/}
            <CardContent>
              {/*{symbolData?.recommendationBacktest && (*/}
              {/*  <Typography>*/}
              {/*    <b>Indicator Win Rate: </b>*/}
              {/*    {symbolData?.recommendationBacktest.winRate.toFixed(2)}%*/}
              {/*  </Typography>*/}
              {/*)}*/}
              {/*{symbolData?.recommendationBacktest && (*/}
              {/*  <Typography>*/}
              {/*    <b>Indicator Profit: </b>*/}
              {/*    {symbolData?.recommendationBacktest.profit*/}
              {/*      ? symbolData?.recommendationBacktest.profit.toFixed(2)*/}
              {/*      : 0}*/}
              {/*  </Typography>*/}
              {/*)}*/}

              {/*<Typography variant="h6">Recommendations:</Typography>*/}

              {/*<Typography>*/}
              {/*  <b>Action:</b> {getRecommendation()} ({symbolData.prices[symbolData.prices.length - 1].recommendation.score.toFixed(2)})*/}
              {/*</Typography>*/}
              <ReactECharts
                option={{
                  series: [
                    {
                      type: "gauge",
                      startAngle: 180,
                      endAngle: 0,
                      center: ["50%", "50%"],
                      radius: "90%",
                      min: -100,
                      max: 100,
                      // splitNumber: 8,
                      axisLine: {
                        lineStyle: {
                          width: 6,
                          color: [
                            [
                              (symbolData.recommendationsLinesModified
                                .bestPermutation.minSell -
                                -100) /
                                (100 - -100),
                              red[800],
                            ],
                            [0.5, red[400]],
                            [
                              (symbolData.recommendationsLinesModified
                                .bestPermutation.minBuy -
                                -100) /
                                (100 - -100),
                              green[400],
                            ],
                            [1, green[800]],
                          ],
                        },
                      },
                      pointer: {
                        icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
                        length: "12%",
                        width: 20,
                        offsetCenter: [0, "-60%"],
                        itemStyle: {
                          color: "auto",
                        },
                      },
                      axisTick: {
                        length: 12,
                        lineStyle: {
                          color: "auto",
                          width: 2,
                        },
                      },
                      splitLine: {
                        length: 20,
                        lineStyle: {
                          color: "auto",
                          width: 5,
                        },
                      },
                      title: {
                        offsetCenter: [0, "-10%"],
                        fontSize: 20,
                      },
                      detail: {
                        fontSize: 30,
                        offsetCenter: [0, "-35%"],
                        valueAnimation: true,
                        formatter: function (value: number) {
                          return Math.round(value);
                        },
                        color: "inherit",
                      },
                      data: [
                        {
                          value:
                            symbolData.prices[symbolData.prices.length - 1]
                              .recommendation.score,
                          name: getRecommendation(),
                        },
                      ],
                    },
                  ],
                }}
                notMerge={true}
                lazyUpdate={true}
                // style={{ height: "90vh", left: "-5vw", top: 0, width: "85vw" }}
              />
              <div
                className="symbolInfo-reasons"
                style={{ marginTop: "-120px" }}
              >
                <Typography>
                  <b>Stop loss pips: </b>
                  {(
                    symbolData.prices[symbolData.prices.length - 1].point
                      .close -
                    symbolData.prices[symbolData.prices.length - 1]
                      .recommendation.stopLoss
                  ).toFixed(2)}
                </Typography>
                <Typography>
                  <b>Stop loss percentage: </b>
                  {percentage
                    .differenceBetween(
                      symbolData.prices[
                        symbolData.prices.length - 1
                      ].recommendation.stopLoss.toFixed(2),
                      symbolData.prices[symbolData.prices.length - 1].point
                        .close
                    )
                    .toFixed(2)}
                  %
                </Typography>
                {nextEarning && (
                  <Typography>
                    <b>Next earning: </b>
                    {DateTime.fromSeconds(nextEarning).toISODate()} (
                    {DateTime.fromSeconds(nextEarning)
                      .diff(DateTime.now(), "days")
                      .toObject()
                      .days?.toFixed(0)}{" "}
                    Days)
                  </Typography>
                )}
                <Typography>
                  <b>Total scanned permutations: </b>
                  {getTotalScannedPermutations(
                    symbolData.analyzedResult.results[priceMode][byType]
                  )}
                </Typography>
                <br />
                {symbolData &&
                  selectedSignal === undefined &&
                  symbolData?.recommendationsLinesModified && (
                    <Typography>
                      Click on a signal on the indicator to get full details ...
                    </Typography>
                  )}
                {selectedSignal !== undefined && (
                  <>
                    {Boolean(
                      symbolData?.prices[selectedSignal].recommendation
                        .buyReasons.length
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
                                  onClick={() =>
                                    showStrategyModal(strategyName)
                                  }
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
                                  onClick={() =>
                                    showStrategyModal(strategyName)
                                  }
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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



export default SymbolInfo;

