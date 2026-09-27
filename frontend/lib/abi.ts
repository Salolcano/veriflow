export const VERIFLOW_ABI = [
  { type: "function", name: "create_rule", stateMutability: "nonpayable", inputs: [
    { name: "name", type: "string" }, { name: "source_url", type: "string" },
    { name: "metric", type: "string" }, { name: "threshold", type: "string" }
  ], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "verify", stateMutability: "nonpayable", inputs: [{ name: "event_id", type: "uint256" }], outputs: [] },
  { type: "function", name: "get_rule", stateMutability: "view", inputs: [{ name: "event_id", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [
    { name: "id", type: "uint256" }, { name: "name", type: "string" }, { name: "source_url", type: "string" },
    { name: "metric", type: "string" }, { name: "threshold", type: "string" }, { name: "status", type: "string" },
    { name: "observation", type: "string" }, { name: "decision", type: "bool" }, { name: "owner", type: "address" }
  ] }] },
  { type: "function", name: "get_count", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] }
] as const;
