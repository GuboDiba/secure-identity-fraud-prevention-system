from fastapi import APIRouter

from algorithms.encryption import aes_decrypt, aes_encrypt
from algorithms.hashing import hmac_sha256, sha256_hash, verify_hmac_sha256
from algorithms.luhn import generate_luhn_number, validate_luhn
from algorithms.rsa_signatures import generate_rsa_keys, sign_data, verify_signature
from algorithms.verhoeff import generate_verhoeff_number, validate_verhoeff
from models import (
    DecryptRequest,
    EncryptRequest,
    HashRequest,
    HmacRequest,
    HmacVerifyRequest,
    LuhnRequest,
    SignRequest,
    ValidateRequest,
    VerhoeffRequest,
    VerifyRequest,
)


router = APIRouter(tags=["crypto"])


@router.post("/luhn/generate")
def luhn_generate(payload: LuhnRequest):
    return {"generated_id": generate_luhn_number(payload.base)}


@router.post("/luhn/validate")
def luhn_validate(payload: ValidateRequest):
    return {"valid": validate_luhn(payload.number)}


@router.post("/verhoeff/generate")
def verhoeff_generate(payload: VerhoeffRequest):
    return {"generated_id": generate_verhoeff_number(payload.base)}


@router.post("/verhoeff/validate")
def verhoeff_validate(payload: ValidateRequest):
    return {"valid": validate_verhoeff(payload.number)}


@router.post("/hash/sha256")
def hash_sha256(payload: HashRequest):
    return {"hash": sha256_hash(payload.data)}


@router.post("/hmac/generate")
def generate_hmac(payload: HmacRequest):
    return {"signature": hmac_sha256(payload.data, payload.secret)}


@router.post("/hmac/verify")
def validate_hmac(payload: HmacVerifyRequest):
    return {"valid": verify_hmac_sha256(payload.data, payload.secret, payload.signature)}


@router.post("/aes/encrypt")
def encrypt_aes(payload: EncryptRequest):
    return aes_encrypt(payload.plaintext, payload.secret)


@router.post("/aes/decrypt")
def decrypt_aes(payload: DecryptRequest):
    return {"plaintext": aes_decrypt(payload.iv, payload.ciphertext, payload.secret)}


@router.post("/rsa/generate-keys")
def rsa_generate_keys():
    return generate_rsa_keys()


@router.post("/rsa/sign")
def rsa_sign(payload: SignRequest):
    return {"signature": sign_data(payload.data)}


@router.post("/rsa/verify")
def rsa_verify(payload: VerifyRequest):
    return {"valid": verify_signature(payload.data, payload.signature)}