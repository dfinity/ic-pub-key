import { execSync } from "child_process";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { program } from "../cli";

describe("CLI", () => {
  const cliPath = path.join(process.cwd(), "dist", "main.js");

  /**
   * Note: This directly calls the CLI and checks the output, however the test coverage report cannot capture which lines are tested.
   */
  it("should show help message", () => {
    const output = execSync(`node ${cliPath} --help`).toString();
    expect(output).toContain(
      "Tools for Internet Computer Protocol public keys",
    );
  });

  /**
   * Note: This uses mocks to provide test coverage reports.
   */
  it("should show help message - mocked", () => {
    // Mock console.log
    const originalConsoleLog = console.log;
    let output = "";
    console.log = (msg: string) => {
      output += msg + "\n";
    };

    // Get help text without exiting
    const helpText = program.helpInformation();

    // Restore console.log
    console.log = originalConsoleLog;

    // Check that the help text contains expected content
    expect(helpText).toContain("Usage:");
    expect(helpText).toContain("ic-pub-key");
    expect(helpText).toContain(
      "Tools for Internet Computer Protocol public keys",
    );
    expect(helpText).toContain("Options:");
    expect(helpText).toContain("--version");
    expect(helpText).toContain("--help");
  });
});
