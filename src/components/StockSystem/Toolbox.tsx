import React, { useState } from "react";
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  Hidden,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  getByType,
  getInterval,
  getIntervals,
  getPricesMode,
  symbolAtom,
} from "../../atoms/symbol";
import Logo from "../../assets/symbata-high-resolution-logo-color-on-transparent-background.svg";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const Toolbox = () => {
  const [, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const pricesMode = useRecoilValue(getPricesMode);
  const intervals = useRecoilValue(getIntervals);
  const [typeDialogOpen, setTypeDialogOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <>
      <AppBar position="static">
        {/*<Grid container>*/}
        <Toolbar
          variant="dense"
          disableGutters
          sx={{ justifyContent: "space-between", padding:"0 1em" }}
        >
          {/*<Hidden smDown>*/}
          {/*<Grid container justifyContent="space-around"*/}
          {/*      alignItems="center">*/}
          {/*  <Grid item xs>*/}
          {/*<div>*/}
          <img src={Logo} alt="Symdata" style={{ maxWidth: "120px" }} />
          {/*</div>*/}
          {/*</Grid>*/}
          <Hidden mdUp>
            {/*<Grid item xs={2}>*/}
            <SettingsRoundedIcon
              onClick={() => setShowSettings(true)}
              fontSize="large"
            />
            <Dialog
              open={showSettings}
              onClose={() => setShowSettings(false)}
              fullWidth
            >
              <DialogContent>
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
                  <ToggleButton value="byMixed">Mixed</ToggleButton>
                </ToggleButtonGroup>
                <hr />
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
                  {Boolean(intervals.length) &&
                    intervals.map((interval) => (
                      <ToggleButton
                        key={interval}
                        value={interval}
                        size="small"
                      >
                        {interval}
                      </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <hr />
                <ToggleButtonGroup
                  onChange={(event, value) =>
                    setSymbol((prevSymbol) => ({
                      ...prevSymbol,
                      settings: { ...prevSymbol.settings, pricesMode: value },
                    }))
                  }
                  exclusive
                  color="primary"
                  size="small"
                  value={pricesMode}
                >
                  <ToggleButton value="normal">Normal</ToggleButton>
                  <ToggleButton value="dividendsAdjusted">
                    Adjust for Dividends
                  </ToggleButton>
                </ToggleButtonGroup>
              </DialogContent>
            </Dialog>
            {/*</Grid>*/}
          </Hidden>
          {/*</Grid>*/}
          {/*</Hidden>*/}
          {/*<Divider orientation="vertical" flexItem variant="middle" />*/}
          <Hidden mdDown>
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
                <ToggleButton value="byMixed">Mixed</ToggleButton>
              </ToggleButtonGroup>
              <Hidden smDown>
                <IconButton onClick={() => setTypeDialogOpen(true)}>
                  <HelpCenterRoundedIcon />
                </IconButton>
              </Hidden>
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
                {Boolean(intervals.length) &&
                  intervals.map((interval) => (
                    <ToggleButton key={interval} value={interval} size="small">
                      {interval}
                    </ToggleButton>
                  ))}
              </ToggleButtonGroup>
            </Box>
            <Divider orientation="vertical" flexItem variant="middle" />
            <Box>
              <ToggleButtonGroup
                onChange={(event, value) =>
                  setSymbol((prevSymbol) => ({
                    ...prevSymbol,
                    settings: { ...prevSymbol.settings, pricesMode: value },
                  }))
                }
                exclusive
                color="primary"
                size="small"
                value={pricesMode}
              >
                <ToggleButton value="normal">Normal</ToggleButton>
                <ToggleButton value="dividendsAdjusted">
                  Adjust for Dividends
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Hidden>
        </Toolbar>
        {/*</Grid>*/}
      </AppBar>

      <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)}>
        <DialogContent>
          <DialogContentText>
            <Typography variant="h6">Type</Typography>
            <Typography variant="body1">
              Win rate and profit are two distinct metrics used to evaluate the
              performance of a trading strategy during the back testing process.
              Back testing is the process of testing a trading strategy on
              historical stock data to determine its effectiveness before
              deploying it in live markets. Here is a brief explanation of each
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
              rate alone doesnt provide a complete picture of a strategys
              effectiveness, as it doesnt account for the magnitude of profits
              or losses in each trade.
            </Typography>
            <br />
            <Typography variant="body1">
              <b>Profit:</b>
            </Typography>
            <Typography variant="body2">
              Profit, in the context of back testing, refers to the total
              monetary gain or loss generated by a trading strategy over a
              specific period. It takes into account both the frequency of
              winning trades and the magnitude of profits and losses in each
              trade. Profit can be expressed as a net value (total gains minus
              total losses) or as a return on investment (ROI) by comparing the
              net profit to the initial capital. A higher profit indicates a
              more successful strategy, but it doesnt necessarily imply a high
              win rate, as a strategy could have a few large winning trades that
              offset several smaller losing trades.
            </Typography>
            <br />
            <Typography variant="body1">
              In summary, while win rate measures the frequency of successful
              trades, profit evaluates the overall effectiveness of a trading
              strategy by considering both the frequency and magnitude of gains
              and losses. To fully assess the performance of a trading strategy,
              its essential to consider both win rate and profit, as well as
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
