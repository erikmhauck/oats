import { executeWithPromptForRetry } from "./retryPrompt.js";
import {
  existsSync,
  renameSync,
  copyFileSync,
  rmSync,
  statSync,
  utimesSync,
} from "fs";
import Logger from "./logger.js";
import inquirer from "inquirer";

const shouldTryAgain = async (
  oldPath: string,
  newPath: string,
  action: string,
  dontTryAgainChoiceText: string
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

export const copyStats = (sourcePath: string, pathToCopyStatsTo: string) => {
  const stat = statSync(sourcePath);
  utimesSync(pathToCopyStatsTo, stat.atime, stat.mtime);
};

const applyActionToFile = (
  oldPath: string,
  newPath: string,
  dontTryAgainChoiceText: string,
  action: "move" | "copy",
  keepTimeStamps: boolean
) => {
  let fileAction: () => void;
  switch (action) {
    case "move":
      fileAction = () => renameSync(oldPath, newPath);
      break;
    case "copy":
      fileAction = () => copyFileSync(oldPath, newPath);
      break;
  }

  const fnToExecute = async () => {
    fileAction();
    if (keepTimeStamps) {
      copyStats(oldPath, newPath);
    }
  };

  return executeWithPromptForRetry(
    fnToExecute,
    async () =>
      await shouldTryAgain(oldPath, newPath, action, dontTryAgainChoiceText),
    `Failed to ${action} ${oldPath} to ${newPath}`
  );
};

export const handleDestinationDirectoryAlreadyExists = async (
  destination: string
) => {
  if (existsSync(destination)) {
    const destinationFormatted = Logger.getFormattedPath(destination);
    Logger.warn(`Destination ${destinationFormatted} already exists`);
    const answers = await inquirer.prompt([
      {
        message: " ",
        name: "action",
        type: "list",
        choices: [
          {
            name: "Overwrite conflicting filenames",
            value: `merge`,
          },
          {
            name: `Delete the contents of ${destinationFormatted} before copy`,
            value: `overwrite`,
          },
          {
            name: "Cancel",
            value: `cancel`,
          },
        ],
      },
    ]);
    if (answers.action === "overwrite") {
      Logger.log(`Deleting ${destinationFormatted}`);
      rmSync(destination, { recursive: true, force: true });
    } else if (answers.action === "cancel") {
      process.exit();
    }
  }
};

export const moveFileWithRetryPrompt = (
  oldPath: string,
  newPath: string,
  keepTimeStamps = false,
  dontTryAgainChoiceText = "Skip"
) => {
  return applyActionToFile(
    oldPath,
    newPath,
    dontTryAgainChoiceText,
    "move",
    keepTimeStamps
  );
};

export const copyFileWithRetryPrompt = async (
  oldPath: string,
  newPath: string,
  keepTimeStamps = false,
  dontTryAgainChoiceText = "Skip"
) => {
  return await applyActionToFile(
    oldPath,
    newPath,
    dontTryAgainChoiceText,
    "copy",
    keepTimeStamps
  );
};
