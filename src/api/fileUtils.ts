import { executeWithPromptForRetry } from "./retryPrompt.js";
import fs from "fs";
import Logger from "./logger.js";
import inquirer from "inquirer";

const shouldTryAgain = async (
  oldPath: string,
  newPath: string,
  action: string,
  dontTryAgainChoiceText
) => {
  const oldPathFormatted = Logger.getFormattedPath(oldPath);
  const newPathFormatted = Logger.getFormattedPath(newPath);
  const answers = await inquirer.prompt([
    {
      name: "tryAgain",
      message: " ",
      prefix: "",
      type: "list",
      choices: [
        {
          name: `Try to ${action} ${oldPathFormatted} to ${newPathFormatted} again`,
          value: true,
        },
        { name: dontTryAgainChoiceText, value: false },
      ],
    },
  ]);
  return answers.tryAgain;
};

export const moveFileWithRetryPrompt = async (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText = "Skip"
) => {
  const action = "move";
  const success = await executeWithPromptForRetry(
    () => fs.renameSync(oldPath, newPath),
    async () =>
      await shouldTryAgain(oldPath, newPath, action, dontTryAgainChoiceText),
    `Failed to ${action} ${oldPath} to ${newPath}`
  );
  if (!success) {
    Logger.log(`Skipping ${oldPath}`);
  }
  return success;
};

export const copyFileWithRetryPrompt = async (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText = "Skip"
) => {
  const action = "copy";
  const success = await executeWithPromptForRetry(
    () => fs.copyFileSync(oldPath, newPath),
    async () =>
      await shouldTryAgain(oldPath, newPath, "copy", dontTryAgainChoiceText),
    `Failed to ${action} ${oldPath} to ${newPath}`
  );
  return success;
};
