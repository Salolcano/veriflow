import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const readClient = createClient({ chain: studioDevnet });

export const explorerUrl = "https://explorer-studio-dev.genlayer.com";
