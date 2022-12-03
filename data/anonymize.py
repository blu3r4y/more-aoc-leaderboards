# just a short helper script to anonymize some json files

import json
import random
import argparse

from faker import Faker


def anonymize_json(path):
    with open(path) as f:
        payload = json.load(f)

    # new fake data
    fake = Faker()
    num_members = len(payload["members"])
    samples = random.sample(range(1_000_000), num_members)

    keys = list(payload["members"])
    for key, no in zip(keys, samples):
        member = payload["members"][key]
        member["id"] = no
        member["name"] = fake.name() if no % 2 == 0 else fake.first_name()

        # replace member
        del payload["members"][key]
        payload["members"][no] = member

    result = path.replace(".json", "-anon.json")
    with open(result, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"created {result}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("path")

    args = parser.parse_args()
    anonymize_json(args.path)
