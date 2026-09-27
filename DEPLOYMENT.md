# Deployment guide

This guide assumes you are using the hosted Studio development preview and GitHub plus a Vercel project for the frontend.

## 1. Create the repository

1. Create a new empty GitHub repository named `veriflow`.
2. Upload the complete contents of this project.
3. Do not upload `.env` files or private keys.

## 2. Deploy the Intelligent Contract

1. Open the GenLayer Studio development preview.
2. Select the contract editor.
3. Create a new contract and paste `contracts/veriflow.py`.
4. Confirm that the dependency header is the first contract content.
5. Deploy it with no constructor arguments.
6. Wait for the deployment transaction to finalize.
7. Copy the deployed contract address.

The current GenLayer documentation identifies Studio development preview as chain 61997 with canonical RPC `https://studio-dev.genlayer.com/api`. It also warns that the preview is a release-candidate environment and can be reset. Use the matching release-candidate SDK and CLI. 

## 3. Test the contract in Studio

Call:

`get_count()`

It should initially return `0`.

Then call:

`create_rule`

Example values:

- name: `Rainfall test`
- source_url: a public page that contains rainfall information
- metric: `rainfall`
- threshold: `100 mm`

The result should create rule ID `1`.

Call:

`get_rule(1)`

The status should be `PENDING`.

Then call:

`verify(1)`

GenLayer validators will inspect the external page and the model will extract the requested observation. The final state becomes `VERIFIED` when a supported observation is found, or `UNRESOLVED` when the source does not contain enough evidence.

## 4. Configure the frontend

Inside `frontend`, create `.env` from `.env.example`:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio-dev.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61997
```

Replace only the contract address.

## 5. Deploy the frontend

Import the GitHub repository into your hosting provider.

Set the project root to:

`frontend`

Build command:

`npm run build`

Start command for a Node deployment:

`npm run start`

Add the same three environment variables from step 4.

## 6. Wallet network

The browser wallet must be connected to the GenLayer Studio development preview, chain 61997. The application uses an EIP-1193 wallet provider and the GenLayer transaction flow.

## 7. Fee handling

Do not hard-code a pretend gas amount. Current GenLayer guidance uses fee estimation or Transaction Kit so the network can quote the transaction and the user can approve the required fee allocation.

## 8. Final test

After the frontend is live:

1. Connect the wallet.
2. Create a rule.
3. Wait for the transaction to finalize.
4. Load the returned rule ID.
5. Verify the rule.
6. Wait for consensus.
7. Refresh the rule.
8. Confirm that the observation and status are displayed.
9. Open the transaction in the Studio-dev explorer.

## Important limitation

The contract is only as reliable as the public evidence source. For a hackathon demo, use a stable public page with clearly visible information rather than a login-protected, bot-protected, or highly dynamic page.
