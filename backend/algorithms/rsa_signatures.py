from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import base64

from core.config import settings


KEYS_DIR = settings.rsa_keys_dir
PRIVATE_KEY_PATH = KEYS_DIR / "private_key.pem"
PUBLIC_KEY_PATH = KEYS_DIR / "public_key.pem"


# -----------------------------
# Generate RSA keys
# -----------------------------
def generate_rsa_keys():
    KEYS_DIR.mkdir(parents=True, exist_ok=True)

    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    public_key = private_key.public_key()

    # Write private key
    with open(PRIVATE_KEY_PATH, "wb") as f:
        f.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption()
            )
        )

    # Write public key
    with open(PUBLIC_KEY_PATH, "wb") as f:
        f.write(
            public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
        )

    return {"message": "RSA key pair generated successfully"}


# -----------------------------
# Load existing keys
# -----------------------------
def load_private_key():
    if not PRIVATE_KEY_PATH.exists():
        raise RuntimeError("RSA private key not found. Generate keys first.")
    with open(PRIVATE_KEY_PATH, "rb") as f:
        return serialization.load_pem_private_key(f.read(), password=None)


def load_public_key():
    if not PUBLIC_KEY_PATH.exists():
        raise RuntimeError("RSA public key not found. Generate keys first.")
    with open(PUBLIC_KEY_PATH, "rb") as f:
        return serialization.load_pem_public_key(f.read())


# -----------------------------
# Sign data
# -----------------------------
def sign_data(data: str) -> str:
    private_key = load_private_key()

    signature = private_key.sign(
        data.encode(),
        padding.PKCS1v15(),
        hashes.SHA256()
    )

    return base64.b64encode(signature).decode()


# -----------------------------
# Verify signature
# -----------------------------
def verify_signature(data: str, signature: str) -> bool:
    public_key = load_public_key()

    try:
        public_key.verify(
            base64.b64decode(signature),
            data.encode(),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False