import {app} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import log from 'electron-log/main';

// log.initialize({preload: true});
log.debug('Log from the main process');
log.transports.file.level = 'debug';

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS3_DEVTOOLS} =
//         // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => {
      /**
       * Here we forced to use `require` since electron doesn't fully support dynamic import in asar archives
       * @see https://github.com/electron/electron/issues/38829
       * Potentially it may be fixed by this https://github.com/electron/electron/pull/37535
       */
      // const {autoUpdater} = require('electron-updater');
      // autoUpdater.logger = log;

      // autoUpdater.on('checking-for-update', () => {
      //   log.debug('Checking for update...');
      // });
      // autoUpdater.on('update-available', info => {
      //   log.debug('Update available.', info);
      // });
      // autoUpdater.on('update-not-available', info => {
      //   log.debug('Update not available.', info);
      // });
      // autoUpdater.on('error', err => {
      //   log.error('There was a problem updating the application', err);
      // });
      // autoUpdater.on('download-progress', progress => {
      //   log.debug(
      //     `Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred}/${progress.total})`,
      //   );
      // });
      // autoUpdater.on('update-downloaded', info => {
      //   log.debug('Update downloaded; will install in 5 seconds', info);
      // });

      // autoUpdater.checkForUpdatesAndNotify();
      // autoUpdater.checkForUpdates();

      require('electron-updater').autoUpdater.checkForUpdatesAndNotify();
    })
    .catch(e => log.error('Failed check and install updates:', e));
}
