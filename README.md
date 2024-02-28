
# NGX COFFEE
NGX COFFEE is a comprehensive Angular library designed to supercharge your coffee-themed projects. Whether you're building an application for coffee lovers, a coffee shop management system, or any project that could use a dash of coffee magic, NGX COFFEE provides you with a suite of powerful, easy-to-use tools and components.

---

## Features

- **Auth Service Options**: Simplify authentication workflows with support for social login (including LinkedIn) and traditional login/password methods.
- **HTTP Services and Filters**: Easily interact with your backend services using intuitive HTTP request builders that include filtering, pagination, and more.
- **Form Validation**: Leverage built-in utilities to enforce reactive form validations with minimal fuss.
- **File Utilities**: Convert between Base64 strings and files effortlessly, streamlining the handling of file uploads and downloads.

---

## Getting Started

To infuse your Angular project with NGX COFFEE, follow these simple installation instructions:

```bash
$ npm install --save ngx-coffee
```

### Quickstart Guide

Jumpstart your project by importing the `CoffeeModule` into your Angular app's module:

```typescript
import { NgModule } from '@angular/core';
import { CoffeeModule } from 'ngx-coffee';

@NgModule({
  imports: [
    CoffeeModule.forRoot({
      baseApiUrl: 'https://localhost:5001/api',
      auth: {
        linkedIn: {
          clientId: 'your_client_id'
          // ...
        }
      }
    }),
  ],
})
export class AppModule { }
```

This basic setup equips your application with the full range of NGX COFFEE's features, configurable through the `forRoot` method.

---

## Dive Deeper

To explore more about how to leverage NGX COFFEE's capabilities in your application, including authentication flows, data fetching, form validations, and file handling, refer to the detailed usage sections below.

---

### Authentication with NGX COFFEE

NGX COFFEE simplifies both social and traditional authentication processes. Inject the `CoffeeService` into your components to start authenticating users seamlessly.

```typescript
import { CoffeeService } from 'ngx-coffee';

export class LoginComponent {
  constructor(private coffeeService: CoffeeService) {}

  loginWithLinkedIn(): void {
    // Your LinkedIn login logic here
  }

  loginWithCredentials(login: string, password: string): void {
    // Your credential login logic here
  }
}
```

---

### HTTP Services for Your Coffee Data

Fetching, creating, and managing coffee data becomes a breeze with our HTTP services. Utilize our fluent API to construct requests complete with filters and pagination support.

---

### Robust Form Validations

Ensure your forms are up to the mark with our validation utilities, making sure every input is just as it should be.

---

### Managing Files Like a Pro

Whether it's converting a profile picture to Base64 or preparing a menu PDF for download, our file utilities have got you covered.

---

## Publish on NPM

#### Step 1: Build for Production
Begin by building the project with the production configuration.
```
ng build --configuration=production
```

#### Step 2: Navigate to the Build Output Directory

```
cd dist/coffee
```

#### Step 3: Publish to npm
```
npm publish
```

## Enabling Debug Mode for Local Development
Debug mode facilitates local development and debugging of the NGX COFFEE library within Angular projects. A script is provided to prepare the library for local debugging, adjusting internal paths and settings for seamless integration with the development environment.

Execute Debug Mode Script:
```
npm run enable:debug
```

This command adjusts the library for local debugging, modifying internal paths to correctly reference local files and assets.

Embrace the power of NGX COFFEE in your Angular projects and elevate your coffee-themed applications to new heights. Enjoy the rich features and streamlined development experience provided by NGX COFFEE – your go-to Angular library for everything coffee.
