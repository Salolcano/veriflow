import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const code = await Bun.file("contracts/veriflow.py").text();
const client = createClient({ chain: studioDevnet });

// The exact CLI deployment command is intentionally delegated to the
// matching GenLayer CLI release so wallet and fee handling stay network aware.
console.log("Contract source loaded:", code.length, "bytes");
console.log("Use the GenLayer CLI deploy flow for studio-dev with this contract.");
