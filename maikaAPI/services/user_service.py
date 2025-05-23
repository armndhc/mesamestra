from flask import jsonify
from logger.logger_base import Logger

class UserService:
    def __init__(self, db_conn):
        self.logger = Logger()
        self.db_conn = db_conn

    def get_all_users(self):
        try:
            users = list(self.db_conn.db.users.find({}, {'_id': 0}))
            self.logger.info('Successfully fetched all users from the database.')
            return users
        except Exception as e:
            self.logger.error(f'Error fetching all users from the database: {e}')
            return jsonify({'error': str(e)}), 500

    def create_user(self, new_user):
        try:
            last_user = self.db_conn.db.users.find_one(sort=[('_id', -1)])
            next_id = (last_user['_id'] + 1 if last_user else 1)
            new_user['_id'] = next_id
            self.db_conn.db.users.insert_one(new_user)
            self.logger.info(f'New user created with ID: {next_id}')
            return new_user
        except Exception as e:
            self.logger.error(f'Error creating the user: {e}')
            return jsonify({'error': str(e)}), 500

    def get_user_by_username(self, username):
        try:
            user = self.db_conn.db.users.find_one({'username': username})
            return user
        except Exception as e:
            self.logger.error(f'Error fetching user {username}: {e}')
            return None

    def update_user(self, username, updates):
        try:
            existing_user = self.get_user_by_username(username)
            if existing_user:
                result = self.db_conn.db.users.update_one({'username': username}, {'$set': updates})
                if result.modified_count > 0:
                    self.logger.info(f'User {username} updated successfully.')
                return self.get_user_by_username(username)
            else:
                self.logger.warning(f'User {username} not found for update.')
                return None
        except Exception as e:
            self.logger.error(f'Error updating user {username}: {e}')
            return jsonify({'error': str(e)}), 500

    def delete_user(self, username):
        try:
            user = self.get_user_by_username(username)
            if user:
                self.db_conn.db.users.delete_one({'username': username})
                self.logger.info(f'User {username} deleted successfully.')
                return user
            else:
                self.logger.warning(f'User {username} not found for deletion.')
                return None
        except Exception as e:
            self.logger.error(f'Error deleting user {username}: {e}')
            return jsonify({'error': str(e)}), 500

    def authenticate_user(self, username, password):
        try:
            user = self.db_conn.db.users.find_one({"username": username})
            if user and user["password"] == password:  # ⚠️ Usa bcrypt en producción
                self.logger.info(f"User {username} authenticated successfully.")
                return {
                    "username": user["username"],
                    "name": user["name"],
                    "userType": user["userType"]
                }
            else:
                self.logger.warning(f"Authentication failed for user {username}")
                return None
        except Exception as e:
            self.logger.error(f"Error authenticating user {username}: {e}")
            return None
