import { app, BrowserWindow, nativeTheme } from 'electron'
import * as SQLite from 'sqlite'
import * as Path from 'path'

declare global {
    const QUASAR_NODE_INTEGRATION: boolean
}

declare module 'electron' {
    interface App {
        openSQLite(): Promise<SQLite.Database>
    }
}

try {
    if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
        require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
    }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
    global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow: BrowserWindow | null

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        useContentSize: true,
        webPreferences: {
            // Change from /quasar.conf.js > electron > nodeIntegration;
            // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
            // eslint-disable-next-line no-undef
            nodeIntegration: QUASAR_NODE_INTEGRATION

            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            // preload: path.resolve(__dirname, 'electron-preload.js')
        }
    })

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainWindow.loadURL(process.env.APP_URL!)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    app.openSQLite = () => SQLite.open({
        filename: Path.resolve(app.getPath('userData'), 'data-store.db'),
        driver: require('sqlite3').Database
    })

    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})