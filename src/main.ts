import { BrowserWindow, IpcMain } from "electron";
import setupPug from "electron-pug";
import strings from "./utils/strings";
import upath from "upath";
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
        nodeIntegration: false, // is default value after Electron v5
        contextIsolation: true, // protect against prototype pollution
        enableRemoteModule: false, // turn off remote
        preload: join(__dirname, "preload.js"), // use a preload script
      },
      icon: `${__dirname}/../public/assets/images/icon.png`,
    });

    Main.mainWindow.setTitle(strings.app.nome);
    Main.mainWindow.maximize();
    Main.mainWindow.loadFile(`${__dirname}/../public/pages/index.pug`);
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
      require("electron-reload")(__dirname, {
        electron: upath.toUnix(
          upath.join(__dirname, "node_modules", ".bin", "electron")
        ),
      });
    }
  }
}
