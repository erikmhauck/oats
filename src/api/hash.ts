import crypto, { BinaryToTextEncoding, getHashes } from "crypto";
import fs from "fs";
import Logger from "./logger.js";

export const hashAvailable = (algorithm: string) => {
  return getHashes().includes(algorithm);
};

export const createHashFromFile = (
  filePath: string,
  algorithm: string,
  encoding: BinaryToTextEncoding
) => {
  try {
    const lStats = fs.lstatSync(filePath);
    if (lStats.isDirectory()) {
      return "";
    }

    let fileBuffer: Buffer;
    if (lStats.isSymbolicLink()) {
      // use readlinkSync to ensure we hash the contents of the symlink
      // and not the file which it points to
      fileBuffer = fs.readlinkSync(filePath, { encoding: "buffer" });
    } else {
      fileBuffer = fs.readFileSync(filePath);
    }

    const hashSum = crypto.createHash(algorithm);
    hashSum.update(fileBuffer);
    return hashSum.digest(encoding);
  } catch (e) {
    Logger.error(`Failed to create hash from ${filePath}`);
    Logger.log(e);
  }
};
