import json

def load_data():
    with open("data.json", "r") as f:
        return json.load(f)

def vitals_summary(vitals):
    total_hr = 0
    for v in vitals:
        total_hr += v["hr"]
    avg_hr = total_hr / len(vitals) if vitals else 0
    return avg_hr

def generate_report():
    data = load_data()
    vitals = data["vitals"]
    avg_hr = vitals_summary(vitals)

    report = {
        "average_heart_rate": avg_hr,
        "total_vitals": len(vitals)
    }

    with open("report.json", "w") as f:
        json.dump(report, f, indent=4)

generate_report()
