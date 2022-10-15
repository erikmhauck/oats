import Logger from "./logger.js";

export const executeWithPromptForRetry = async (
  functionToTry: () => Promise<unknown> | unknown,
  shouldTryAgain: (e: unknown) => Promise<boolean> | boolean,
  messageOnError?: string
) => {
  let functionRanWithoutError = false;
  while (!functionRanWithoutError) {
    try {
      await functionToTry();
      functionRanWithoutError = true;
    } catch (e: unknown) {
      if (messageOnError) Logger.error(messageOnError);

      const tryAgain = await shouldTryAgain(e);
      if (!tryAgain) {
        break;
      }
    }
  }
  return functionRanWithoutError;
};
