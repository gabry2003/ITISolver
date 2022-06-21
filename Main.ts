import { BrowserWindow } from 'electron';
import setupPug from 'electron-pug';
import strings from './utils/strings';
import upath from 'upath';
import { existsSync } from 'fs';
import { resolve } from 'path';

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static createWindow() {
        Main.mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: `${__dirname}/images/icon.png`
        });

        Main.mainWindow.setTitle(strings.app.nome);
        Main.mainWindow.maximize();
        Main.mainWindow.removeMenu();
        let pagesFolder;

        const pagesFolder1 = resolve(__dirname, '../pages');
        const pagesFolder2 = resolve(__dirname, 'pages');

        if(existsSync(pagesFolder1)) {
            pagesFolder = pagesFolder1;
        }else {
            pagesFolder = pagesFolder2;
        }

        Main.mainWindow.loadFile(`${pagesFolder}/index.pug`);
    }

    private static async onReady() {
        try {
            let pug = await setupPug({ pretty: false }, {
                strings: strings
            })
            pug.on('error', err => console.error('electron-pug error', err))
        } catch (e) {
            // Could not initiate 'electron-pug'
            console.error(e);
        }

        Main.createWindow();

        Main.application.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                Main.createWindow();
            }
        });
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);

        const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;

        if (isDev) {
            require('electron-reload')(__dirname, {
                electron: upath.toUnix(upath.join(__dirname, 'node_modules', '.bin', 'electron'))
            });
        }
    }
}