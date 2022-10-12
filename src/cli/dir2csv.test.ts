import { dir2csv } from "./dir2csv";

import walkSync from "walk-sync";
import { writeFileSync } from "fs";
jest.mock("walk-sync");
jest.mock("fs");

describe("dir2csv", () => {
  test("Writes the contents split by newline", () => {
    const expectedPaths = ["foo/1.txt", "foo/2.txt"];
    const expectedOutputFile = "bar.csv";
    (walkSync as jest.MockedFunction<any>).mockReturnValueOnce(expectedPaths);
    dir2csv("foo", expectedOutputFile);
    expect(writeFileSync as jest.MockedFunction<any>).toHaveBeenCalledWith(
      expectedOutputFile,
      expectedPaths.join("\n")
    );
  });
});
