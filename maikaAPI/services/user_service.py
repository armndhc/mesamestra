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

    def get_user_by_id(self, user_id):
        try:
            return self.db_conn.db.users.find_one({'_id': int(user_id)})
        except Exception as e:
            self.logger.error(f'Error fetching user by ID {user_id}: {e}')
            return None

    def update_user(self, user_id, updates):
        try:
            user = self.get_user_by_id(user_id)
            if user:
                self.db_conn.db.users.update_one({'_id': int(user_id)}, {'$set': updates})
                self.logger.info(f'User with ID {user_id} updated successfully.')
                return self.get_user_by_id(user_id)
            else:
                self.logger.warning(f'User ID {user_id} not found for update.')
                return None
        except Exception as e:
            self.logger.error(f'Error updating user ID {user_id}: {e}')
            return jsonify({'error': str(e)}), 500

    def delete_user(self, user_id):
        try:
            result = self.db_conn.db.users.delete_one({'_id': int(user_id)})
            if result.deleted_count > 0:
                self.logger.info(f'User ID {user_id} deleted successfully.')
                return True
            else:
                self.logger.warning(f'User ID {user_id} not found for deletion.')
                return False
        except Exception as e:
            self.logger.error(f'Error deleting user ID {user_id}: {e}')
            return False

    def authenticate_user(self, username, password):
        try:
            user = self.db_conn.db.users.find_one({"username": username})
            if user and user["password"] == password:
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
