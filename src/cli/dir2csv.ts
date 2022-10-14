import Logger from "../api/logger.js";
import { walk } from "../api/walk.js";
import { existsSync } from "fs";
import { writeCSVWithRetryPrompt } from "../api/csvUtils.js";
import { BinaryToTextEncoding } from "crypto";
import { createHashFromFile } from "../api/hash.js";
import cliProgress from "cli-progress";
import path from "path";
import klaw from "klaw";

interface IFileRow {
  path: string;
  mode?: number;
  size?: number;
  mtime?: number;
  isDirectory?: string;
  hash?: string;
}

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
    const headers = ["path"];
    if (includeStats) headers.push("mode", "size", "mtime", "isDirectory");
    if (hashAlgo) headers.push("hash");

    const walkItems: klaw.Item[] = await walk(target);

    Logger.log(`Processing results...`);
    const bar1 = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );

    bar1.start(walkItems.length, 0);
    const rows: IFileRow[] = walkItems.map((w, index) => {
      bar1.update(index + 1);
      const newRow: IFileRow = { path: w.path };
      if (includeStats) {
        newRow.isDirectory = w.stats.isDirectory().toString();
        newRow.mode = w.stats.mode;
        newRow.mtime = w.stats.mtimeMs;
        newRow.size = w.stats.size;
      }
      if (hashAlgo) {
        newRow.hash = createHashFromFile(
          path.join(target, w.path),
          hashAlgo,
          encoding
        );
      }
      return newRow;
    });
    bar1.stop();

    await writeCSVWithRetryPrompt(outputCSVPath, headers, rows);
  }
};
