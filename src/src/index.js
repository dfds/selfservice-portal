import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { GlobalStyles } from '@dfds-ui/react-components';
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./app-context";

render(
  <React.StrictMode>
    <BrowserRouter basename='/v2'>
      <GlobalStyles />
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);