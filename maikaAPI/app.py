from flask import Flask
from flask_cors import CORS
from models.menu_model import MenuModel
from services.menu_services import MenuService
from schemas.menu_schemas import MenuSchema
from routes.menu_routes import MenuRoutes
from models.reservation_model import ReservationModel
from services.reservation_service import ReservationService
from schemas.reservation_schemas import ReservationSchema
from routes.reservation_routes import ReservationRoute
from models.staff_model import StaffModel
from services.staff_service import StaffService
from schemas.staff_schema import StaffSchema
from routes.staff_routes import StaffRoutes
from models.inventory_model import InventoryModel
from services.inventory_service import InventoryService
from schemas.inventory_schema import InventorySchema
from routes.inventory_routes import InventoryRoutes
from models.payment_model import PaymentModel
from services.payment_services import PaymentService
from schemas.payment_schemas import PaymentSchema
from routes.payment_route import PaymentRoutes
from models.order_model import OrderModel
from services.order_service import OrderService
from schemas.order_schemas import OrderSchema
from routes.order_route import OrderRoutes
from routes.healthcheck_routes import HealthcheckRoutes
from flasgger import Swagger

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
swagger = Swagger(app)

# Menu
db_conn_menu = MenuModel()
db_conn_menu.connect_to_database()
menu_service = MenuService(db_conn_menu)
menu_schema = MenuSchema()
menu_routes = MenuRoutes(menu_service, menu_schema)
app.register_blueprint(menu_routes)

# Reservations
db_conn_reservation = ReservationModel()
db_conn_reservation.connect_to_database()
reservation_service = ReservationService(db_conn_reservation)
reservation_schema = ReservationSchema()
reservation_routes = ReservationRoute(reservation_service, reservation_schema)
app.register_blueprint(reservation_routes)

# Staff
db_conn_staff = StaffModel()
db_conn_staff.connect_to_database()
staff_service = StaffService(db_conn_staff)
staff_schema = StaffSchema()
staff_routes = StaffRoutes(staff_service,staff_schema)
app.register_blueprint(staff_routes)

# Inventory
db_conn_inventory = InventoryModel()
db_conn_inventory.connect_to_database()
inventory_service = InventoryService(db_conn_inventory)
inventory_schema = InventorySchema()
inventory_routes = InventoryRoutes(inventory_service, inventory_schema)
app.register_blueprint(inventory_routes)


# Payment
db_conn_payment = PaymentModel()
db_conn_payment.connect_to_database()
payment_service = PaymentService(db_conn_payment)
payment_schema = PaymentSchema()
payment_routes = PaymentRoutes(payment_service, payment_schema)
app.register_blueprint(payment_routes)

# Order
db_conn_order = OrderModel()
db_conn_order.connect_to_database()
order_service = OrderService(db_conn_order)
order_schema = OrderSchema()
order_routes = OrderRoutes(order_service, order_schema)
app.register_blueprint(order_routes)

#Healthcheck
healthcheck_routes = HealthcheckRoutes()
app.register_blueprint(healthcheck_routes)

if __name__ == '__main__':
    try:
        app.run(debug=True)
    finally:
        db_conn_inventory.close_connection()
        db_conn_menu.close_connection()
        db_conn_order.close_connection()
        db_conn_payment.close_connection()
        db_conn_reservation.close_connection()
        db_conn_staff.close_connection()
        