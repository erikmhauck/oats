import walkSync from "walk-sync";
import fs from "fs";

export const dir2csv = (target: string, output: string) => {
  console.log(`Getting all files in directory ${target}...`);
  const paths = walkSync(target);
  console.log(`Found ${paths.length} files.`);
  fs.writeFileSync(output, paths.join("\n"));
  console.log(`Wrote output to ${output}`);
};
