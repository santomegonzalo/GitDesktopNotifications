const Promise = require('bluebird');
const queryString = require('querystring');
const axios = require('axios');
const nodeUrl = require('url');
const electron = require('electron');

const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

class OAuth {
  constructor(config, windowParams) {
    this.config = config;
    this.windowParams = windowParams;
  }

  getAuthorizationCode(optsParam) {
    const opts = optsParam || {};

    if (!this.config.redirectUri) {
      this.config.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    }

    const urlParams = {
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      state: generateRandomString(16)
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType;
    }

    const url = `${this.config.authorizationUrl}?${queryString.stringify(urlParams)}`;

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow(this.windowParams || { 'use-content-size': true });

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      const onCallback = (callbackURL) => {
        const urlParts = nodeUrl.parse(callbackURL, true);
        const { query } = urlParts;
        const { code, error } = query;

        if (error !== undefined) {
          reject(error);
          authWindow.removeAllListeners('closed');
          setImmediate(() => {
            authWindow.close();
          });
        } else if (code) {
          resolve(code);
          authWindow.removeAllListeners('closed');
          setImmediate(() => {
            authWindow.close();
          });
        }
      };

      authWindow.webContents.on('will-navigate', (event, navigateUrl) => {
        onCallback(navigateUrl);
      });

      authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
        onCallback(newUrl);
      });
    });
  }

  tokenRequest(data) {
    let newData = Object.assign(data, {});

    const header = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    if (this.config.useBasicAuthorizationHeader) {
      const buffer = new Buffer(`${config.clientId}:${config.clientSecret}`).toString('base64');
      header.Authorization = `Basic ${buffer}`;
    } else {
      newData = Object.assign(newData, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      });
    }

    return axios({
      url: this.config.tokenUrl,
      method: 'POST',
      headers: header,
      data: queryString.stringify(newData)
    }).then(res => res.json());
  }

  getAccessToken(opts) {
    return this.getAuthorizationCode(opts)
      .then((authorizationCode) => {
        const tokenRequestData = Object.assign({
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri
        }, opts.additionalTokenRequestData);

        return this.tokenRequest(tokenRequestData);
      });
  }

  refreshToken(refreshToken) {
    return this.tokenRequest({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: this.config.redirectUri
    });
  }
}

module.export = OAuth;
