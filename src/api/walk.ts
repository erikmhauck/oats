import klaw from "klaw";
import Logger from "./logger.js";
import { startSpinnerWithUpdateInterval } from "./spinner.js";

export const walk = async (targetDir: string): Promise<klaw.Item[]> => {
  const items: klaw.Item[] = [];
  const formattedDirectoryName = Logger.getFormattedPath(targetDir);
  let currentDirectory = targetDir;

  Logger.log(`Getting all files in ${formattedDirectoryName}`);

  const { updateSpinnerText, spinnerSucceed, spinnerFail } =
    startSpinnerWithUpdateInterval();

  return new Promise((resolve, reject) => {
    klaw(targetDir, { preserveSymlinks: true })
      .on("data", (item) => {
        if (item.stats.isDirectory()) {
          currentDirectory = item.path;
        }
        updateSpinnerText(currentDirectory);
        items.push(item);
      })
      .on("end", () => {
        spinnerSucceed(`Found ${items.length} in ${formattedDirectoryName}`);
        resolve(items);
      })
      .on("error", (err) => {
        spinnerFail(`Failed to get files from ${formattedDirectoryName}`);
        reject(err);
      });
  });
};
