import { createObjectCsvWriter } from "csv-writer";
import { parse } from "csv-parse";
import fs from "fs";
import Logger from "./logger.js";
import { executeWithPromptForRetry } from "./retryPrompt.js";
import { startSpinnerWithUpdateInterval } from "./spinner.js";
import inquirer from "inquirer";

const shouldTryAgain = async () => {
  const { tryAgain } = await inquirer.prompt([
    {
      name: "tryAgain",
      message: `Try to write CSV again?`,
      type: "confirm",
    },
  ]);
  return tryAgain;
};

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
    shouldTryAgain,
    `Could not write to ${csvPath}. Is the file open? Does the path exist?`
  );
  if (successWritingCSV) {
    Logger.success(`Wrote data to ${csvPath}`);
  } else {
    Logger.error(`Did not write data to ${csvPath}`);
  }
};

export const readCSVWithProgressSpinner = async (
  csvPath: string
): Promise<string[][]> => {
  if (!fs.existsSync(csvPath)) {
    Logger.error(`${csvPath} does not exist`);
    return undefined;
  }
  const inputStream = fs.createReadStream(csvPath, "utf8");
  const rows = [];
  const { updateSpinnerText, spinnerSucceed, spinnerFail } =
    startSpinnerWithUpdateInterval();

  return new Promise((resolve, reject) => {
    inputStream
      .pipe(parse({}))
      .on("data", function (row) {
        rows.push(row);
        updateSpinnerText(`Read ${rows.length} rows from ${csvPath}`);
      })
      .on("end", function () {
        spinnerSucceed(`Read ${rows.length} rows from ${csvPath}`);
        resolve(rows);
      })
      .on("error", () => {
        spinnerFail(`Failed to read from ${csvPath}`);
        reject();
      });
  });
};
