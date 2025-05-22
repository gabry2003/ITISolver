import { BrowserWindow, IpcMain } from "electron";
import setupPug from "electron-pug";
import strings from "./utils/strings";
import { join } from "path";

export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static ipcMain: IpcMain;
  static BrowserWindow;

  private static onWindowAllClosed() {
    if (process.platform !== "darwin") {
      Main.application.quit();
    }
  }

  private static createWindow() {
    Main.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true, // is default value after Electron v5
        contextIsolation: false, // protect against prototype pollution
        enableRemoteModule: false, // turn off remote
        sandbox: false,
        preload: join(__dirname, "preload.js"), // use a preload script
      },
      icon: `${__dirname}/../public/assets/images/icon.png`,
    });


    Main.mainWindow.webContents.on('console-message', (e, level, message) => {
      console.log(`[Renderer] ${message}`);
    });

    Main.mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
      console.error(`❌ Failed to load: ${desc} (code: ${code})`);
    });

    Main.mainWindow.webContents.on('crashed', () => {
      console.error("💥 Renderer process crashed");
    });

    Main.mainWindow.setTitle(strings.app.nome);
    Main.mainWindow.maximize();
    Main.mainWindow.loadFile(`${__dirname}/../public/pages/index.pug`);
    Main.mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  private static async onReady() {
    try {
      let pug = await setupPug(
        { pretty: false },
        {
          strings: strings,
        }
      );
      pug.on("error", (err) => console.error("electron-pug error", err));
    } catch (e) {
      // Could not initiate 'electron-pug'
      console.error(e);
    }

    Main.createWindow();

    Main.application.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        Main.createWindow();
      }
    });
  }

  static main(
    app: Electron.App,
    browserWindow: typeof BrowserWindow,
    ipcMain: IpcMain
  ) {
    Main.ipcMain = ipcMain;
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on("window-all-closed", Main.onWindowAllClosed);
    Main.application.on("ready", Main.onReady);
    // leggi https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
    // Main.ipcMain.on('toMain');

    const isDev = process.env.APP_DEV
      ? process.env.APP_DEV.trim() == "true"
      : false;

    if (isDev) {
      require("electron-reload")(__dirname);
    }
  }
}
