import { existsSync, lstatSync, mkdirSync } from "fs";
import {
  copyFileWithRetryPrompt,
  handleDestinationDirectoryAlreadyExists,
} from "../api/fileUtils.js";
import Logger from "../api/logger.js";
import { walk } from "../api/walk.js";
import cliProgress from "cli-progress";
import path from "path";

export const copy = async (source: string, destination: string) => {
  const sourceFormatted = Logger.getFormattedPath(source);
  const destinationFormatted = Logger.getFormattedPath(destination);
  if (!existsSync(source)) {
    Logger.error(`Error: ${sourceFormatted} does not exist`);
  } else {
    await handleDestinationDirectoryAlreadyExists(destination);
    const skippedFiles = [];
    if (lstatSync(source).isDirectory()) {
      const filesToCopy = await walk(source);
      Logger.log(`Copying to ${destinationFormatted}`);

      const bar1 = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic
      );
      bar1.start(filesToCopy.length, 0);
      for (let i = 0; i < filesToCopy.length; i += 1) {
        bar1.update(i + 1);
        const relativeSource = filesToCopy[i].path.replace(source, "");
        const fileDestination = path.join(destination, relativeSource);
        if (filesToCopy[i].stats.isDirectory()) {
          if (!existsSync(fileDestination))
            mkdirSync(fileDestination, { recursive: true });
        } else {
          const success = await copyFileWithRetryPrompt(
            filesToCopy[i].path,
            fileDestination
          );
          if (!success) {
            Logger.warn(`Skipping ${filesToCopy[i].path}`);
            skippedFiles.push(filesToCopy[i].path);
          }
        }
      }
      bar1.stop();
      if (skippedFiles.length === 0) {
        Logger.success(
          `Successfully copied all ${filesToCopy.length} items from ${sourceFormatted} to ${destinationFormatted}`
        );
      } else {
        Logger.warn(
          `Copied ${filesToCopy.length - skippedFiles.length}/${
            filesToCopy.length
          } files from ${sourceFormatted} to ${destinationFormatted}`
        );
        Logger.warn(`List of skipped files:`);
        Logger.printLineBreak();
        skippedFiles.forEach((s) => {
          Logger.log(s);
        });
      }
    } else {
      // we are copying a single file
      Logger.log(`Copying ${sourceFormatted} to ${destinationFormatted}`);
      const destinationDirectory = path.dirname(destination);
      if (!existsSync(destinationDirectory)) {
        mkdirSync(destinationDirectory, { recursive: true });
      }
      const success = await copyFileWithRetryPrompt(source, destination);
      if (success) {
        Logger.success(
          `Succesfully copied ${sourceFormatted} to ${destinationFormatted}`
        );
      } else {
        Logger.error(
          `Failed to copy ${sourceFormatted} to ${destinationFormatted}`
        );
      }
    }
  }
};
