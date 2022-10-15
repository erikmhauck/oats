import Logger from "../api/logger.js";
import path from "path";
import { writeCSVWithRetryPrompt } from "../api/csvUtils.js";
import { walk } from "../api/walk.js";

const printPathsNotInTarget = (
  paths: IPathComparison[],
  notInTargetName: string
) => {
  const notInTargetNameBold = Logger.getFormattedPath(notInTargetName);
  if (paths.length > 0) {
    Logger.error(`${paths.length} files missing from ${notInTargetNameBold}`);
    paths.forEach((d) => {
      Logger.log(`-- ${d.fullPath}`);
    });
  } else {
    Logger.success(`No files are absent from ${notInTargetNameBold}`);
  }
};

const getFilePathWithoutExtension = (filePath) => {
  const p = path.parse(filePath);
  return path.join(p.dir, p.name);
};

interface IPathComparison {
  fullPath: string;
  relativePath: string;
  comparisonPath: string;
  targetName: string;
  hasMatch: boolean;
}

const getComparisonPathsFromTarget = async (
  targetName: string,
  ignoreExtensions: boolean
): Promise<IPathComparison[]> => {
  const paths = (await walk(targetName)).map((p) => p.path);
  return paths
    .filter((filePath) => filePath !== targetName)
    .map((filePath) => {
      const relativePath = filePath.replace(targetName, "");
      let comparisonPath = relativePath;
      if (comparisonPath) {
        if (ignoreExtensions) {
          comparisonPath = getFilePathWithoutExtension(comparisonPath);
        }
        return {
          fullPath: filePath,
          comparisonPath,
          targetName,
          relativePath,
          hasMatch: false,
        };
      }
    });
};

export const dirdiff = async (
  target1: string,
  target2: string,
  ignoreExtensions: boolean,
  outputCSVPath: string
) => {
  const paths1 = await getComparisonPathsFromTarget(target1, ignoreExtensions);
  const paths2 = await getComparisonPathsFromTarget(target2, ignoreExtensions);

  const inTarget1Only = [];
  const inTarget2Only = [];

  paths1.forEach((p1) => {
    if (paths2.some((p2) => p1.comparisonPath === p2.comparisonPath)) {
      p1.hasMatch = true;
    } else {
      inTarget1Only.push(p1);
    }
  });

  paths2.forEach((p2) => {
    if (paths1.some((p1) => p2.comparisonPath === p1.comparisonPath)) {
      p2.hasMatch = true;
    } else {
      inTarget2Only.push(p2);
    }
  });

  if (inTarget1Only.length === 0 && inTarget2Only.length === 0) {
    Logger.success(
      `Filenames completely match ${
        ignoreExtensions ? "(ignoring extensions)" : ""
      }`
    );
  } else {
    printPathsNotInTarget(inTarget2Only, target1);
    printPathsNotInTarget(inTarget1Only, target2);
  }

  if (outputCSVPath) {
    const headers = ["targetName", "relativePath", "hasMatch"];
    const rows = paths1.concat(paths2);
    rows.sort((a, b) => {
      return a.relativePath.localeCompare(b.relativePath);
    });
    await writeCSVWithRetryPrompt(outputCSVPath, headers, rows);
  }
};
