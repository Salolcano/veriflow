# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }

import json
import typing
import genlayer as gl
from genlayer.types import *


class VeriFlow(gl.contract.Contract):
    next_id: u256
    names: gl.storage.TreeMap[u256, str]
    urls: gl.storage.TreeMap[u256, str]
    metrics: gl.storage.TreeMap[u256, str]
    thresholds: gl.storage.TreeMap[u256, str]
    statuses: gl.storage.TreeMap[u256, str]
    observations: gl.storage.TreeMap[u256, str]
    decisions: gl.storage.TreeMap[u256, bool]
    owners: gl.storage.TreeMap[u256, Address]

    def __init__(self) -> None:
        self.next_id = 1

    @gl.public.write
    def create_rule(
        self,
        name: str,
        source_url: str,
        metric: str,
        threshold: str,
    ) -> u256:
        if len(name) == 0:
            raise gl.vm.UserError("name is required")
        if len(source_url) == 0:
            raise gl.vm.UserError("source URL is required")
        if len(metric) == 0:
            raise gl.vm.UserError("metric is required")

        event_id = self.next_id
        self.names[event_id] = name
        self.urls[event_id] = source_url
        self.metrics[event_id] = metric
        self.thresholds[event_id] = threshold
        self.statuses[event_id] = "PENDING"
        self.observations[event_id] = ""
        self.decisions[event_id] = False
        self.owners[event_id] = gl.message.sender_address
        self.next_id = event_id + 1
        return event_id

    @gl.public.write
    def verify(self, event_id: u256) -> None:
        if self.names.get(event_id, "") == "":
            raise gl.vm.UserError("rule not found")
        if self.statuses.get(event_id, "") == "VERIFIED":
            raise gl.vm.UserError("rule already verified")

        source_url = self.urls[event_id]
        metric = self.metrics[event_id]
        threshold = self.thresholds[event_id]
        rule_name = self.names[event_id]

        def inspect_source() -> str:
            page = gl.nondet.web.render(source_url, mode="text")
            prompt = f"""
You are verifying a real-world event for a deterministic smart contract.

Rule name: {rule_name}
Metric to find: {metric}
Threshold: {threshold}

Source page:
{page}

Extract the best supported numeric observation for the requested metric from
this page. Do not invent a value. If the page does not contain enough evidence,
return an unresolved result.

Return ONLY valid JSON with exactly these keys:
{{
  "found": true or false,
  "value": number,
  "unit": "string",
  "meets_threshold": true or false,
  "observation": "short evidence statement"
}}

If no reliable numeric observation exists, use found=false, value=0,
meets_threshold=false, and explain why in observation.
"""
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "").strip()
            data = json.loads(result)
            return json.dumps(
                {
                    "found": bool(data.get("found", False)),
                    "value": float(data.get("value", 0)),
                    "unit": str(data.get("unit", "")),
                    "meets_threshold": bool(data.get("meets_threshold", False)),
                    "observation": str(data.get("observation", "")),
                },
                sort_keys=True,
            )

        result = gl.eq_principle.prompt_comparative(
            inspect_source,
            "The validators must agree on the found flag and the threshold decision. "
            "The numeric observation may have minor formatting differences, but the "
            "decision must represent the same source evidence and threshold result.",
        )

        parsed = json.loads(result)
        if not parsed.get("found", False):
            self.statuses[event_id] = "UNRESOLVED"
            self.observations[event_id] = parsed.get("observation", "No reliable observation")
            self.decisions[event_id] = False
            return

        self.statuses[event_id] = "VERIFIED"
        self.observations[event_id] = json.dumps(parsed, sort_keys=True)
        self.decisions[event_id] = bool(parsed.get("meets_threshold", False))

    @gl.public.view
    def get_rule(self, event_id: u256) -> dict[str, typing.Any]:
        return {
            "id": event_id,
            "name": self.names.get(event_id, ""),
            "source_url": self.urls.get(event_id, ""),
            "metric": self.metrics.get(event_id, ""),
            "threshold": self.thresholds.get(event_id, ""),
            "status": self.statuses.get(event_id, ""),
            "observation": self.observations.get(event_id, ""),
            "decision": self.decisions.get(event_id, False),
            "owner": self.owners.get(event_id, Address("0x0000000000000000000000000000000000000000")).as_hex,
        }

    @gl.public.view
    def get_count(self) -> u256:
        return self.next_id - 1
