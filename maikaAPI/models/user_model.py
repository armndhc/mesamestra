import os
from logger.logger_base import Logger
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime

class UserModel:
    def __init__(self):
        self.client = None
        self.db = None
        self.logger = Logger()

    def connect_to_database(self):
        mongodb_user = os.environ.get('MONGODB_USER')
        mongodb_pass = os.environ.get('MONGODB_PASS')
        mongodb_host = os.environ.get('MONGODB_HOST')
        
        if not mongodb_user or not mongodb_pass or not mongodb_host:
            self.logger.critical('MongoDB environment variables are required but missing')
            raise ValueError('Set environment variables: MONGODB_USER, MONGODB_PASS, MONGODB_HOST')
        
        try:
            self.client = MongoClient(
                host=mongodb_host,
                port=27017,
                username=mongodb_user,
                password=mongodb_pass,
                authSource='admin',
                authMechanism='SCRAM-SHA-256',
                serverSelectionTimeoutMS=5000
            )
            self.db = self.client['microservices']
            self.collection = self.db['users']
            
            if self.db.list_collection_names():
                self.logger.info('Connected to MongoDB database successfully - Users collection')
        except Exception as e:
            self.logger.critical(f'Failed to connect to database: {e}')
            raise

    def close_connection(self):
        if self.client:
            self.client.close()
            self.logger.info('MongoDB connection closed - Users')

    def create_user(self, user_data):
        try:
            # Hash the password before storing
            if 'password' in user_data:
                hashed_password = bcrypt.hashpw(
                    user_data['password'].encode('utf-8'), 
                    bcrypt.gensalt()
                )
                user_data['password'] = hashed_password
            
            # Add creation timestamp
            user_data['created_at'] = datetime.utcnow()
            user_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.insert_one(user_data)
            
            if result.inserted_id:
                # Return the created user without password
                created_user = self.collection.find_one(
                    {"_id": result.inserted_id},
                    {"password": 0}  # Exclude password from result
                )
                self.logger.info(f'User created successfully: {user_data["username"]}')
                return created_user
            return None
        except Exception as e:
            self.logger.error(f'Error creating user: {e}')
            return None

    def find_user_by_username(self, username):
        try:
            user = self.collection.find_one({"username": username})
            if user:
                self.logger.info(f'User found: {username}')
            return user
        except Exception as e:
            self.logger.error(f'Error finding user: {e}')
            return None

    def find_user_by_id(self, user_id):
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            user = self.collection.find_one(
                {"_id": user_id},
                {"password": 0}  # Exclude password
            )
            if user:
                self.logger.info(f'User found by ID: {user_id}')
            return user
        except Exception as e:
            self.logger.error(f'Error finding user by ID: {e}')
            return None

    def verify_password(self, username, password):
        try:
            user = self.collection.find_one({"username": username})
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
                # Return user without password
                user_without_password = self.collection.find_one(
                    {"username": username},
                    {"password": 0}
                )
                self.logger.info(f'Password verified for user: {username}')
                return user_without_password
            else:
                self.logger.warning(f'Invalid password attempt for user: {username}')
            return None
        except Exception as e:
            self.logger.error(f'Error verifying password: {e}')
            return None

    def update_user(self, user_id, update_data):
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            # If password is being updated, hash it
            if 'password' in update_data:
                hashed_password = bcrypt.hashpw(
                    update_data['password'].encode('utf-8'),
                    bcrypt.gensalt()
                )
                update_data['password'] = hashed_password
            
            result = self.collection.update_one(
                {"_id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                self.logger.info(f'User updated successfully: {user_id}')
                return self.find_user_by_id(user_id)
            return None
        except Exception as e:
            self.logger.error(f'Error updating user: {e}')
            return None

    def delete_user(self, user_id):
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = self.collection.delete_one({"_id": user_id})
            if result.deleted_count > 0:
                self.logger.info(f'User deleted successfully: {user_id}')
            return result.deleted_count > 0
        except Exception as e:
            self.logger.error(f'Error deleting user: {e}')
            return False

    def get_all_users(self):
        try:
            users = list(self.collection.find({}, {"password": 0}))
            self.logger.info(f'Retrieved {len(users)} users')
            return users
        except Exception as e:
            self.logger.error(f'Error getting all users: {e}')
            return []