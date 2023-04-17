import React, { useEffect, useMemo, useState } from "react";
import { startCase } from "lodash";
import {
  Box,
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
  getSelectedSignal,
  getSymbolData,
} from "../../atoms/symbol";
import axios from "axios";

const API_HOST = `http://85.64.194.77:3000`;
const SymbolInfo = () => {
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const byType = useRecoilValue(getByType);
  const [strategyName, setStrategyName] = useState<string>("");
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);
  const [strategyDescription, setStrategyDescription] = useState<string>("");

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
                  symbolData.analyzedResult.results[byType][strategyName]
                    .bestPermutation
                )
                  .map(
                    (param) =>
                      `${startCase(param)}: ${
                        symbolData.analyzedResult.results[byType][strategyName]
                          .bestPermutation[param]
                      }`
                  )
                  .join(", ")}
                ]
              </DialogContentText>
              <DialogContentText>
                <b>Scanned Permutations: </b>
                {new Intl.NumberFormat().format(
                  symbolData.analyzedResult.results[byType][strategyName]
                    .scannedPermutations
                )}
              </DialogContentText>
              <DialogContentText>
                <b>Win Rate: </b>
                {symbolData.analyzedResult.results[byType][
                  strategyName
                ].winRate.toFixed(2)}
                %
              </DialogContentText>
              <DialogContentText>
                <b>Description: </b>{" "}
                {strategyDescription
                  .split(".")
                  .filter((_) => _)
                  .map((sentence) => (
                    <>
                      {sentence}.
                      <br />
                      <br />
                    </>
                  ))}
              </DialogContentText>
            </DialogContent>
          </Dialog>
        )}
        <Card sx={{ overflowY: "scroll", height: "47vh" }}>
          <CardContent>
            {symbolData !== undefined && (
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
              </>
            )}
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
                  symbolData?.prices[selectedSignal].recommendation.sellReasons
                    .length
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
      </>
    ),
    [
      symbolData,
      strategyModalOpen,
      strategyName,
      selectedSignal,
      byType,
      strategyName,
    ]
  );
};

const SymbolInfoHelper = () => {};

export default SymbolInfo;
