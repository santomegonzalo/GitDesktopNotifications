import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

const InitialApp = () => (
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
);

ReactDOM.render(<InitialApp />, document.getElementById('root')); // eslint-disable-line no-undef
registerServiceWorker();
