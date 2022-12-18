from flask import *
import mysql.connector
import mysql.connector.pooling
import datetime
import modules.jwt as jwtModule
import modules.mysql_cnx as mysqlModule
import modules.email_check as emailModule
from flask_bcrypt import Bcrypt


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
bcrypt = Bcrypt(app)


cnx_pool = mysqlModule.open_cnx_pool()


# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html", id=id)

@app.route("/booking")
def booking():
	return render_template("booking.html")
	
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


################################ attraction api ################################


@app.route("/api/attractions")
def search_attractions():
	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor(dictionary=True)

		keyword = request.args.get('keyword')
		cur_page = int(request.args.get('page'))

		if not keyword:
			select_data = (
				"SELECT attractions.*, GROUP_CONCAT(images.img_url) AS images FROM attractions "
				"INNER JOIN images ON attractions.id = images.attraction_id "
				"GROUP BY attractions.id "
				"LIMIT 13 OFFSET %s"
			)
			my_cursor.execute(select_data, (cur_page * 12,))
			datas = my_cursor.fetchall()
		else:
			query_keyword = (
				"SELECT attractions.*, GROUP_CONCAT(images.img_url) AS images FROM attractions "
				"INNER JOIN images ON attractions.id = images.attraction_id "
				"WHERE category = %s OR name LIKE CONCAT('%', %s, '%') "
				"GROUP BY attractions.id "
				"LIMIT 13 OFFSET %s"
			)
			my_cursor.execute(query_keyword, (keyword, keyword, cur_page * 12))
			datas = my_cursor.fetchall()

		# if no according keyword, return the empty json file
		if not datas:
			result_dict = {
				"nextPage": None,
				"data": []
			}
			return jsonify(result_dict), 200	

		for data in datas:
			data['images'] = data['images'].split(',')

		result_dict = {}
		if len(datas) == 13:
			result_dict['nextPage'] = cur_page + 1
			datas.pop()
		elif len(datas) < 13:
			result_dict['nextPage'] = None


		result_dict['data'] = datas

		return jsonify(result_dict), 200


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


@app.route("/api/attraction/<id>")
def attraction_detail(id):
	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor(dictionary=True)

		# select from "attractions" table
		select_data = (
			"SELECT attractions.*, GROUP_CONCAT(images.img_url) AS images FROM attractions "
			"INNER JOIN images ON attractions.id = images.attraction_id "
			"WHERE attractions.id = %s "
		)
		my_cursor.execute(select_data, (id,))
		data = my_cursor.fetchone()
		
		if data['id'] == None:
			error_message = {
				"error": True,
				"message": "景點編號不正確"
			}
			return jsonify(error_message), 400

		data['images'] = data['images'].split(',')

		result_dict = {}
		result_dict['data'] = data
		
		return jsonify(result_dict), 200


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


@app.route("/api/categories")
def attraction_categories():
	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		cat_query = (
			"SELECT category FROM attractions"
		)
		my_cursor.execute(cat_query)
		tmp_list = list(set(my_cursor.fetchall()))
		
		result_list = []
		# convert tuple into pure string
		for item in tmp_list:
			result_list.append(item[0])

		result_dict = {}
		result_dict['data'] = result_list

		return jsonify(result_dict), 200


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



################################ member sys api ################################


# sign up a new user account
@app.route("/api/user", methods=['POST'])
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


@app.route("/api/user/auth", methods=['PUT'])
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


@app.route("/api/user/auth", methods=['DELETE'])
def logout():
	if request.cookies.get('token'):
		success_message = {
			"ok": True
		}

		response = make_response(success_message, 200)
		response.set_cookie(key="token", value='', expires=0)
		
		return response


@app.route("/api/user/auth", methods=['GET'])
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


################################ booking api ################################


@app.route("/api/booking", methods=['GET'])
def bookingInfo():
	token = request.cookies.get('token')
	if not token:
		error_message = {
			"error": True,
			"message": "未登入系統，拒絕存取"
		}
		return jsonify(error_message), 403
	
	user = jwtModule.decoded(token)
	if not user:
		error_message = {
			"error": True,
			"message": "token invalid"
		}
		return error_message, 400

	user_id = user['id']

	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor(dictionary=True)

		#check whether the user has already booked
		get_booking = (
			"SELECT booking.attraction_id, booking.date, booking.time, booking.price, attractions.name, attractions.address, images.img_url "
			"FROM attractions "
			"INNER JOIN booking ON attractions.id = booking.attraction_id "
			"INNER JOIN images ON attractions.id = images.attraction_id "
			"WHERE booking.user_id = %s "
			"LIMIT 1"
		)

		my_cursor.execute(get_booking, (user_id,))
		booking = my_cursor.fetchone()

		if not booking:
			my_dict = {
				"data" : None
			}
			return jsonify(my_dict), 200	

		data = {
			"date": booking['date'],
    		"time": booking['time'],
    		"price": booking['price']
		}

		attraction = {
			"id": booking['attraction_id'],
      		"name": booking['name'],
      		"address": booking['address'],
      		"image": booking['img_url']
		}

		data['attraction'] = attraction

		my_dict = {}
		my_dict['data'] = data

		return jsonify(my_dict), 200

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


@app.route("/api/booking", methods=['POST'])
def newBooking():
	attraction = request.json
	if not attraction:
		error_message = {
			"error": True,
			"message": "景點資料錯誤"
		}
		return jsonify(error_message), 400

	token = request.cookies.get('token')
	if not token:
		error_message = {
			"error": True,
			"message": "未登入系統，拒絕存取"
		}
		return jsonify(error_message), 403

	user = jwtModule.decoded(token)
	if not user:
		error_message = {
			"error": True,
			"message": "token invalid"
		}
		return error_message, 400

	user_id = user['id']

	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		#check whether the user has already booked
		check_booking = (
			"SELECT id FROM booking "
			"WHERE user_id = %s"
		)
		my_cursor.execute(check_booking, (user_id,))
		is_booked = my_cursor.fetchone()

		if is_booked:
			update_booking = (
				"UPDATE booking "
				"SET attraction_id = %s, date = %s, time = %s, price = %s "
				"WHERE user_id = %s"
			)
			my_cursor.execute(update_booking, (attraction['attractionId'], attraction['date'], attraction['time'], attraction['price'], user_id))
			connection.commit()
		else:
			insert_booking = (
				"INSERT INTO booking (user_id, attraction_id, date, time, price) "
				"VALUES (%s, %s, %s, %s, %s)"
			)
			my_cursor.execute(insert_booking, (user_id, attraction['attractionId'], attraction['date'], attraction['time'], attraction['price']))
			connection.commit()

		success_message = {
			"ok": True
		}

		return jsonify(success_message), 200


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


@app.route("/api/booking", methods=['DELETE'])
def deleteBooking():
	token = request.cookies.get('token')
	if not token:
		error_message = {
			"error": True,
			"message": "未登入系統，拒絕存取"
		}
		return jsonify(error_message), 403
	
	user = jwtModule.decoded(token)
	if not user:
		error_message = {
			"error": True,
			"message": "token invalid"
		}
		return error_message, 400

	user_id = user['id']

	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		#check whether the user has already booked
		delete_booking = (
			"DELETE FROM booking "
			"WHERE user_id = %s"
		)
		my_cursor.execute(delete_booking, (user_id,))

		success_message = {
			"ok": True
		}
		return jsonify(success_message), 200
		

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
	


if __name__ == '__main__':
    app.run(port=3000, host="0.0.0.0")