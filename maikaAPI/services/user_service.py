import jwt
import os
from datetime import datetime, timedelta
from flask import current_app
from logger.logger_base import Logger
import re

class UserService:
    def __init__(self, user_model):
        self.user_model = user_model
        self.logger = Logger()
        # Get secret key from environment variable or use default for development
        self.secret_key = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')
        self.token_expiration_hours = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

    def register_user(self, user_data):
        """Register a new user"""
        try:
            self.logger.info(f'Attempting to register user: {user_data.get("username")}')
            
            # Validate required fields
            required_fields = ['username', 'password', 'name', 'userType']
            for field in required_fields:
                if field not in user_data or not user_data[field]:
                    self.logger.warning(f'Missing required field: {field}')
                    return {
                        'success': False,
                        'error': f'Field {field} is required'
                    }

            # Validate username format (no spaces, minimum length)
            if not self._validate_username(user_data['username']):
                self.logger.warning(f'Invalid username format: {user_data["username"]}')
                return {
                    'success': False,
                    'error': 'Username must be at least 3 characters and contain no spaces'
                }

            # Validate password strength
            if not self._validate_password(user_data['password']):
                self.logger.warning('Password does not meet requirements')
                return {
                    'success': False,
                    'error': 'Password must be at least 6 characters long'
                }

            # Validate user type
            valid_user_types = ['admin', 'service', 'kitchen']
            if user_data['userType'] not in valid_user_types:
                self.logger.warning(f'Invalid user type: {user_data["userType"]}')
                return {
                    'success': False,
                    'error': 'Invalid user type'
                }

            # Check if username already exists
            existing_user = self.user_model.find_user_by_username(user_data['username'])
            if existing_user:
                self.logger.warning(f'Username already exists: {user_data["username"]}')
                return {
                    'success': False,
                    'error': 'Username already exists'
                }

            # Create user
            created_user = self.user_model.create_user(user_data)
            if created_user:
                self.logger.info(f'User registered successfully: {user_data["username"]}')
                return {
                    'success': True,
                    'user': self._serialize_user(created_user),
                    'message': 'User registered successfully'
                }
            else:
                self.logger.error('Failed to create user in database')
                return {
                    'success': False,
                    'error': 'Failed to create user'
                }

        except Exception as e:
            self.logger.error(f'Registration error: {str(e)}')
            return {
                'success': False,
                'error': f'Registration error: {str(e)}'
            }

    def login_user(self, username, password):
        """Authenticate user and return JWT token"""
        try:
            self.logger.info(f'Login attempt for user: {username}')
            
            # Verify credentials
            user = self.user_model.verify_password(username, password)
            if not user:
                self.logger.warning(f'Failed login attempt for user: {username}')
                return {
                    'success': False,
                    'error': 'Invalid username or password'
                }

            # Generate JWT token
            token = self._generate_token(user)
            
            self.logger.info(f'User logged in successfully: {username}')
            return {
                'success': True,
                'user': self._serialize_user(user),
                'token': token,
                'message': 'Login successful'
            }

        except Exception as e:
            self.logger.error(f'Login error: {str(e)}')
            return {
                'success': False,
                'error': f'Login error: {str(e)}'
            }

    def verify_token(self, token):
        """Verify JWT token and return user data"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            if not user_id:
                self.logger.warning('Invalid token - no user_id')
                return {
                    'success': False,
                    'error': 'Invalid token'
                }

            user = self.user_model.find_user_by_id(user_id)
            if not user:
                self.logger.warning(f'Token valid but user not found: {user_id}')
                return {
                    'success': False,
                    'error': 'User not found'
                }

            self.logger.info(f'Token verified for user: {user["username"]}')
            return {
                'success': True,
                'user': self._serialize_user(user)
            }

        except jwt.ExpiredSignatureError:
            self.logger.warning('Token has expired')
            return {
                'success': False,
                'error': 'Token has expired'
            }
        except jwt.InvalidTokenError:
            self.logger.warning('Invalid token provided')
            return {
                'success': False,
                'error': 'Invalid token'
            }
        except Exception as e:
            self.logger.error(f'Token verification error: {str(e)}')
            return {
                'success': False,
                'error': f'Token verification error: {str(e)}'
            }

    def get_user_profile(self, user_id):
        """Get user profile by ID"""
        try:
            self.logger.info(f'Getting profile for user: {user_id}')
            user = self.user_model.find_user_by_id(user_id)
            if user:
                return {
                    'success': True,
                    'user': self._serialize_user(user)
                }
            else:
                self.logger.warning(f'User not found: {user_id}')
                return {
                    'success': False,
                    'error': 'User not found'
                }
        except Exception as e:
            self.logger.error(f'Error getting user profile: {str(e)}')
            return {
                'success': False,
                'error': f'Error getting user profile: {str(e)}'
            }

    def update_user_profile(self, user_id, update_data):
        """Update user profile"""
        try:
            self.logger.info(f'Updating profile for user: {user_id}')
            
            # Remove sensitive fields that shouldn't be updated directly
            sensitive_fields = ['password']
            for field in sensitive_fields:
                if field in update_data:
                    del update_data[field]

            updated_user = self.user_model.update_user(user_id, update_data)
            if updated_user:
                self.logger.info(f'Profile updated successfully for user: {user_id}')
                return {
                    'success': True,
                    'user': self._serialize_user(updated_user),
                    'message': 'Profile updated successfully'
                }
            else:
                self.logger.warning(f'Failed to update profile for user: {user_id}')
                return {
                    'success': False,
                    'error': 'Failed to update profile'
                }
        except Exception as e:
            self.logger.error(f'Error updating profile: {str(e)}')
            return {
                'success': False,
                'error': f'Error updating profile: {str(e)}'
            }

    def _generate_token(self, user):
        """Generate JWT token for user"""
        payload = {
            'user_id': str(user['_id']),
            'username': user['username'],
            'userType': user['userType'],
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiration_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')

    def _serialize_user(self, user):
        """Convert user object to serializable format"""
        if user:
            serialized = {
                'id': str(user['_id']),
                'username': user['username'],
                'name': user['name'],
                'userType': user['userType'],
                'created_at': user.get('created_at'),
                'updated_at': user.get('updated_at')
            }
            return serialized
        return None

    def _validate_username(self, username):
        """Validate username format"""
        if len(username) < 3:
            return False
        if ' ' in username:
            return False
        return True

    def _validate_password(self, password):
        """Validate password strength"""
        if len(password) < 6:
            return False
        return True