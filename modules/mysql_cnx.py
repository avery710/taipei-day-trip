import mysql.connector
import mysql.connector.pooling
import os
from dotenv import load_dotenv
load_dotenv()


def open_cnx_pool():
    dbconfig = {
        "host" : "localhost",
        "user" : os.getenv('db_user'),
        "password" : os.getenv('db_pw'),
        "database" : "taipei_trip"
    }

    cnx_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name = "mysql_pool",
        pool_size = 5,
        autocommit = True,
        **dbconfig
    )

    return cnx_pool


cnx_pool = open_cnx_pool()