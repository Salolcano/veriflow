
def test_create_rule(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy("contracts/veriflow.py")
    direct_vm.sender = direct_alice
    event_id = contract.create_rule(
        "Rain threshold",
        "https://example.org/weather",
        "rainfall",
        "100 mm",
    )
    assert event_id == 1
    rule = contract.get_rule(1)
    assert rule["name"] == "Rain threshold"
    assert rule["status"] == "PENDING"
