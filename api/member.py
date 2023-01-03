from flask import *
from modules.mysql_cnx import cnx_pool
import modules.jwt as jwtModule
import modules.email_check as emailModule
import datetime
from flask_bcrypt import Bcrypt


member_app = Blueprint("member_app", __name__)
bcrypt = Bcrypt()


# sign up a new user account
@member_app.route("/api/user", methods=['POST'])
def signup():
	name = request.form.get('name')
	email = request.form.get('email')
	password = request.form.get('password')

	# filter data before saving to db
	if not name:
		error_message = {
			"error": True,
			"message": "請輸入姓名"
		}
		return jsonify(error_message), 400

	# check email not none and match the regular expression
	if not email or not emailModule.isValid(email):
		error_message = {
			"error": True,
			"message": "email格式錯誤，請重新輸入"
		}
		return jsonify(error_message), 400

	if len(password) < 8:
		error_message = {
			"error": True,
			"message": "密碼格式錯誤，請重新輸入"
		}
		return jsonify(error_message), 400

	# hash the password using bcrypt lib
	pw_hash = bcrypt.generate_password_hash(password)

	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		email_repeat_check = (
			"SELECT email FROM user "
			"WHERE email = %s"
		)
		my_cursor.execute(email_repeat_check, (email,))
		repeat_email = my_cursor.fetchone()

		if repeat_email:
			error_message = {
				"error": True,
				"message": "email已被使用"
			}
			return jsonify(error_message), 400
		
		insert_new_account = (
			"INSERT INTO user (name, email, password) "
			"VALUES (%s, %s, %s)"
		)
		my_cursor.execute(insert_new_account, (name, email, pw_hash))
		connection.commit()

		success_message = {
			"ok": True
		}
		return jsonify(success_message), 200


	except:
		error_message = {
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(error_message), 500


	finally:
		if connection.is_connected():
			my_cursor.close()
			connection.close()


@member_app.route("/api/user/auth", methods=['PUT'])
def login():
	email = request.form.get('email')
	password = request.form.get('password')

	# filter data before saving to db
	if not email or not emailModule.isValid(email):
		error_message = {
			"error": True,
			"message": "email格式錯誤，請重新輸入"
		}
		return jsonify(error_message), 400

	if len(password) < 8:
		error_message = {
			"error": True,
			"message": "密碼格式錯誤，請重新輸入"
		}
		return jsonify(error_message), 400


	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		check_account = (
			"SELECT password, id FROM user "
			"WHERE email = %s"
		)
		my_cursor.execute(check_account, (email,))
		datas = my_cursor.fetchone()

		if not datas:
			error_message = {
				"error": True,
				"message": "email錯誤，請重新輸入"
			}
			return jsonify(error_message), 400
			
		pw_hash = datas[0]
		isValid_pw = bcrypt.check_password_hash(pw_hash, password)

		if not isValid_pw:
			error_message = {
				"error": True,
				"message": "密碼錯誤，請重新輸入"
			}
			return jsonify(error_message), 400
		else:
			exp_date = datetime.datetime.utcnow() + datetime.timedelta(days=7)

			token = jwtModule.encoded(datas[1], exp_date)

			success_message = {
				"ok": True
			}

			response = make_response(success_message, 200)
			response.set_cookie(key="token", value=token, expires=exp_date)
			
			return response


	except:
		error_message = {
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(error_message), 500


	finally:
		if connection.is_connected():
			my_cursor.close()
			connection.close()


@member_app.route("/api/user/auth", methods=['DELETE'])
def logout():
	if request.cookies.get('token'):
		success_message = {
			"ok": True
		}

		response = make_response(success_message, 200)
		response.set_cookie(key="token", value='', expires=0)
		
		return response


@member_app.route("/api/user/auth", methods=['GET'])
def userInfo():
	token = request.cookies.get('token')

	null_message= { "data": None }

	# no token : not log in
	if not token:
		return null_message, 200
	else:
		user_info = jwtModule.decoded(token)
		id = user_info['id']

		# wrong token cannot be decoded
		if not id:
			return null_message, 200
		else:
			try:
				connection = cnx_pool.get_connection()
				my_cursor = connection.cursor()

				member_info = (
					"SELECT name, email FROM user "
					"WHERE id = %s"
				)
				my_cursor.execute(member_info, (id,))
				datas = my_cursor.fetchone()

				message = {
					"data" : {
						"id": id,
						"name": datas[0],
						"email": datas[1]
					}
				}
				
				return jsonify(message), 200

			except:
				# connection error
				error_message = {
					"error": True,
					"message": "伺服器內部錯誤"
				}
				return jsonify(error_message), 500

			finally:
				if connection.is_connected():
					my_cursor.close()
					connection.close()