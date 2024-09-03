
# NgxCoffeeSsr

NgxCoffeeSsr is a library that provides Server-Side Rendering (SSR) support for Angular applications, with enhanced caching and route management capabilities. It simplifies the setup of SSR for your Angular app, ensuring that your app is rendered on the server for better performance and SEO.

## Features

- **Server-Side Rendering (SSR):** Easily integrate SSR into your Angular applications.
- **Node Cache Integration:** Uses `node-cache` for in-memory caching with support for background cache refreshing.
- **Customizable Cache Management:** Clear cache for specific routes or for the entire application.
- **Dynamic Routes Caching:** Cache routes dynamically using a simple configuration.
- **Express Integration:** Integrates with Express.js for powerful server-side capabilities.

## Installation

To install the NgxCoffeeSsr library, use the following command:

```sh
npm install ngx-coffee-ssr
```

Also checkout the  CoffeeSsrCli library:

```sh
npm install coffee-ssr-cli
```

this tool helps you configure your project without writing a single line of code,
everytime you see coffee-ssr it is related to coffee-ssr-cli

## Usage

### Initial Setup

To get started, initialize the SSR server by importing the required modules and running the server,
this can be achieve be running the command below:

```sh
  coffee-ssr init
```

will output coffee-ssr.ts file on root directory with:

```typescript
import 'zone.js/node'; 
import { AppServerModule } from './src/app/app.server.module';

if (typeof window === 'undefined') {
  const { runSsrServer } = require('ngx-coffee-ssr');
  
  runSsrServer({
    serverModule: AppServerModule,
    disableLogs: false,
    appName: '${projectName.toLowerCase()}'
  });
}
```

### Commands

Run the following commands to manage your SSR setup:

- **Generate Routes:**
  Extracts all routes from Angular routing modules and generates a `routes.txt` file for caching.

  ```sh
  coffee-ssr generate routes
  ```

- **Initialize Project for SSR:**
  Sets up your project for SSR by configuring necessary files and settings.

  ```sh
  coffee-ssr init
  ```

- **Clean Up Project:**
  Cleans up your project for SSR compatibility, removing unused imports and adjusting configurations.

  ```sh
  coffee-ssr clean
  ```

### Cache Management

- **Clear Cache for Specific Routes:**

  Send a POST request to `/clear-cache` with a JSON body specifying the route name to clear the cache for that specific route.

  ```json
  {
    "name": "your-app-name"
  }
  ```

- **Clear All Cache:**

  Send a POST request to `/clear-cache` without any parameters to clear the entire cache.

### Customizing Cache Behavior

- **Cache Prefix:**
  Customize the cache prefix globally by setting the `appName` parameter in `runSsrServer`.

- **Cache Refresh Interval:**
  Configure the time interval (in seconds) to refresh the cache by setting `refreshTimeInSeconds`.

## Building the Library

Run `ng build ngx-coffee-ssr` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `ng test ngx-coffee-ssr` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Publishing the Library

After building your library with `ng build ngx-coffee-ssr`, go to the dist folder `cd dist/ngx-coffee-ssr` and run `npm publish`.

## Further Help

To get more help on the Angular CLI use `ng help` or visit the [Angular CLI Overview and Command Reference](https://angular.io/cli).

## Contributions

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or bug reports.

## Additional Setup

While `ngx-coffee-ssr` allows you to easily set up SSR for your Angular app, it is highly recommended to use the `coffee-ssr-cli` tool to accelerate the setup process. This CLI tool provides commands such as `init`, `generate routes`, and `clean` to automatically configure your project.

Make sure to install the `coffee-ssr-cli` tool:

```sh
npm install -g coffee-ssr-cli
```

### Important

To fully leverage the capabilities of `ngx-coffee-ssr`, ensure that you run `coffee-ssr init` to generate all necessary boilerplate code and configurations required for SSR.
