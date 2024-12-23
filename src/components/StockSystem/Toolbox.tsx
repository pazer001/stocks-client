import React, { useState } from 'react';
import {
  AppBar, Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  SvgIcon,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import HelpCenterRoundedIcon from '@mui/icons-material/HelpCenterRounded';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  getByType,
  getInterval,
  getIntervals,
  getPricesMode,
  symbolAtom,
} from '../../atoms/symbol';
import logo from '../../assets/horizontal-color-logo-no-background.svg';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useAuth0 } from '@auth0/auth0-react';
import { Interval } from 'luxon';
import { Login, Logout } from '@mui/icons-material';

interface IToolboxProps {

}

const Toolbox = (props: IToolboxProps) => {
  const { user, loginWithRedirect, logout } = useAuth0();
  const [, setSymbol] = useRecoilState(symbolAtom);
  const byType = useRecoilValue(getByType);
  const interval = useRecoilValue(getInterval);
  const pricesMode = useRecoilValue(getPricesMode);
  const intervals = useRecoilValue(getIntervals);
  const [typeDialogOpen, setTypeDialogOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const hiddenUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const hiddenDownMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const hiddenDownSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(anchorEl);
  const handleClickUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    loginWithRedirect();
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar
          variant="dense"
          // disableGutters
          sx={{ justifyContent: 'space-between' }}
        >

          <img style={{ height: '100%', width: '174px' }} src={logo} />

          <Box display={'flex'} justifyContent={'space-between'}>
            {hiddenDownMd
              ? null
              : <Box display={'flex'} gap={2}>
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
                {Boolean(intervals.length) &&
                  <>
                    <Divider orientation="vertical" flexItem variant="middle" />
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
                      {intervals.map((interval) => (
                        <ToggleButton key={interval} value={interval} size="small">
                          {interval}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </>
                }
                <Divider orientation="vertical" flexItem variant="middle" />
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
                {hiddenDownSm
                  ? null
                  : <IconButton onClick={() => setTypeDialogOpen(true)}>
                    <HelpCenterRoundedIcon />
                  </IconButton>
                }

              </Box>
            }
          </Box>
          <Box display={'flex'}>
            <Box display={'flex'} alignItems={'center'}>
              {hiddenUpMd
                ? null
                : <>
                  <IconButton onClick={() => setShowSettings(true)}>
                    <SettingsRoundedIcon sx={{ fontSize: '32px' }} />
                  </IconButton>
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
                </>
              }

              {user
                ? <>
                  <IconButton
                    id="user-menu-button"
                    aria-controls={openUserMenu ? 'user-menu-button' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openUserMenu ? 'true' : undefined}
                    onClick={handleClickUserMenu}
                  >
                    <Avatar
                      alt={user?.name}
                      src={user?.picture}
                      sx={{ width: 32, height: 32 }}
                    />
                  </IconButton>
                  <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    open={openUserMenu}
                    onClose={handleCloseUserMenu}
                    MenuListProps={{
                      'aria-labelledby': 'user-menu-button',
                    }}
                  >
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
                : <Button variant="text" color="inherit" size="large" startIcon={<Login />} onClick={handleLogin}>
                  login
                </Button>
              }

            </Box>
          </Box>
        </Toolbar>
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
