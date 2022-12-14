import chalk from "chalk";
import boxen from "boxen";

const defaultBox = (msg: string) => boxen(msg, { padding: 1 });

const Logger = {
  log: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(chalk.green(msg)),
  successBox: (msg: string) => console.log(defaultBox(chalk.green(msg))),
  error: (msg: string) => console.log(chalk.red(msg)),
  errorBox: (msg: string) => console.log(defaultBox(chalk.red(msg))),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
  getFormattedPath: (filePath: string) => chalk.blue.bold(filePath),
  printLineBreak: () => console.log("-".repeat(process.stdout.columns)),
};
export default Logger;
