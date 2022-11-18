from flask import *
import mysql.connector
import mysql.connector.pooling
import math


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True


# mysql connection pool configure
dbconfig = {
    "host" : "localhost",
    "user" : "root",
    "password" : "angeldemima0710",
    "database" : "taipei_trip"
}

cnx_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name = "mysql_pool",
    pool_size = 5,
    autocommit = True,
    **dbconfig
)


# Pages
@app.route("/")
def index():
	return render_template("index.html")


@app.route("/api/attractions")
def search_attractions():
	try:
		connection = cnx_pool.get_connection()
		my_cursor = connection.cursor(dictionary=True)

		keyword = request.args.get('keyword')
		cur_page = int(request.args.get('page'))

		result_dict = {}

		if not keyword:
			select_data = (
				"SELECT * FROM attractions"
			)
			my_cursor.execute(select_data)
			datas = my_cursor.fetchall()

		else:
			query_keyword = (
				"SELECT * FROM attractions "
				"WHERE category = %s OR name LIKE CONCAT('%', %s, '%')"
			)
			my_cursor.execute(query_keyword, (keyword, keyword))
			datas = my_cursor.fetchall()

		# if no according keyword, return the empty json file
		if not datas:
			result_dict = {
				"nextPage": None,
				"data": []
			}
			return jsonify(result_dict), 200	

		# select image query
		select_images = (
			"SELECT img_url FROM images "
			"WHERE attraction_id = %s"
		)

		# add images to datas
		for data in datas:
			my_cursor.execute(select_images, (data['id'],))
			images = my_cursor.fetchall()

			img_list = []
			for image in images:
				for val in image.values():
					img_list.append(val)

			data['images'] = img_list
		
		pages = float(len(datas)) / float(12)
		total_page = math.ceil(pages)

		# current page is not the last
		if cur_page < total_page - 1:
			result_dict['nextPage'] = cur_page + 1

			tmp = []
			for data in datas[cur_page * 12 : (cur_page + 1) * 12]:
				tmp.append(data)
		# current page is the last
		elif cur_page == total_page - 1:
			result_dict['nextPage'] = None

			tmp = []
			for data in datas[cur_page * 12 : len(datas)]:
				tmp.append(data)

		result_dict['data'] = tmp

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
			"SELECT id, name, category, description, address, transport, mrt, lat, lng "
			"FROM attractions "
			"WHERE id = %s"
		)
		my_cursor.execute(select_data, (id,))
		tmp_dict = my_cursor.fetchone() # store as dict

		if not tmp_dict:
			error_message = {
				"error": True,
				"message": "景點編號不正確"
			}
			return jsonify(error_message), 400
		else:
			# select from "images" table and append in "datas" dict
			select_images = (
				"SELECT img_url "
				"FROM images "
				"WHERE attraction_id = %s"
			)
			my_cursor.execute(select_images, (id,))
			images = my_cursor.fetchall()

			result = []
			for image in images:
				for val in image.values():
					result.append(val)
			
			tmp_dict['images'] = result

			result_dict = {}
			result_dict['data'] = tmp_dict
			
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


@app.route("/booking")
def booking():
	return render_template("booking.html")
	
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(port=3000, host="0.0.0.0")