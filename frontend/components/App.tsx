"use client";

import { useEffect, useMemo, useState } from "react";
import { createTransactionKit } from "@genlayer/transaction-kit";
import { GenLayerTransactionPanel } from "@genlayer/transaction-kit-react";
import "@genlayer/transaction-kit-react/styles.css";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { contractAddress, explorerUrl } from "../lib/network";

const rpc = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio-dev.genlayer.com/api";

async function rpcCall(method: string, params: unknown[]) {
  const r = await fetch(rpc, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }) });
  const json = await r.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

export default function App() {
  const [account, setAccount] = useState<string>("");
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Rainfall trigger");
  const [url, setUrl] = useState("https://www.weather.gov/");
  const [metric, setMetric] = useState("rainfall");
  const [threshold, setThreshold] = useState("100 mm");
  const [selected, setSelected] = useState<number | null>(null);
  const [rule, setRule] = useState<any>(null);
  const [error, setError] = useState("");

  const txKit = useMemo(() => {
    if (typeof window === "undefined" || !account || !(window as any).ethereum) return null;
    return createTransactionKit({ chain: studioDevnet, provider: (window as any).ethereum, account: account as `0x${string}` });
  }, [account]);

  const refresh = async () => {
    if (!contractAddress) return;
    try {
      const client = createClient({ chain: studioDevnet });
      const value = await client.readContract({ address: contractAddress, functionName: "get_count", args: [] });
      const n = Number(value);
      setCount(n);
      if (selected) {
        const item = await client.readContract({ address: contractAddress, functionName: "get_rule", args: [BigInt(selected)] });
        setRule(item);
      }
    } catch (e: any) { setError(e?.message || "Could not read contract"); }
  };

  useEffect(() => { refresh(); }, [selected]);

  const connect = async () => {
    setError("");
    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("Install a browser wallet that supports EIP-1193.");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (e: any) { setError(e?.message || "Wallet connection failed"); }
  };

  const tx = txKit && selected === null ? { kind: "write" as const, address: contractAddress, method: "create_rule", args: [name, url, metric, threshold] } : txKit && selected !== null ? { kind: "write" as const, address: contractAddress, method: "verify", args: [selected] } : null;

  return <main className="shell">
    <div className="top"><div><div className="brand">VeriFlow</div><div className="small">Consensus based event verification</div></div><button className="button primary" onClick={connect}>{account ? `${account.slice(0,6)}…${account.slice(-4)}` : "Connect wallet"}</button></div>
    <section className="hero"><div className="eyebrow">GenLayer intelligent contract</div><h1>Turn real world evidence into a verifiable on chain decision.</h1><p>Create a rule, point it at a public source, and let independent validators inspect the evidence before the contract records the result.</p></section>
    {!contractAddress && <div className="notice">Add NEXT_PUBLIC_CONTRACT_ADDRESS after deploying the contract in Studio-dev. The interface is ready, but it cannot read or write until an address is configured.</div>}
    {error && <div className="notice">{error}</div>}
    <div className="grid">
      <section className="panel"><h2>Create verification rule</h2>
        <div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="field"><label>Public evidence URL</label><input value={url} onChange={e=>setUrl(e.target.value)} /></div>
        <div className="field"><label>Metric to extract</label><input value={metric} onChange={e=>setMetric(e.target.value)} /></div>
        <div className="field"><label>Threshold</label><input value={threshold} onChange={e=>setThreshold(e.target.value)} /></div>
        {tx && <div className="tx"><GenLayerTransactionPanel kit={txKit!} tx={tx} network="studio-dev" /></div>}
        {!txKit && <p className="small">Connect your wallet to generate a fee aware transaction panel.</p>}
      </section>
      <section className="panel"><h2>Network</h2><p className="small">Studio development preview · chain 61997</p><p className="small">Rules recorded: <strong>{count}</strong></p><a className="small" href={explorerUrl} target="_blank">Open explorer ↗</a><div style={{marginTop:24}}><h2>Verify an existing rule</h2><div className="row"><input placeholder="Rule ID" onChange={e=>setSelected(Number(e.target.value)||null)} /><button className="button" onClick={refresh}>Load</button></div></div></section>
    </div>
    <section className="panel" style={{marginTop:18}}><h2>Current rule</h2>{rule ? <div className="event"><h3>{rule.name}</h3><div className="row"><span className={`status ${rule.status === "VERIFIED" ? "good" : "warn"}`}>{rule.status}</span><span className="small">Decision: {rule.decision ? "threshold met" : "threshold not met"}</span></div><p className="small">{rule.metric} · {rule.threshold}</p><p className="mono">{rule.observation || "No observation yet."}</p>{selected && txKit && <div className="tx"><GenLayerTransactionPanel kit={txKit} tx={{kind:"write",address:contractAddress,method:"verify",args:[selected]}} network="studio-dev" /></div>}</div> : <div className="empty">Enter a rule ID and load it.</div>}</section>
    <div className="footer">The frontend reads finalized contract state and uses the network transaction flow for writes.</div>
  </main>;
}
