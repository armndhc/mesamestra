from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from logger.logger_base import Logger

class UserRoutes(Blueprint):
    def __init__(self, user_service, user_schema):
        super().__init__('users', __name__)
        self.user_service = user_service
        self.user_schema = user_schema
        self.logger = Logger()
        self.register_routes()

    def register_routes(self):
        self.route('/api/v1/users', methods=['GET'])(self.get_all_users)
        self.route('/api/v1/users', methods=['POST'])(self.create_user)
        self.route('/api/v1/users/<string:username>', methods=['PUT'])(self.update_user)
        self.route('/api/v1/users/<string:username>', methods=['DELETE'])(self.delete_user)
        self.route('/api/v1/users/login', methods=['POST'])(self.login_user)
        self.route('/api/v1/users/logout', methods=['POST'])(self.logout_user)

    def get_all_users(self):
        users = self.user_service.get_all_users()
        return jsonify(users), 200

    def create_user(self):
        try:
            data = request.get_json()
            self.user_schema.validate_registration_data(data)
            created_user = self.user_service.create_user(data)
            return jsonify(created_user), 201
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            self.logger.error(f"Error creating user: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def update_user(self, username):
        try:
            data = request.get_json()
            if 'name' in data:
                self.user_schema.validate_name(data['name'])
            if 'userType' in data:
                self.user_schema.validate_user_type(data['userType'])
            updated = self.user_service.update_user(username, data)
            if updated:
                return jsonify(updated), 200
            else:
                return jsonify({'error': 'User not found'}), 404
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            self.logger.error(f"Error updating user: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def delete_user(self, username):
        try:
            deleted = self.user_service.delete_user(username)
            if deleted:
                return jsonify({"message": "User deleted"}), 200
            else:
                return jsonify({"error": "User not found"}), 404
        except Exception as e:
            self.logger.error(f"Error deleting user: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def login_user(self):
        try:
            data = request.get_json()
            username = data.get("username")
            password = data.get("password")
            user = self.user_service.authenticate_user(username, password)
            if user:
                return jsonify(user), 200
            return jsonify({"error": "Invalid username or password"}), 401
        except Exception as e:
            self.logger.error(f"Login error: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def logout_user(self):
        return jsonify({"message": "User logged out"}), 200
