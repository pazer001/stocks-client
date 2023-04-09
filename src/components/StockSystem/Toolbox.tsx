import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import NotListedLocationRoundedIcon from "@mui/icons-material/NotListedLocationRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded";
import { useRecoilState, useRecoilValue } from "recoil";
import { getByType, getInterval, symbolAtom } from "../../atoms/symbol";

const Toolbox = () => {
  const [symbol, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const [helpDialogOpen, setHelpDialogOpen] = useState<boolean>(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState<boolean>(false);

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar
            variant="dense"
            disableGutters
            sx={{ justifyContent: "space-evenly" }}
          >
            <Box>
              <Button
                color="primary"
                size="small"
                onClick={() => setHelpDialogOpen(true)}
              >
                Help
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem variant="middle" />
            <Box>
              <ToggleButtonGroup
                onChange={(event, value) =>
                  setSymbol((prevSymbol) => ({
                    ...prevSymbol,
                    settings: { ...prevSymbol.settings, byType: value },
                  }))
                }
                exclusive
                color="primary"
                size="small"
                value={byType}
              >
                <ToggleButton value="byWinRate">Win Rate</ToggleButton>
                <ToggleButton value="byProfit">Profit</ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={() => setTypeDialogOpen(true)}>
                <HelpCenterRoundedIcon />
              </IconButton>
            </Box>
            <Divider orientation="vertical" flexItem variant="middle" />
            <Box>
              <ToggleButtonGroup
                onChange={(event, value) =>
                  setSymbol((prevSymbol) => ({
                    ...prevSymbol,
                    settings: { ...prevSymbol.settings, interval: value },
                  }))
                }
                exclusive
                color="primary"
                size="small"
                value={interval}
              >
                <ToggleButton value="1d">D</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Dialog
        open={helpDialogOpen}
        fullWidth
        onClose={() => setHelpDialogOpen(false)}
      >
        <DialogTitle>Help</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="h6">Phylosophy</Typography>
            <Typography variant="body1">
              Utilizing technical analysis in trading for any given symbol, we
              employ a combination of multiple indicators (RSI, CCI, MA, ADL,
              etc.) to establish a comprehensive strategy. There is a vast array
              of strategies available, each with differing expert opinions
              regarding their optimal settings. <br />
              <br />
              For instance, consider the following example: A proposed strategy
              involves waiting for the closing price to surpass the 150-day
              Simple Moving Average (SMA) indicator, with the Relative Strength
              Index (RSI) being below 30.
              <br />
              <br />
              This raises several questions:
              <br />
              <List dense disablePadding>
                <ListItem dense>
                  <ListItemIcon>
                    <NotListedLocationRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Which expert's advice should be considered when selecting a strategy?"></ListItemText>
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <NotListedLocationRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="What is the appropriate configuration for the chosen strategy?"></ListItemText>
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <NotListedLocationRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Will these strategies and settings yield consistent results across different symbols?"></ListItemText>
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <NotListedLocationRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="When backtesting a strategy, should the focus be on the Win Rate or Profit?"></ListItemText>
                </ListItem>
              </List>
              This tool is designed to provide assistance in addressing these
              crucial questions.
            </Typography>
            <br />
            <Typography variant="h6">How it work</Typography>
            <Typography variant="body1">
              Suppose we wish to analyze Tesla stock (TSLA) to determine whether
              now is an opportune time to buy or sell. Our system processes TSLA
              stock data through a series of stages to facilitate this decision:
              <List dense disablePadding>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="We retrieve the stock data for the past year." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="We apply a range of predefined strategies to the stock data." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="For each strategy, we test it against all possible parameter values. For instance, a strategy may have two parameters - the SMA period and the threshold. We examine every feasible permutation, such as [20, 1], [20, 2], [21, 1], [21, 2], and so on." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="We perform backtests for each strategy, determining the optimal permutation based on the win rate and profit (individually). Numerous strategies and millions of permutations are evaluated during this process." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="When analyzing a specific stock symbol, we process the most recent data by aggregating the results from all strategies (using the optimal permutation) to generate a score ranging from -100 to 100. The weight of each strategy in the formula is determined by its backtest win rate or profit. For example, a strategy with an 88 win rate would carry more weight than one with a 71 win rate." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="We generate an indicator graph displaying score values between -100 and 100. A more positive score generally indicates a stronger signal to buy." />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <FiberManualRecordRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="We conduct an additional backtest on the resulting graph to identify the optimal buy and sell thresholds that yield the highest win rate or profit based on historical data. These thresholds are represented by green and red lines, respectively." />
                </ListItem>
              </List>
              By following these steps, our system provides a professional
              analysis of TSLA stock to help inform your decision to buy or
              sell.
            </Typography>
            <br />
            <Typography variant="h6">Q/A</Typography>
            <Typography variant="body1">
              Does the tool truly function as intended?
            </Typography>
            <Typography variant="body2">
              While I am not a clairvoyant and cannot predict the future, this
              tool is designed for symbol analysis through testing strategies,
              permutations, and combinations. It relies on historical data and
              cannot forecast future events. If you have faith in its underlying
              concept, you may give it a try.
            </Typography>
            <br />
            <Typography variant="body1">
              Could you explain how signals are generated, including the
              strategies and permutations used?
            </Typography>
            <Typography variant="body2">
              Certainly. When you select the indicator, you will find all
              relevant details in the right-hand panel. This includes the
              strategies recommending buy and sell actions. For further
              information, click the "Info" button.
            </Typography>
            <br />
            <Typography variant="body1">
              Should I prioritize Win Rate or Profit?
            </Typography>
            <Typography variant="body2">
              This question pertains to one's personal philosophy, and I am
              unable to provide a definitive answer.
            </Typography>
            <br />
            <Typography variant="body1">
              Why do all backtests only use one year of data?
            </Typography>
            <Typography variant="body2">
              After testing the tool against multiple symbols with a range of 1
              to 15 years, it was determined that the most optimal results
              occurred within a one-year timeframe.
            </Typography>
            <br />
            <Typography variant="body1">
              Why can't I analyze all market stocks?{" "}
            </Typography>
            <Typography variant="body2">
              The analysis of a single stock demands significant computational
              resources. Consequently, the tool randomly selects a symbol for
              analysis each time. As time progresses, more symbols will be added
              to the pool.
            </Typography>
            <br />
            <Typography variant="body1">Is the data current?</Typography>
            <Typography variant="body2">
              The symbol's data is up-to-date, and the indicator displayed on
              the graph reflects the most recent score. However, the list of
              tested strategies and chosen permutations is not current, as the
              analysis for each symbol is time-consuming. Therefore, the
              underlying analysis results are based on the date when the symbol
              was last analyzed. Nonetheless, the discrepancy should be
              relatively minor.
            </Typography>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)}>
        <DialogContent>
          <DialogContentText>
            <Typography variant="h6">Type</Typography>
            <Typography variant="body1">
              Win rate and profit are two distinct metrics used to evaluate the
              performance of a trading strategy during the backtesting process.
              Backtesting is the process of testing a trading strategy on
              historical stock data to determine its effectiveness before
              deploying it in live markets. Here's a brief explanation of each
              metric:
            </Typography>
            <br />
            <Typography variant="body1">
              <b>Win rate:</b>
            </Typography>
            <Typography variant="body2">
              Win rate, also known as success rate or hit rate, is the
              percentage of trades that result in a profit relative to the total
              number of trades executed. It is a measure of how often the
              trading strategy generates successful trades. To calculate the win
              rate, divide the number of winning trades by the total number of
              trades, and then multiply by 100 to express it as a percentage. A
              higher win rate indicates a more successful strategy. However, win
              rate alone doesn't provide a complete picture of a strategy's
              effectiveness, as it doesn't account for the magnitude of profits
              or losses in each trade.
            </Typography>
            <br />
            <Typography variant="body1">
              <b>Profit:</b>
            </Typography>
            <Typography variant="body2">
              Profit, in the context of backtesting, refers to the total
              monetary gain or loss generated by a trading strategy over a
              specific period. It takes into account both the frequency of
              winning trades and the magnitude of profits and losses in each
              trade. Profit can be expressed as a net value (total gains minus
              total losses) or as a return on investment (ROI) by comparing the
              net profit to the initial capital. A higher profit indicates a
              more successful strategy, but it doesn't necessarily imply a high
              win rate, as a strategy could have a few large winning trades that
              offset several smaller losing trades.
            </Typography>
            <br />
            <Typography variant="body1">
              In summary, while win rate measures the frequency of successful
              trades, profit evaluates the overall effectiveness of a trading
              strategy by considering both the frequency and magnitude of gains
              and losses. To fully assess the performance of a trading strategy,
              it's essential to consider both win rate and profit, as well as
              other performance metrics such as risk-adjusted returns, drawdown,
              and the Sharpe ratio.
            </Typography>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(Toolbox);
