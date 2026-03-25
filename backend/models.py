from pydantic import BaseModel

class LuhnRequest(BaseModel):
    base: str

class VerhoeffRequest(BaseModel):
    base: str

class ValidateRequest(BaseModel):
    number: str

class HashRequest(BaseModel):
    data: str

class HmacRequest(BaseModel):
    data: str
    secret: str

class HmacVerifyRequest(BaseModel):
    data: str
    secret: str
    signature: str

class EncryptRequest(BaseModel):
    plaintext: str
    secret: str

class DecryptRequest(BaseModel):
    iv: str
    ciphertext: str
    secret: str

class SignRequest(BaseModel):
    data: str


class VerifyRequest(BaseModel):
    data: str
    signature: str

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TotpRegisterRequest(BaseModel):
    username: str
    password: str


class TotpVerifyRequest(BaseModel):
    username: str
    token: str


class FraudActivityRequest(BaseModel):
    username: str
    action: str
    ip: str
    device: str