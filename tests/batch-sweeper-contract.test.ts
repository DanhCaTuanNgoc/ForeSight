import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactPath = path.resolve(__dirname, "../contracts/ForeSightBatchSweeper.json");

describe("ForeSightBatchSweeper Smart Contract Verification", () => {
  it("verifies compiled artifact exists with valid bytecode and ABI", () => {
    expect(fs.existsSync(artifactPath)).toBe(true);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    expect(artifact.contractName).toBe("ForeSightBatchSweeper");
    expect(artifact.bytecode).toBeDefined();
    expect(artifact.bytecode.startsWith("0x")).toBe(true);
    expect(artifact.bytecode.length).toBeGreaterThan(1000);
    expect(artifact.abi).toBeDefined();
    expect(Array.isArray(artifact.abi)).toBe(true);
  });

  it("exposes all required batch functions in ABI", () => {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const functionNames = artifact.abi
      .filter((item: any) => item.type === "function")
      .map((item: any) => item.name);

    expect(functionNames).toContain("batchSweep");
    expect(functionNames).toContain("batchApprove");
    expect(functionNames).toContain("batchSetOperatorApproval");
    expect(functionNames).toContain("batchBoth");
  });

  it("exposes all telemetry and audit events in ABI", () => {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const eventNames = artifact.abi
      .filter((item: any) => item.type === "event")
      .map((item: any) => item.name);

    expect(eventNames).toContain("BatchSweepExecuted");
    expect(eventNames).toContain("BatchApprovalExecuted");
    expect(eventNames).toContain("BatchOperatorDelegated");
  });

  it("validates batchSweep parameter types in ABI", () => {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const sweepFn = artifact.abi.find(
      (item: any) => item.type === "function" && item.name === "batchSweep"
    );

    expect(sweepFn).toBeDefined();
    expect(sweepFn.inputs.length).toBe(2);
    expect(sweepFn.inputs[0].name).toBe("settlement");
    expect(sweepFn.inputs[0].type).toBe("address");
    expect(sweepFn.inputs[1].name).toBe("pools");
    expect(sweepFn.inputs[1].type).toBe("address[]");

    expect(sweepFn.outputs.length).toBe(2);
    expect(sweepFn.outputs[0].name).toBe("successCount");
    expect(sweepFn.outputs[0].type).toBe("uint256");
    expect(sweepFn.outputs[1].name).toBe("totalPayout");
    expect(sweepFn.outputs[1].type).toBe("uint256");
  });
});
