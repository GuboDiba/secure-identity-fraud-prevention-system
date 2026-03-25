from fastapi import FastAPI, Body
from datetime import datetime, timedelta

app = FastAPI(title="Fraud Detection Engine")

# In-memory "database"
user_activity_log = []   # logs of all user actions
fraud_logs = []          # logs of suspicious actions

# Example thresholds
VELOCITY_THRESHOLD = 5
RISK_SCORE_THRESHOLD = 10

# Step 3: Log activity + fraud checks
@app.post("/fraud/log_activity")
def log_activity(username: str = Body(...), action: str = Body(...), ip: str = Body(...), device: str = Body(...)):
    now = datetime.utcnow()
    entry = {"username": username, "action": action, "ip": ip, "device": device, "time": now}
    user_activity_log.append(entry)
    
    # Run fraud checks
    risk_score = 0

    # 1️⃣ Frequency check
   # Corrected velocity scoring
recent_actions = [
    a for a in user_activity_log 
    if a["username"] == username and now - a["time"] < timedelta(minutes=1)
]

# Add 1 point per action over threshold
excess_actions = len(recent_actions) - VELOCITY_THRESHOLD
if excess_actions > 0:
    risk_score += excess_actions  # risk_score grows with repeated violations
    
    # 2️⃣ Device fingerprinting check
    same_device_users = [a["username"] for a in user_activity_log if a["device"] == device and a["username"] != username]
    if same_device_users:
        risk_score += 5

    # 3️⃣ Geolocation check (simple IP change)
    user_ips = [a["ip"] for a in user_activity_log if a["username"] == username]
    if len(set(user_ips)) > 2:
        risk_score += 3

    decision = "allow" if risk_score < RISK_SCORE_THRESHOLD else "block"

    # Log if suspicious
    if decision == "block":
        fraud_logs.append({"username": username, "action": action, "risk_score": risk_score, "time": now})

    return {"risk_score": risk_score, "decision": decision}

# Step 4: View fraud logs
@app.get("/fraud/logs")
def get_fraud_logs():
    return fraud_logs