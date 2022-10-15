import Logger from "./logger.js";

export const executeWithPromptForRetry = async (
  functionToTry: () => Promise<unknown> | unknown,
  shouldTryAgain: () => Promise<boolean> | boolean,
  messageOnError?: string
) => {
  let functionRanWithoutError = false;
  while (!functionRanWithoutError) {
    try {
      await functionToTry();
      functionRanWithoutError = true;
    } catch {
      if (messageOnError) Logger.error(messageOnError);

      const tryAgain = await shouldTryAgain();
      if (!tryAgain) {
        break;
      }
    }
  }
  return functionRanWithoutError;
};
