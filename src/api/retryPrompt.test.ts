import { jest } from "@jest/globals";

import { executeWithPromptForRetry } from "./retryPrompt.js";

describe("retry prompt", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns true if fn executes successfully", async () => {
    const mockFn = jest.fn().mockReturnValue(true);
    const mockShouldRetryFn = jest.fn().mockReturnValue(true);
    expect(
      await executeWithPromptForRetry(
        mockFn,
        () => mockShouldRetryFn() as boolean
      )
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
    const mockShouldRetryFn = jest.fn().mockReturnValue(true);
    expect(
      await executeWithPromptForRetry(
        mockFn,
        () => mockShouldRetryFn() as boolean
      )
    ).toBeTruthy();
  });

  test("exits if user doesn't want to try again", async () => {
    const mockFn = jest.fn().mockImplementationOnce(() => {
      throw new Error("foo");
    });
    const mockShouldRetryFn = jest.fn().mockReturnValue(false);
    expect(
      await executeWithPromptForRetry(
        mockFn,
        () => mockShouldRetryFn() as boolean
      )
    ).toBeFalsy();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
