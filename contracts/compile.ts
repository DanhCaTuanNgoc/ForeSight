import solc from "solc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.resolve(__dirname, "ForeSightBatchSweeper.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "ForeSightBatchSweeper.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

console.log("Compiling ForeSightBatchSweeper.sol...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const err of output.errors) {
    console.log(err.formattedMessage);
    if (err.severity === "error") hasError = true;
  }
  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts["ForeSightBatchSweeper.sol"]["ForeSightBatchSweeper"];
const abi = contract.abi;
const bytecode = "0x" + contract.evm.bytecode.object;

console.log(`✅ Compiled successfully! Bytecode length: ${bytecode.length} chars, ABI methods: ${abi.length}`);

// Save artifact
const artifact = {
  contractName: "ForeSightBatchSweeper",
  abi,
  bytecode,
};

fs.writeFileSync(
  path.resolve(__dirname, "ForeSightBatchSweeper.json"),
  JSON.stringify(artifact, null, 2),
  "utf8"
);
console.log("✅ Saved artifact to contracts/ForeSightBatchSweeper.json");
