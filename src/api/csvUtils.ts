import { createObjectCsvWriter } from "csv-writer";
import { parse } from "csv-parse";
import fs from "fs";
import Logger from "./logger.js";
import { executeWithPromptForRetry } from "./retryPrompt.js";
import { startSpinnerWithUpdateInterval } from "./spinner.js";
import inquirer from "inquirer";

const shouldTryAgain = async (csvPath: string) => {
  const answers = await inquirer.prompt([
    {
      name: "tryAgain",
      message: " ",
      type: "list",
      choices: [
        { name: `Try to write to ${csvPath} again`, value: true },
        { name: "Enter new path to save data to", value: false },
      ],
    },
  ]);
  return answers.tryAgain;
};

const writeCSVToPath = async (
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
  await csvWriter.writeRecords(rows);
};

const promptForNewPath = async (oldPath: string) => {
  const answers = await inquirer.prompt([
    {
      name: "newPath",
      message: "Path to save CSV to:",
      type: "input",
      default: oldPath,
    },
  ]);
  return answers.newPath;
};

export const writeCSVWithRetryPrompt = async (
  csvPath: string,
  headers: string[],
  rows: unknown[]
) => {
  let successWritingCSV = false;
  while (!successWritingCSV) {
    successWritingCSV = await executeWithPromptForRetry(
      async () => await writeCSVToPath(csvPath, headers, rows),
      async () => await shouldTryAgain(csvPath),
      `Failed to write data to ${csvPath}`
    );
    if (successWritingCSV) {
      Logger.success(`Wrote data to ${csvPath}`);
    } else {
      csvPath = await promptForNewPath(csvPath);
    }
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
