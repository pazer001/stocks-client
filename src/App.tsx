// import './App.css';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Chart from './components/StockSystem/Chart';
import SymbolsList from './components/StockSystem/SymbolsList';
import SymbolInfo from './components/StockSystem/SymbolInfo';
import Toolbox from './components/StockSystem/Toolbox';
import { getAlertMessage, getAlertShow, getMainLoaderShow } from './atoms/view';
import { useRecoilValue } from 'recoil';
import './App.css';

interface IConsentProps {
  open: boolean;
  handleClose: () => void;
}

const Consent = (props: IConsentProps) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      disableEscapeKeyDown
      fullWidth
    >
      <DialogTitle>Consent Message and Disclaimer for Symbata</DialogTitle>
      <DialogContent>
        <DialogContentText>
          By using Symbata (Website), you acknowledge that you have read,
          understood, and agreed to the following terms and conditions.
          <b>Disclaimer:</b>
        </DialogContentText>
        <List dense disablePadding>
          <ListItem dense>
            <ListItemText
              primary="Not Investment Advice"
              secondary="The information provided on this Website, including any predictions, data, analyses, or opinion you receive from us, is for informational and educational purposes only. None of the information provided constitutes investment advice, financial advice, trading advice, or any other sort of advice."
            />
          </ListItem>
          <ListItem dense>
            <ListItemText
              primary="No Guarantee"
              secondary="We make no representations as to the accuracy, completeness, or reliability of any information found on this Website. You should not rely on any information on this Website as a substitute for consultation with financial, investment, tax, or legal advisers."
            />
          </ListItem>
          <ListItem dense>
            <ListItemText
              primary="Invest At Your Own Risk"
              secondary="Investing in financial markets is risky and should only be undertaken after comprehensive due diligence. You are solely responsible for your own financial decisions and outcomes."
            />
          </ListItem>
          <ListItem dense>
            <ListItemText
              primary="Updates and Changes"
              secondary="We reserve the right to add, modify, or delete any information on this Website at any time without notice."
            />
          </ListItem>
          <ListItem dense>
            <ListItemText
              primary="Limitation of Liability"
              secondary="To the fullest extent permitted by law, [Your Website Name], its officers, directors, employees, and agents disclaim all liability in respect to actions taken or not taken based on any or all the information provided on this Website. By clicking 'Accept', you acknowledge that you have read and understand this disclaimer, and you agree to be bound by its terms. If you do not agree to these terms, please do not use this Website."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} autoFocus>
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function App() {

  const theme = useTheme();
  const mainLoaderShow = useRecoilValue(getMainLoaderShow);
  const alertShow = useRecoilValue(getAlertShow);
  const alertMessage = useRecoilValue(getAlertMessage);
  const [showConsent, setShowConsent] = useState<boolean>(
    localStorage.getItem('consent') !== 'false',
  );


  return (
    <>
      {mainLoaderShow && (
        <LinearProgress sx={{ position: 'fixed', width: '100%' }} />
      )}

      <Snackbar open={alertShow}>
        <Alert severity="error">{alertMessage}</Alert>
      </Snackbar>
      <Consent
        open={showConsent}
        handleClose={() => {
          localStorage.setItem('consent', String(false));
          setShowConsent(false);
        }}
      />
      <Grid
        container
        direction="column"
        rowSpacing={1}
        paddingBottom={theme.spacing(1)}
        sx={{
          // minHeight: '100dvh', // Adjust to 'minHeight' to ensure content covers the viewport height
          // paddingBottom: '0', // Add padding at the bottom
        }}
      >
        <Grid item>
          <Toolbox />
        </Grid>

        <Grid item
              paddingLeft={theme.spacing(1)}
              paddingRight={theme.spacing(1)}
              flex={1}
              width="100%"
        >
          <Grid container
                height="100%"
                columnSpacing={1}
          >
            <Grid item
                  xl={7}
                  md={7}
                  sx={{ display: { xs: 'none', sm: 'none', md: 'none', xl: 'block' } }}
            >
              <Paper sx={{ height: 'calc(100dvh - 64px)' }}>
                <Chart />
              </Paper>
            </Grid>
            <Grid
              item
              xl={2}
              md={5}
              sx={{ display: { xs: 'none', sm: 'none', md: 'none', xl: 'block' } }}
            >
              <Paper sx={{ height: 'calc(100dvh - 64px)' }}>
                <SymbolInfo />
              </Paper>
            </Grid>
            <Grid
              item
              xl={3}
              md={5}
              xs={12}
            >
              <Paper sx={{ height: 'calc(100dvh - 64px)' }}>
                <SymbolsList />
              </Paper>

            </Grid>

          </Grid>


        </Grid>
      </Grid>
    </>
  );
}

export default App;
