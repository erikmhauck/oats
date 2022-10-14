import { executeWithPromptForRetry } from "./retryPrompt.js";

import inquirer from "inquirer";
jest.mock("inquirer", () => jest.fn());

describe("retry prompt", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns true if fn executes successfully", async () => {
    const mockFn = jest.fn().mockReturnValueOnce(true);
    expect(
      await executeWithPromptForRetry(() => mockFn("foo.txt", "bar"))
    ).toBeTruthy();
  });

  test("prompts for input if fn fails to execute until success", async () => {
    const mockFn = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("foo");
      })
      .mockImplementationOnce(() => {
        throw new Error("foo");
      })
      .mockReturnValueOnce(() => {
        true;
      });
    (inquirer.prompt as jest.MockedFunction<any>) = jest
      .fn()
      .mockResolvedValue({ tryAgain: true });
    expect(
      await executeWithPromptForRetry(() => mockFn("foo.txt", "bar"))
    ).toBeTruthy();
  });

  test("exits if user doesn't want to try again", async () => {
    const mockFn = jest.fn().mockImplementationOnce(() => {
      throw new Error("foo");
    });
    (inquirer.prompt as jest.MockedFunction<any>) = jest
      .fn()
      .mockResolvedValue({ tryAgain: false });
    expect(
      await executeWithPromptForRetry(() => mockFn("foo.txt", "bar"))
    ).toBeFalsy();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
