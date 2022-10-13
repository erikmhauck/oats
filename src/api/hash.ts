import crypto from "crypto";
import fs from "fs";

type HashAlgo = "sha256" | "sha512";
type Encoding = "hex" | "base64";

export const createHash = (
  filePath: string,
  algorithm: HashAlgo,
  encoding: Encoding
) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash(algorithm);
  hashSum.update(fileBuffer);
  return hashSum.digest(encoding);
};
