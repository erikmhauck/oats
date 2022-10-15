import ora from "ora";

export const startSpinnerWithUpdateInterval = (interval = 100) => {
  let canUpdate = true;
  const spinner = ora().start();

  const spinnerTextUpdateInterval = setInterval(() => {
    canUpdate = true;
  }, interval);

  const updateSpinnerText = (newText: string) => {
    if (canUpdate) {
      spinner.text = newText;
      canUpdate = false;
    }
  };

  const spinnerSucceed = (successText: string) => {
    spinner.succeed(successText);
    clearInterval(spinnerTextUpdateInterval);
  };

  const spinnerFail = (failText: string) => {
    spinner.fail(failText);
    clearInterval(spinnerTextUpdateInterval);
  };

  return { updateSpinnerText, spinnerSucceed, spinnerFail };
};
