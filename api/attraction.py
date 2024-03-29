from flask import *
from modules.mysql_cnx import cnx_pool


attraction_app = Blueprint("attraction_app", __name__)


@attraction_app.route("/api/attractions")
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


@attraction_app.route("/api/attraction/<id>")
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


@attraction_app.route("/api/categories")
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