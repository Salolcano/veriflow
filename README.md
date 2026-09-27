# VeriFlow

VeriFlow is a GenLayer application for turning public web evidence into an on-chain verification result.

## Architecture

The Intelligent Contract stores verification rules and their results. A verification transaction renders the configured public page, asks the model to extract the requested metric, and uses GenLayer consensus to validate the decision before the deterministic contract state is updated.

The frontend is a Next.js application. Reads use `genlayer-js`. Writes use the GenLayer Transaction Kit so users see the fee approval and transaction lifecycle before signing.

## Network

The target environment is the GenLayer Studio development preview.

- Chain ID: 61997
- RPC: `https://studio-dev.genlayer.com/api`
- Explorer: `https://explorer-studio-dev.genlayer.com/`

The browser alias `studio-next.genlayer.com` may point at this same preview, but programmatic integrations should use the canonical Studio-dev RPC.

## Contract

`contracts/veriflow.py` provides:

- `create_rule(name, source_url, metric, threshold)`
- `verify(event_id)`
- `get_rule(event_id)`
- `get_count()`

The contract deliberately keeps non-deterministic web and model operations inside an equivalence-principle block. The final storage writes happen only after consensus returns the result.

## Frontend configuration

Create the frontend environment from `.env.example` and set the deployed contract address:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio-dev.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61997
```

## Contract deployment

Use the current GenLayer Studio development-preview toolchain. Deploy `contracts/veriflow.py`, initialize it with no constructor arguments, and record the resulting contract address.

Before deployment, run the contract linter against the contract. Then exercise `create_rule`, `get_rule`, and `verify` in Studio with a public page that contains a stable, readable metric.

## Frontend deployment

The frontend is contained in `/frontend`. Set the three environment variables above in your hosting environment and run the standard Next.js production build.

## Notes

The external source must be publicly reachable by GenLayer validators. Dynamic pages, bot-protected pages, login-required pages, and pages that do not expose the requested metric can result in an unresolved verification.
