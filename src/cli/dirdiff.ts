import Logger from "../api/logger.js";
import chalk from "chalk";
import path from "path";
import { writeCSVWithRetryPrompt } from "../api/csvUtils.js";
import { walk } from "../api/walk.js";

const printPathsInXNotInY = (
  paths: string[],
  inTargetName: string,
  notInTargetName: string
) => {
  if (paths.length > 0) {
    Logger.error(
      `${paths.length} files in ${chalk.bold(
        inTargetName
      )} that are not present in ${chalk.bold(notInTargetName)}`
    );
    paths.forEach((d) => {
      Logger.log(`-- ${path.join(inTargetName, d)}`);
    });
  } else {
    Logger.success(
      `No files in ${inTargetName} that are absent from ${notInTargetName}`
    );
  }
};

const getFilePathWithoutExtension = (filePath) => {
  const p = path.parse(filePath);
  return path.join(p.dir, p.name);
};

const pathInArray = (
  fileName: string,
  fileArrayToCheck: string[],
  ignoreExtensions: boolean
) => {
  if (ignoreExtensions) {
    return fileArrayToCheck.includes(getFilePathWithoutExtension(fileName));
  } else {
    return fileArrayToCheck.includes(fileName);
  }
};

export const dirdiff = async (
  target1: string,
  target2: string,
  ignoreExtensions: boolean,
  outputCSVPath: string
) => {
  const paths1 = (await walk(target1)).map((p) => p.path);
  const paths2 = (await walk(target2)).map((p) => p.path);
  let paths1ToCompare = paths1;
  let paths2ToCompare = paths2;
  if (ignoreExtensions) {
    paths1ToCompare = paths1.map((p) => getFilePathWithoutExtension(p));
    paths2ToCompare = paths2.map((p) => getFilePathWithoutExtension(p));
  }

  const inTarget1Only = paths1.filter(
    (filePath) => !pathInArray(filePath, paths2ToCompare, ignoreExtensions)
  );
  const inTarget2Only = paths2.filter(
    (filePath) => !pathInArray(filePath, paths1ToCompare, ignoreExtensions)
  );

  printPathsInXNotInY(inTarget1Only, target1, target2);
  printPathsInXNotInY(inTarget2Only, target2, target1);

  if (outputCSVPath) {
    const headers = ["targetName", "filePath"];
    const rows1 = paths1.map((p) => {
      return { filePath: p, targetName: target1 };
    });
    const rows2 = paths2.map((p) => {
      return { filePath: p, targetName: target2 };
    });
    const rows = rows1.concat(rows2);
    rows.sort((a, b) => {
      return a.filePath.localeCompare(b.filePath);
    });

    await writeCSVWithRetryPrompt(outputCSVPath, headers, rows);
  }
};
