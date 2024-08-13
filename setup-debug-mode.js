const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { parse } = require('jsonc-parser');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for the root directory of the project
rl.question(chalk.blue('Enter the root directory of your Angular project: '), (projectRoot) => {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const libraryPath = path.join(__dirname, 'projects/coffee/index.ts').replace(/\\/g, '/');

  var exists = fs.existsSync(tsconfigPath);

  if (!exists) {
    console.error(chalk.red('Error: The specified directory does not appear to be the root of an Angular project.'));
    console.error(chalk.red('Please ensure that the directory contains the file tsconfig.json.'));
    console.error(chalk.red(`Path checked: ${tsconfigPath}`));
    rl.close();
    return;
  }
  // Read tsconfig.json
  fs.readFile(tsconfigPath, 'utf8', (err, data) => {
    if (err) {
      console.error(chalk.red(`Failed to read tsconfig.json from ${tsconfigPath}. Error:`), err);
      rl.close();
      return;
    }

    let tsconfig;
    try {
      // Parse JSON with comments using jsonc-parser
      tsconfig = parse(data);
    } catch (parseErr) {
      console.error(chalk.red('Failed to parse tsconfig.json. Please check the file for syntax errors. Error:'), parseErr);
      rl.close();
      return;
    }

    // Modify tsconfig.json if necessary
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }
    if (!tsconfig.compilerOptions.paths['ngx-coffee']) {
      tsconfig.compilerOptions.paths['ngx-coffee'] = [libraryPath];
    }
    if (!tsconfig.include) {
      tsconfig.include = [];
    }
    if (!tsconfig.include.includes(`${libraryPath.replace('/index.ts', '')}/**/*.ts`)) {
      tsconfig.include.push(`${libraryPath.replace('/index.ts', '')}/**/*.ts`);
    }
    if (!tsconfig.include.includes("src/**/*.ts")) {
      tsconfig.include.push("src/**/*.ts");
    }

    // Write back the updated tsconfig.json
    fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(chalk.red(`Failed to write to tsconfig.json at ${tsconfigPath}. Error:`), writeErr);
        rl.close();
        return;
      }
     
      console.log(chalk.green('The NGX-COFFEE library has been successfully prepared for local debugging.'));
      console.log(chalk.cyan('Start or restart your Angular application with `ng serve`.'));

      rl.close();
    });
  });
});
