from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64
import hashlib

def derive_key(secret: str) -> bytes:
    return hashlib.sha256(secret.encode()).digest()

def pad(text: str) -> bytes:
    pad_len = 16 - (len(text) % 16)
    return text.encode() + bytes([pad_len]) * pad_len

def unpad(data: bytes) -> str:
    pad_len = data[-1]
    return data[:-pad_len].decode()

def aes_encrypt(plaintext: str, secret: str):
    key = derive_key(secret)
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted_bytes = cipher.encrypt(pad(plaintext))
    return {
        "iv": base64.b64encode(iv).decode(),
        "ciphertext": base64.b64encode(encrypted_bytes).decode()
    }

def aes_decrypt(iv: str, ciphertext: str, secret: str) -> str:
    key = derive_key(secret)
    iv = base64.b64decode(iv)
    encrypted_data = base64.b64decode(ciphertext)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_bytes = cipher.decrypt(encrypted_data)
    return unpad(decrypted_bytes)