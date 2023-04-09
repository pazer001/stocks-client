import React, { useMemo, useState } from "react";
import { startCase } from "lodash";
import {
  Box,
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
import { getSelectedSignal, getSymbolData } from "../../atoms/symbol";

const SymbolInfo = () => {
  const symbolData = useRecoilValue(getSymbolData);
  const selectedSignal = useRecoilValue(getSelectedSignal);
  const [strategyResultModal, setStrategyResult] = useState<string>("");
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);

  const showStrategyModal = (strategyName: string) => {
    setStrategyResult(() => strategyName);
    setStrategyModalOpen(() => true);
  };
  const getRecommendation = () => {
    if (symbolData !== undefined) {
      const { minBuy, minSell } =
        symbolData.recommendationBacktest.bestPermutation;
      const currentRecommendation =
        symbolData.prices[symbolData.prices.length - 1].recommendation;

      if (currentRecommendation.score > minBuy) {
        return `Buy`;
      } else if (currentRecommendation.score < minSell) {
        return `Sell`;
      } else {
        return `Hold`;
      }
    }
  };

  return useMemo(
    () => (
      <>
        {symbolData && strategyModalOpen && strategyResultModal && (
          <Dialog
            open={strategyModalOpen}
            onClose={() => setStrategyResult("")}
          >
            <DialogTitle>{startCase(strategyResultModal)}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <b>Best Permutation:</b> [
                {Object.keys(
                  symbolData.analyzedResult.results[strategyResultModal]
                    .bestPermutation
                )
                  .map(
                    (param) =>
                      `${startCase(param)}: ${
                        symbolData.analyzedResult.results[strategyResultModal]
                          .bestPermutation[param]
                      }`
                  )
                  .join(", ")}
                ]
              </DialogContentText>
              <DialogContentText>
                <b>Scanned Permutations:</b>
                {new Intl.NumberFormat().format(
                  symbolData.analyzedResult.results[strategyResultModal]
                    .scannedPermutations
                )}
              </DialogContentText>
              <DialogContentText>
                <b>Win Rate:</b>
                {symbolData.analyzedResult.results[
                  strategyResultModal
                ].winRate.toFixed(2)}
                %
              </DialogContentText>
              {/*<DialogContentText>*/}
              {/*  <b>Description:</b> {descriptions[strategyResultModal]}*/}
              {/*</DialogContentText>*/}
            </DialogContent>
          </Dialog>
        )}

        {symbolData !== undefined && (
          <>
            {/*<Box>*/}
            <Typography>
              <b>Indicator Win Rate: </b>
              {symbolData?.recommendationBacktest.winRate.toFixed(2)}%
            </Typography>
            <Typography>
              <b>Indicator Profit: </b>
              {symbolData?.recommendationBacktest.profit.toFixed(2)}
            </Typography>
            {/*</Box>*/}

            {/*<Box>*/}
            <Typography>
              <b>Indicator recommendations:</b> {getRecommendation()}
            </Typography>
            {/*</Box>*/}
          </>
        )}
        <br />
        {symbolData && selectedSignal === undefined && (
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
              <Box>
                <b>Reasons to buy:</b>{" "}
                <List dense disablePadding>
                  {symbolData?.prices[
                    selectedSignal
                  ].recommendation.buyReasons.map((strategyName: string) => (
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
                  ))}
                </List>
              </Box>
            )}
            {Boolean(
              symbolData?.prices[selectedSignal].recommendation.sellReasons
                .length
            ) && (
              <Box>
                <b>Reasons to sell:</b>{" "}
                <List dense disablePadding>
                  {symbolData?.prices[
                    selectedSignal
                  ].recommendation.sellReasons.map((strategyName: string) => (
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
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </>
    ),
    [symbolData, strategyModalOpen, strategyResultModal, selectedSignal]
  );
};

export default SymbolInfo;
