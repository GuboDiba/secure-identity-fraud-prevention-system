from app_factory import create_application


app = create_application(
    title="Secure Identity & Fraud Prevention API",
    include_crypto=True,
    include_auth=True,
    include_totp=True,
    include_fraud=True,
    include_analytics=True,
)