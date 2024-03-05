const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const destinationFile = path.join(__dirname, './projects/coffee/index.ts');
const fileContent = `
/*
 * Development purpose don't commit this file
 */

export * from './src/public-api';
`;

// Write the updated content to the destination file
fs.writeFile(destinationFile, fileContent.trim(), 'utf8', (err) => {
  if (err) {
    console.error(chalk.red(`Failed to write the specified content to ${destinationFile}. Error:`), err);
    return;
  }

  const libraryPath = path.join(__dirname, 'projects/coffee').replace(/\\/g, '/');

  console.log(chalk.green('The NGX-COFFEE library has been successfully prepared for local debugging.'));
  console.log(chalk.yellow('To use the local version of the NGX-COFFEE library in your Angular project, follow these steps:'));
  console.log(chalk.cyan('1. Open the package.json file of your Angular project.'));
  
  console.log(chalk.cyan(`2. In your Angular project tsconfig.json file update it to look like this:`));
  console.log(`
    {
      "compilerOptions": {
        "baseUrl": "./",
        "paths": {
          "ngx-coffee": ["${libraryPath}/index.ts"] // add this line
        }
      },
      "include": [
        "src/**/*.ts",
        "${libraryPath}/**/*.ts" // add this line
      ]
    }
  `);
  console.log(chalk.cyan('4. Start or restart your Angular application with `ng serve`.'));
});
