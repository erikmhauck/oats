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
    let fileCount = 0;
    let directoryCount = 0;
    klaw(targetDir, { preserveSymlinks: true })
      .on("data", (item) => {
        if (item.stats.isDirectory()) {
          if (item.path === targetDir) {
            return;
          }
          currentDirectory = item.path;
          directoryCount = directoryCount + 1;
        } else {
          fileCount = fileCount + 1;
        }
        updateSpinnerText(currentDirectory);
        items.push(item);
      })
      .on("end", () => {
        spinnerSucceed(
          `Found ${fileCount} files and ${directoryCount} directories`
        );
        resolve(items);
      })
      .on("error", (err) => {
        spinnerFail(`Failed to get files from ${formattedDirectoryName}`);
        reject(err);
      });
  });
};
