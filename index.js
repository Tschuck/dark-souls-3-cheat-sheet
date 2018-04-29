const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

const pids = [ ];
let win;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: `${ __dirname }/img/favicon-152.png`
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null
  });

  // win.webContents.openDevTools({ detach: true });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('quitting application')
    app.quit();

    // workaround for electron is not closing one process
    process.kill(process.pid);
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});
