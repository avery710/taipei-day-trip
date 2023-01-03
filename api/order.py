from flask import *
from modules.mysql_cnx import cnx_pool
import modules.jwt as jwtModule
import requests
import uuid
import os
from dotenv import load_dotenv
load_dotenv()


order_app = Blueprint("order_app", __name__)


@order_app.route("/api/orders", methods=['POST'])
def makeOrders():
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

	payment = request.json

	# save the payment in database
	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor()

		order_number = str(uuid.uuid4())
		prime = payment['prime']
		price = payment['order']['price']
		attraction_id = payment['order']['attractionID']
		date = payment['order']['date']
		time = payment['order']['time']
		contact_name = payment['contact']['name']
		contact_email = payment['contact']['email']
		contact_phone = payment['contact']['phone']

		create_payment = (
			"INSERT INTO payment (order_number, payment_status, price, date, time, contact_name, contact_email, contact_phone, user_id, attraction_id) "
			"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
		)
		my_cursor.execute(create_payment, (order_number, 0, price, date, time, contact_name, contact_email, contact_phone, user_id, attraction_id))
		connection.commit()

		# send prime to Tappay api
		data = {
			"prime": prime,
			"partner_key": 'partner_NI40UFPOXaQYcb62zgRYncUxkNQSiZEBeyA2q2PqUWPWVXzGE1ruRy8s',
			"merchant_id": "averylin_CTBC",
			"details": "TapPay Test",
			"amount": price,
			"cardholder": {
				"phone_number": "+886" + contact_phone[1:],
				"name": contact_name,
				"email": contact_email
			},
			"order_number": order_number
		}

		headers = {
			'Content-Type': 'application/json', 
			'x-api-key': os.getenv('partner_key')
		}

		res = requests.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', data=json.dumps(data), headers=headers)
		jsonRes = res.json()

		# return message
		if jsonRes['status'] == 0:
			# change the status of payment in database
			update_payment = (
				"UPDATE payment "
				"SET payment_status = 1 "
				"WHERE order_number = %s"
			)
			my_cursor.execute(update_payment, (order_number,))
			connection.commit()

			# delete booking data
			delete_booking = (
				"DELETE FROM booking "
				"WHERE user_id = %s"
			)
			my_cursor.execute(delete_booking, (user_id,))

			response = {
				"data": {
					"number": order_number,
					"payment": {
						"status": 0,
						"message": "付款成功"
					}
				}
			}
			return response, 200

		elif jsonRes['status']:
			response = {
				"data": {
					"number": order_number,
					"payment": {
						"status": jsonRes['status'],
						"message": "付款失敗"
					}
				}
			}
			return response, 200


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



@order_app.route("/api/orders/history", methods=['GET'])
def orderHistory():
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

		get_orders = (
			"SELECT payment.price, payment.date, payment.time, payment.order_number, payment.attraction_id, "
			"attractions.name, attractions.address, GROUP_CONCAT(images.img_url) AS images "
			"FROM payment "
			"INNER JOIN attractions ON attractions.id = payment.attraction_id "
			"INNER JOIN user ON user.id = payment.user_id "
			"INNER JOIN images ON images.attraction_id = payment.attraction_id "
			"WHERE payment.user_id = %s AND payment.payment_status = 1 "
			"GROUP BY payment.id "
			"ORDER BY payment.id DESC"
		)
		my_cursor.execute(get_orders, (user_id,))
		orders = my_cursor.fetchall()

		if not orders:
			response = {
				"noData": True
			}
			return response, 200
		else:
			for order in orders:
				order['images'] = order['images'].split(',')

			return orders, 200

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