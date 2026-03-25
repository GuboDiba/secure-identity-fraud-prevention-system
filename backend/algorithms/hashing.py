import hmac
import hashlib
import base64

def sha256_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def hmac_sha256(data: str, secret: str) -> str:
    signature = hmac.new(secret.encode(), data.encode(), hashlib.sha256).digest()
    return base64.b64encode(signature).decode()

def verify_hmac_sha256(data: str, secret: str, signature: str) -> bool:
    expected = hmac_sha256(data, secret)
    return hmac.compare_digest(expected, signature)