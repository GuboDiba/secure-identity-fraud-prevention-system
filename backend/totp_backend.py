from app_factory import create_application


app = create_application(
    title="TOTP Service",
    include_totp=True,
)