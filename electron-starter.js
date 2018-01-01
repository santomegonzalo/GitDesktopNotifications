const electron = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
// const electronOauth2 = require('electron-oauth2');
const OAuth = require('./electron/oauth');

const oauthConfig = require('./config').oauth;

if (isDev) {
  console.log('Running in development'); // eslint-disable-line no-console
  require('electron-debug')({
    showDevTools: false
  });
} else {
  console.log('Running in production');// eslint-disable-line no-console
}

const { app, BrowserWindow, ipcMain } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#111',
    show: false
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('github-oauth', (event) => {
  const windowParams = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden-inset',
    webPreferences: {
      nodeIntegration: false
    }
  };
  console.log('hola!');
  const oauth = new OAuth(oauthConfig, windowParams);

  oauth.getAccessToken({})
    .then((token) => {
      console.log(token);
      event.sender.send('github-oauth-reply', token);
    }, (err) => {
      console.log('Error while getting token', err);
    });

  // const githubOAuth = electronOauth2(oauthConfig, windowParams);

  // githubOAuth.getAccessToken({})
  //   .then((token) => {
  //     console.log(token);
  //     event.sender.send('github-oauth-reply', token);
  //   }, (err) => {
  //     console.log('Error while getting token', err);
  //   });
});
