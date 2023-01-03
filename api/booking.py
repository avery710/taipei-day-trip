from flask import *
from modules.mysql_cnx import cnx_pool
import modules.jwt as jwtModule


booking_app = Blueprint("booking_app", __name__)


@booking_app.route("/api/booking", methods=['GET'])
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


@booking_app.route("/api/booking", methods=['POST'])
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


@booking_app.route("/api/booking", methods=['DELETE'])
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