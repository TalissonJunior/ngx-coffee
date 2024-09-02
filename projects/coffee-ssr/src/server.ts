import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as NodeCache from 'node-cache';
import { CoffeeUtil } from './public-api';
import { request } from 'http';
import { Type } from '@angular/core';

(global as any)['self'] = globalThis;

let globalDisableLogs = false;
let refreshCacheSeconds = 2400; // Default: 40 minutes
const cache = new NodeCache();
let cacheKeyPrefix = 'coffee-ssr'; // Global cache key prefix

function logMessage(content: string) {
  if (!globalDisableLogs) {
    console.log(CoffeeUtil.formatCoffeeLogMessage(content));
  }
}

function createRequestOptions(route: string): any {
  const postData = JSON.stringify({ route });
  return {
    hostname: 'localhost',
    port: process.env['PORT'] || 4000,
    path: '/recache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    postData,
  };
}

export function createSsrServer(serverModule: Type<{}>): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.engine('html', ngExpressEngine({ bootstrap: serverModule }));
  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('*.*', express.static(distFolder, { maxAge: '1y' }));

  server.post('/recache', express.json(), async (req, res) => {
    const { route } = req.body;
    if (!route) {
      logMessage('Route is required for recaching.');
      res.status(400).send('Route is required');
      return;
    }

    const cacheKey = `${cacheKeyPrefix}:${route}`;

    const customReq = Object.create(req, {
      url: { value: route },
      originalUrl: { value: route },
      path: { value: route },
    });

    await handleGetRequest(customReq, res, true, cacheKey);
  });

  server.post('/clear-cache', express.json(), (req, res) => {
    const { name = '' } = req.body;
    if (name) {
      const keys = cache.keys().filter(key => key.startsWith(name));
      keys.forEach(key => cache.del(key));
      logMessage(`Cleared cache for prefix: ${name}`);
    } else {
      cache.flushAll();
      logMessage(`Cleared all cache`);
    }
    res.status(200).send(`Cache cleared for prefix: ${name || 'all'}`);
  });

  async function handleGetRequest(req: express.Request, res: express.Response, bypassCache = false, cacheKey: string) {
    const url = req.path;
    const now = Math.floor(Date.now() / 1000);
    
    try {
      const cacheData = cache.get<{ html: string, timestamp: number }>(cacheKey);

      if (!bypassCache && cacheData) {
        const timeSinceCached = now - cacheData.timestamp;

        if (timeSinceCached > refreshCacheSeconds) {
          logMessage(`Cache is old for URL: ${url}. Serving stale content and refreshing in the background.`);
          refreshCacheInBackground(cacheKey, url);
          res.send(cacheData.html);
          return;
        } else {
          logMessage(`Serving from node-cache for URL: ${url}`);
          res.send(cacheData.html);
          return;
        }
      }
    } catch (err) {
      logMessage(`Error fetching from cache for URL: ${url}`);
    }

    logMessage(`Rendering and caching new content for URL: ${url}`);
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: url }] }, (err, html) => {
      if (err) {
        logMessage(`Error rendering URL: ${url} - ${err.message}`);
        res.send(err);
        return;
      }

      cache.set(cacheKey, { html, timestamp: now });
      logMessage(`Successfully cached new content in node-cache for URL: ${url}`);
      res.send(html);
    });
  }

  function refreshCacheInBackground(cacheKey: string, route: string) {
    const { postData, ...reqOptions } = createRequestOptions(route);

    const req = request(reqOptions);

    req.on('error', err => {
      logMessage(`Error refreshing cache for route ${route}: ${err.message}`);
    });

    req.write(postData);
    req.end();
  }

  server.get('*', (req, res) => {
    const cacheKey = `${cacheKeyPrefix}:${req.path}`;
    handleGetRequest(req, res, false, cacheKey);
  });

  const routesFilePath = join(distFolder, '..', 'routes.txt');

  if (existsSync(routesFilePath)) {
    logMessage(`Found routes.txt at ${routesFilePath}. Caching routes...`);
    let routes = readFileSync(routesFilePath, 'utf-8')
      .split('\n')
      .map(route => route.trim())
      .filter(route => route)
      .map(route => route.startsWith('/') ? route : `/${route}`);

    if (!routes.includes('/')) {
      routes.unshift('/');
    }

    routes.forEach(route => {
      if (cache.get(route)) {
        logMessage(`Route already cached: ${route}`);
        return;
      }

      const { postData, ...reqOptions } = createRequestOptions(route);

      const req = request(reqOptions);

      req.on('error', err => {
        logMessage(`Error caching route ${route}: ${err.message}`);
      });

      req.write(postData);
      req.end();
    });
  } else {
    logMessage(`routes.txt not found at ${routesFilePath}. Skipping initial cache. You can generate the routes file by running "coffee-ssr generate routes".`);
  }

  return server;
}

export function runSsrServer({
  serverModule,
  disableLogs = false,
  appName = 'coffee-ssr',
  refreshTimeInSeconds = 2400 // 40 minutes
}: {
  serverModule: Type<{}>,
  disableLogs?: boolean,
  appName?: string,
  refreshTimeInSeconds?: number
}): void {
  globalDisableLogs = disableLogs;
  refreshCacheSeconds = refreshTimeInSeconds;
  cacheKeyPrefix = appName;

  const port = process.env['PORT'] || 4000;

  logMessage(`Starting server...`);

  const server = createSsrServer(serverModule);

  server.listen(port, () => {
    logMessage(`Node Express server listening on http://localhost:${port}`);
  });
}
