from fastapi import FastAPI, Body
from datetime import datetime, timedelta

app = FastAPI(title="Fraud Detection Engine")

user_activity_log = []   
fraud_logs = []          

VELOCITY_THRESHOLD = 5
RISK_SCORE_THRESHOLD = 10

@app.post("/fraud/log_activity")
def log_activity(username: str = Body(...), action: str = Body(...), ip: str = Body(...), device: str = Body(...)):
    now = datetime.utcnow()
    entry = {"username": username, "action": action, "ip": ip, "device": device, "time": now}
    user_activity_log.append(entry)
    
    risk_score = 0


recent_actions = [
    a for a in user_activity_log 
    if a["username"] == username and now - a["time"] < timedelta(minutes=1)
]

excess_actions = len(recent_actions) - VELOCITY_THRESHOLD
if excess_actions > 0:
    risk_score += excess_actions  
    
    same_device_users = [a["username"] for a in user_activity_log if a["device"] == device and a["username"] != username]
    if same_device_users:
        risk_score += 5

    user_ips = [a["ip"] for a in user_activity_log if a["username"] == username]
    if len(set(user_ips)) > 2:
        risk_score += 3

    decision = "allow" if risk_score < RISK_SCORE_THRESHOLD else "block"

    if decision == "block":
        fraud_logs.append({"username": username, "action": action, "risk_score": risk_score, "time": now})

    return {"risk_score": risk_score, "decision": decision}

@app.get("/fraud/logs")
def get_fraud_logs():
    return fraud_logs