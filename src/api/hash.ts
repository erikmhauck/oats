import crypto, { BinaryToTextEncoding, getHashes } from "crypto";
import fs from "fs";

export const hashAvailable = (algorithm: string) => {
  return getHashes().includes(algorithm);
};

export const createHashFromFile = (
  filePath: string,
  algorithm: string,
  encoding: BinaryToTextEncoding
) => {
  if (fs.lstatSync(filePath).isDirectory()) {
    return "";
  }

  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash(algorithm);
  hashSum.update(fileBuffer);
  return hashSum.digest(encoding);
};
