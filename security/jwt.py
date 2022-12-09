import jwt
import os
import datetime
from dotenv import load_dotenv
load_dotenv()


def encoded(user_id, exp_date):
    payload = {
        "id": user_id,
        "exp": exp_date

    }
    return jwt.encode(payload, os.getenv('secret_key'), algorithm="HS256")


def decoded(token):
    null_message= { "data" : None }

    try:
        user_info = jwt.decode(token, os.getenv('secret_key'), algorithms=["HS256"])
        return user_info
        
    except jwt.ExpiredSignatureError:
        return null_message, 200