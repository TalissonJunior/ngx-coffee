## ngx-coffee-ssr [1.0.0] - 2024-09-02

### Added
- Created ngx-coffee-ssr

## ngx-coffee [1.4.0] - 2024-08-13

### Added
- Introduced the `(onError)` event in the `ngx-coffee-file-upload` component, enabling developers to handle file upload errors more effectively. This event emits detailed error messages, and if utilized, prevents errors from being logged to the console.

### Changed
- Enhanced error messaging in `ngx-coffee-file-upload` to include suggestions for handling errors using the `(onError)` event, ensuring better communication and flexibility for developers.

## ngx-coffee [1.3.5] - 2024-05-25

### Added
- Introduced the `whereDate` method to handle date filtering by various components such as day, month, year, and combinations thereof.

### Changed
- Updated `CoffeeQueryFilter` interface to support the new filtering mechanism.
- Simplified date filtering by removing other date filter methods and consolidating the functionality into `whereDate`.

## ngx-coffee [1.3.1] - 2024-05-25

### Added
- Introduced the `signInWithGoogle` method in the `CoffeeSocialRequest` class to handle Google sign-in functionality.

### Changed
- Enhanced `coffee-social-google-button.component.ts` to utilize the `onResponse` event, enabling seamless integration with the `signInWithGoogle` method.

## ngx-coffee [1.3.0] - 2024-05-25

### Added
- Added the npm library @abacritt/angularx-social-login to enhance social login functionality.
- Added configuration support for `googleId` in `coffee.module` to facilitate Google authentication.
- Created `coffee-social-google-button.module.ts` to allow the `coffee-social-google-button` component to be used externally.

### Changed
- Modified `coffee-social-google-button.component.ts` to integrate Google authentication support.
