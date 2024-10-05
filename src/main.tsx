import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RecoilRoot } from 'recoil';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
// #d9d9d9
// #F5793B
// #0c056d
// #06144c
// #c4d0ff
// #8aa1ff
// #78ac2a
// #4dce02
// #11a075
// #f2f2f2
// #bfbfbf
// #f79a6b
// #ed2a2d

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RecoilRoot>
    <Auth0Provider
      domain="dev-ofhanyx8di2v3oby.us.auth0.com"
      clientId="DstaEG8iVYZOx7xXMfli513mlvwSXa1Z"

      authorizationParams={{
        redirect_uri: window.location.origin,

      }}
    >
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
    </Auth0Provider>
  </RecoilRoot>,
);
