const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const strings = require('./utils/strings');
const upath = require('upath');

let win;

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts/preload.js'),
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
        }
    });

    win.setTitle(strings.app.nome);
    win.maximize();
    win.loadFile('pages/index.html');
};

app.whenReady().then(() => {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Aggiorna pagina',
                    accelerator: 'Ctrl+R',
                    click() {
                        win.reload();
                    }
                },
                {
                    label: 'Strumenti sviluppatore',
                    accelerator: 'F12',
                    click() {
                        win.openDevTools();
                    }
                },
                {
                    label: 'Esci',
                    click() {
                        app.exit(0);
                    }
                },
            ]
        }
    ]));

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;

if (isDev) {
    require('electron-reload')(__dirname, {
        electron: upath.toUnix(upath.join(__dirname, 'node_modules', '.bin', 'electron'))
    });
}