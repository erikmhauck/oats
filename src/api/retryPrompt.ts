import Logger from "./logger";
import inquirer from "inquirer";

export const executeWithPromptForRetry = async (
  functionToTry: () => Promise<void>,
  messageOnError?: string
) => {
  let functionRanWithError = false;
  while (!functionRanWithError) {
    try {
      await functionToTry();
      functionRanWithError = true;
    } catch {
      if (messageOnError) Logger.error(messageOnError);
      const { tryAgain } = await inquirer.prompt([
        {
          name: "tryAgain",
          message: `Try again?`,
          type: "confirm",
        },
      ]);
      if (!tryAgain) {
        return false;
      }
    }
  }
  return true;
};
