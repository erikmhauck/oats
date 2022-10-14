import chalk from "chalk";
import klaw from "klaw";
import ora from "ora";
import Logger from "./logger.js";

const msBetweenSpinnerTextUpdates = 100;

export const walk = async (targetDir: string): Promise<klaw.Item[]> => {
  const formattedDirectoryName = chalk.blue.bold(targetDir);
  Logger.log(`Getting all files in ${formattedDirectoryName}`);
  const spinner = ora().start();
  let canUpdate = true;
  const spinnerTextUpdateInterval = setInterval(() => {
    canUpdate = true;
  }, msBetweenSpinnerTextUpdates);

  return new Promise((resolve, reject) => {
    const items: klaw.Item[] = [];
    klaw(targetDir, { preserveSymlinks: true })
      .on("data", (item) => {
        if (item.stats.isDirectory() && canUpdate) {
          spinner.text = item.path;
          canUpdate = false;
        }
        items.push(item);
      })
      .on("end", () => {
        spinner.succeed(`Found ${items.length} in ${formattedDirectoryName}`);
        clearInterval(spinnerTextUpdateInterval);
        resolve(items);
      })
      .on("error", (err) => {
        spinner.fail(`Failed to get files from ${formattedDirectoryName}`);
        clearInterval(spinnerTextUpdateInterval);
        reject(err);
      });
  });
};
