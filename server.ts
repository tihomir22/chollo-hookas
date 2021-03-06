import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync, readFileSync } from 'fs';
import * as domino from 'domino';
var http = require('http');
var https = require('https');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();



  const distFolder = join(process.cwd(), 'dist/chollo-hookas/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const win = domino.createWindow(indexHtml) as any;


  global['window'] = win;
  global['document'] = win.document;
  global['DOMTokenList'] = win.DOMTokenList;
  global['Node'] = win.Node;
  global['Text'] = win.Text;
  global['HTMLElement'] = win.HTMLElement;
  global['navigator'] = win.navigator;




  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port: any = 4000;
  const host = "0.0.0.0"
  let privateKey = readFileSync('certs/privkey.pem', 'utf8');
  let certificate = readFileSync('certs/fullchain.pem', 'utf8');
  let credentials = { key: privateKey, cert: certificate };
  // Start up the Node server
  const server = require('https').createServer(credentials, app())
  server.listen(port,host, () => {
    console.log(`Node Express server listening on https://localhost:${port}`);
  });

  /*server.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });*/
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
