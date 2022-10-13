import { createObjectCsvWriter } from "csv-writer";
import Logger from "./logger";
import { executeWithPromptForRetry } from "./retryPrompt";

export const writeCSVWithRetryPrompt = async (
  csvPath: string,
  headers: string[],
  rows: unknown[]
) => {
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: headers.map((h) => {
      return { id: h, title: h };
    }),
  });
  const successWritingCSV = await executeWithPromptForRetry(
    async () => await csvWriter.writeRecords(rows),
    `Could not write to ${csvPath}. Is the file open? Does the path exist?`
  );
  if (successWritingCSV) {
    Logger.success(`Wrote data to ${csvPath}`);
  } else {
    Logger.error(`Did not write data to ${csvPath}`);
  }
};
