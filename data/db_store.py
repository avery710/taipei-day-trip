import json
import mysql.connector
import re


with open('taipei-attractions.json') as json_file:
    data = json.load(json_file)
    attractions = data['result']['results']

    try:
        cnx = mysql.connector.connect(
            host = "localhost",
            user = "root",
            password = "angeldemima0710",
            database = "taipei_trip"
        )
        my_cursor = cnx.cursor()
        # print("connection success")

        insert_attraction = (
            "INSERT INTO attractions "
            "(id, name, category, description, address, transport, mrt, lat, lng) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )

        insert_img = (
            "INSERT INTO images "
            "(attraction_id, img_url) "
            "VALUES (%s, %s)"
        )

        # store in mysql database using loop
        for attraction in attractions:
            # insert into attractions table
            attraction_data = (attraction['_id'], attraction['name'], attraction['CAT'], 
            attraction['description'], attraction['address'], 
            attraction['direction'], attraction['MRT'], 
            attraction['latitude'], attraction['longitude'])

            my_cursor.execute(insert_attraction, attraction_data)
            cnx.commit()

            # insert into images table
            # extract jpg/png
            pattern = 'https?://[\w/.-]+\.(?:jpe?g|png)'
            pics = re.findall(pattern, attraction['file'], re.IGNORECASE)

            for pic in pics:
                my_cursor.execute(insert_img, (attraction['_id'], pic))
                cnx.commit()
        
        

    finally:
        my_cursor.close()
        cnx.close()
