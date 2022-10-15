import { executeWithPromptForRetry } from "./retryPrompt.js";
import fs from "fs";
import Logger from "./logger.js";
import inquirer from "inquirer";

const shouldTryAgain = async () => {
  const { tryAgain } = await inquirer.prompt([
    {
      name: "tryAgain",
      message: `Try again?`,
      type: "confirm",
    },
  ]);
  return tryAgain;
};

export const moveFileWithRetryPrompt = (oldPath: string, newPath: string) => {
  Logger.log(`Moving ${oldPath} to ${newPath}`);
  executeWithPromptForRetry(
    () => fs.renameSync(oldPath, newPath),
    shouldTryAgain
  );
};

export const copyFileWithRetryPrompt = (oldPath: string, newPath: string) => {
  Logger.log(`Copying ${oldPath} to ${newPath}`);
  executeWithPromptForRetry(
    () => fs.copyFileSync(oldPath, newPath),
    shouldTryAgain
  );
};
