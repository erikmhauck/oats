import crypto, { BinaryToTextEncoding, getHashes } from "crypto";
import fs from "fs";

export const createHashFromFile = (
  filePath: string,
  algorithm: string,
  encoding: BinaryToTextEncoding
) => {
  if (!getHashes().includes(algorithm)) {
    throw new Error(`Hash algorithm ${algorithm} not available`);
  }
  if (fs.lstatSync(filePath).isDirectory()) {
    return "";
  }

  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash(algorithm);
  hashSum.update(fileBuffer);
  return hashSum.digest(encoding);
};
