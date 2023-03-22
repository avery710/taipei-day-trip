from flask import *


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True


# blueprints
from api.attraction import attraction_app
from api.member import member_app
from api.booking import booking_app
from api.order import order_app


app.register_blueprint(attraction_app)
app.register_blueprint(member_app)
app.register_blueprint(booking_app)
app.register_blueprint(order_app)



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

@app.route("/history")
def history():
	return render_template("history.html")



if __name__ == '__main__':
    app.run(port=3000, host="0.0.0.0")