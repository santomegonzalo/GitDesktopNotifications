import React, { PureComponent } from 'react';
// import { ipcRenderer } from 'electron';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import './App.css';

const electron = window.require('electron'); // eslint-disable-line no-undef

// import logo from '../images/logo.svg';

const styles = {
  button: {
    margin: 12
  }
};

class App extends PureComponent {
  listenOauth() {
    electron.ipcRenderer.on('github-oauth-reply', (event, { accessToken }) => {
      debugger;
      console.log(accessToken);
    });
  }

  handleLogin = () => {
    electron.ipcRenderer.send('github-oauth', 'getToken');
    this.listenOauth();
  };

  render() {
    return (
      <div className="App">
        <div>
          <RaisedButton
            onClick={this.handleLogin}
            label="Login with Github"
            secondary
            style={styles.button}
            icon={<FontIcon className="muidocs-icon-custom-github" />}
          />
        </div>
      </div>
    );
  }
}

export default App;
