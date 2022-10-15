import { executeWithPromptForRetry } from "./retryPrompt.js";
import fs from "fs";
import Logger from "./logger.js";

export const moveFileWithRetryPrompt = (oldPath: string, newPath: string) => {
  Logger.log(`Moving ${oldPath} to ${newPath}`);
  executeWithPromptForRetry(() => fs.renameSync(oldPath, newPath));
};

export const copyFileWithRetryPrompt = (oldPath: string, newPath: string) => {
  Logger.log(`Copying ${oldPath} to ${newPath}`);
  executeWithPromptForRetry(() => fs.copyFileSync(oldPath, newPath));
};
