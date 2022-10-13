import Logger from "../api/logger";
import walkSync from "walk-sync";
import { existsSync } from "fs";
import { writeCSVWithRetryPrompt } from "../api/csvUtils";

export const dir2csv = async (
  target: string,
  outputCSVPath: string,
  includeStats: boolean
) => {
  if (!existsSync(target)) {
    Logger.error(`Target directory does not exist: ${target}`);
  } else {
    Logger.log(`Getting all files in directory ${target}`);
    let headers = [];
    let rows = [];
    if (includeStats) {
      const paths = walkSync.entries(target);
      headers = [
        "relativePath",
        "basePath",
        "mode",
        "size",
        "mtime",
        "isDirectory",
      ];
      rows = paths.map((p) => {
        return {
          relativePath: p.relativePath,
          basePath: p.basePath,
          mode: p.mode,
          size: p.size,
          mtime: p.mtime,
          isDirectory: p.isDirectory().toString(),
        };
      });
    } else {
      headers = ["path"];
      rows = walkSync(target).map((p) => {
        return { path: p };
      });
    }

    Logger.log(`Found ${rows.length} files.`);

    await writeCSVWithRetryPrompt(outputCSVPath, headers, rows);
  }
};
