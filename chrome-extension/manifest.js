import fs from 'node:fs';
import deepmerge from 'deepmerge';

const packageJson = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const isFirefox = process.env.__FIREFOX__ === 'true';

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = deepmerge(
  {
    manifest_version: 3,
    default_locale: 'en',
    name: 'pomodev',
    version: packageJson.version,
    description: 'Pomodoro timer for developers',
    permissions: ['storage', 'alarms', 'notifications'],
    options_page: 'options/index.html',
    background: {
      service_worker: 'background.iife.js',
      type: 'module',
    },
    action: {
      default_popup: 'popup/index.html',
      default_icon: 'pomodev-logo-128.png',
    },
    icons: {
      128: 'pomodev-logo-128.png',
    },
    content_scripts: [
      // {
      //   matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      //   js: ['content-ui/index.iife.js'],
      // },
      {
        matches: ['http://*/*', 'https://*/*', '<all_urls>'],
        css: ['content.css'], // public folder
      },
    ],
    web_accessible_resources: [
      {
        resources: ['*.js', '*.css', '*.svg', 'pomodev-logo-128.png', 'pomodev-logo-34.png'],
        matches: ['*://*/*'],
      },
    ],
  },
  {},
);

export default manifest;
