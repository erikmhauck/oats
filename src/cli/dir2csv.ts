import Logger from "../api/logger";
import walkSync from "walk-sync";
import { existsSync } from "fs";
import { writeCSVWithRetryPrompt } from "../api/csvUtils";
import { BinaryToTextEncoding } from "crypto";
import { createHashFromFile } from "../api/hash";
import cliProgress from "cli-progress";
import path from "path";

const addHashToRows = (
  rows: any[],
  target: string,
  hashAlgo: string,
  encoding: BinaryToTextEncoding
) => {
  Logger.log(`Creating hash for all files...`);
  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  bar1.start(rows.length, 0);
  rows = rows.map((r, index) => {
    bar1.update(index + 1);
    return {
      ...r,
      hash: createHashFromFile(path.join(target, r.path), hashAlgo, encoding),
    };
  });
  bar1.stop();
  return rows;
};

export const dir2csv = async (
  target: string,
  outputCSVPath: string,
  includeStats: boolean,
  hashAlgo: string,
  encoding: BinaryToTextEncoding
) => {
  if (!existsSync(target)) {
    Logger.error(`Target directory does not exist: ${target}`);
  } else {
    Logger.log(`Getting all files in directory ${target}`);
    const headers = ["path"];
    let rows = [];

    if (includeStats) {
      headers.push("path", "mode", "size", "mtime", "isDirectory");
      const paths = walkSync.entries(target);
      rows = paths.map((p) => {
        return {
          path: p.relativePath,
          mode: p.mode,
          size: p.size,
          mtime: p.mtime,
          isDirectory: p.isDirectory().toString(),
        };
      });
    } else {
      rows = walkSync(target).map((p) => {
        return { path: p };
      });
    }

    Logger.log(`Found ${rows.length} files.`);

    if (hashAlgo) {
      headers.push("hash");
      rows = addHashToRows(rows, target, hashAlgo, encoding);
    }

    await writeCSVWithRetryPrompt(outputCSVPath, headers, rows);
  }
};
