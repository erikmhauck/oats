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

const applyActionToFile = (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText: string,
  action: "move" | "copy"
) => {
  let fileActionFn: () => void;
  switch (action) {
    case "move":
      fileActionFn = () => fs.renameSync(oldPath, newPath);
      break;
    case "copy":
      fileActionFn = () => fs.copyFileSync(oldPath, newPath);
      break;
  }
  return executeWithPromptForRetry(
    fileActionFn,
    async () =>
      await shouldTryAgain(oldPath, newPath, action, dontTryAgainChoiceText),
    `Failed to ${action} ${oldPath} to ${newPath}`
  );
};

export const moveFileWithRetryPrompt = (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText = "Skip"
) => {
  return applyActionToFile(oldPath, newPath, dontTryAgainChoiceText, "move");
};

export const copyFileWithRetryPrompt = async (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText = "Skip"
) => {
  return await applyActionToFile(
    oldPath,
    newPath,
    dontTryAgainChoiceText,
    "copy"
  );
};
