from flask import Blueprint, jsonify, request, make_response
from marshmallow import ValidationError
from logger.logger_base import Logger
from flasgger import swag_from
import os

class UserRoutes(Blueprint):
    def __init__(self, user_service, user_schema):
        super().__init__('auth', __name__)
        self.user_service = user_service
        self.user_schema = user_schema
        self.logger = Logger()
        self.secret_key = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')
        self.register_routes()

    def register_routes(self):
        self.route('/api/v1/auth/register', methods=['POST'])(self.register)
        self.route('/api/v1/auth/login', methods=['POST'])(self.login)
        self.route('/api/v1/auth/logout', methods=['POST'])(self.logout)
        self.route('/api/v1/auth/profile', methods=['GET'])(self.get_profile)
        self.route('/api/v1/auth/profile', methods=['PUT'])(self.update_profile)
        self.route('/api/v1/auth/verify', methods=['GET'])(self.verify_token)

    @swag_from({
        'tags': ['Authentication'],
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'required': ['username', 'password', 'name', 'userType'],
                    'properties': {
                        'username': {'type': 'string', 'example': 'johndoe'},
                        'password': {'type': 'string', 'example': 'password123'},
                        'name': {'type': 'string', 'example': 'John Doe'},
                        'userType': {
                            'type': 'string', 
                            'enum': ['admin', 'service', 'kitchen'], 
                            'example': 'service'
                        }
                    }
                }
            }
        ],
        'responses': {
            201: {'description': 'User registered successfully'},
            400: {'description': 'Bad request - validation errors'},
            409: {'description': 'Username already exists'},
            500: {'description': 'Internal server error'}
        }
    })
    def register(self):
        try:
            self.logger.info('Registration request received')
            data = request.get_json()
            
            if not data:
                self.logger.warning('Registration request with no data')
                return jsonify({'error': 'No data provided'}), 400

            # Validate input data
            validated_data = self.user_schema.validate_registration_data(data)
            if 'errors' in validated_data:
                self.logger.warning(f'Registration validation failed: {validated_data["errors"]}')
                return jsonify({'error': 'Validation failed', 'details': validated_data['errors']}), 400

            # Register user
            result = self.user_service.register_user(validated_data)
            
            if result['success']:
                self.logger.info(f'User registered successfully: {validated_data["username"]}')
                response_data = {
                    'success': True,
                    'message': result['message'],
                    'user': result['user']
                }
                return jsonify(response_data), 201
            else:
                self.logger.warning(f'Registration failed: {result["error"]}')
                return jsonify({'error': result['error']}), 400

        except Exception as e:
            self.logger.error(f'Registration endpoint error: {str(e)}')
            return jsonify({'error': f'Registration failed: {str(e)}'}), 500

    @swag_from({
        'tags': ['Authentication'],
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'required': ['username', 'password'],
                    'properties': {
                        'username': {'type': 'string', 'example': 'johndoe'},
                        'password': {'type': 'string', 'example': 'password123'}
                    }
                }
            }
        ],
        'responses': {
            200: {'description': 'Login successful'},
            400: {'description': 'Bad request'},
            401: {'description': 'Invalid credentials'},
            500: {'description': 'Internal server error'}
        }
    })
    def login(self):
        try:
            self.logger.info('Login request received')
            data = request.get_json()
            
            if not data:
                self.logger.warning('Login request with no data')
                return jsonify({'error': 'No data provided'}), 400

            # Validate input data
            validated_data = self.user_schema.validate_login_data(data)
            if 'errors' in validated_data:
                self.logger.warning(f'Login validation failed: {validated_data["errors"]}')
                return jsonify({'error': 'Validation failed', 'details': validated_data['errors']}), 400

            # Authenticate user
            result = self.user_service.login_user(
                validated_data['username'], 
                validated_data['password']
            )
            
            if result['success']:
                self.logger.info(f'User logged in successfully: {validated_data["username"]}')
                # Create response with token in cookie
                response_data = {
                    'success': True,
                    'message': result['message'],
                    'user': result['user'],
                    'userType': result['user']['userType']
                }
                
                response = make_response(jsonify(response_data), 200)
                
                # Set JWT token as httpOnly cookie
                response.set_cookie(
                    'auth_token',
                    result['token'],
                    httponly=True,
                    secure=False,  # Set to True in production with HTTPS
                    samesite='Lax',
                    max_age=24*60*60  # 24 hours
                )
                
                return response
            else:
                self.logger.warning(f'Login failed: {result["error"]}')
                return jsonify({'error': result['error']}), 401

        except Exception as e:
            self.logger.error(f'Login endpoint error: {str(e)}')
            return jsonify({'error': f'Login failed: {str(e)}'}), 500

    @swag_from({
        'tags': ['Authentication'],
        'responses': {
            200: {'description': 'Logout successful'}
        }
    })
    def logout(self):
        try:
            self.logger.info('Logout request received')
            response = make_response(jsonify({
                'success': True,
                'message': 'Logged out successfully'
            }), 200)
            
            # Clear the auth token cookie
            response.set_cookie(
                'auth_token',
                '',
                expires=0,
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            
            self.logger.info('User logged out successfully')
            return response

        except Exception as e:
            self.logger.error(f'Logout endpoint error: {str(e)}')
            return jsonify({'error': f'Logout failed: {str(e)}'}), 500

    @swag_from({
        'tags': ['Authentication'],
        'responses': {
            200: {'description': 'Profile retrieved successfully'},
            401: {'description': 'Unauthorized'},
            500: {'description': 'Internal server error'}
        }
    })
    def get_profile(self):
        try:
            self.logger.info('Get profile request received')
            # Get token from cookie
            token = request.cookies.get('auth_token')
            
            if not token:
                self.logger.warning('Profile request without token')
                return jsonify({'error': 'No authentication token provided'}), 401

            # Verify token
            token_result = self.user_service.verify_token(token)
            
            if not token_result['success']:
                self.logger.warning(f'Invalid token for profile request: {token_result["error"]}')
                return jsonify({'error': token_result['error']}), 401

            self.logger.info(f'Profile retrieved for user: {token_result["user"]["username"]}')
            return jsonify({
                'success': True,
                'user': token_result['user']
            }), 200

        except Exception as e:
            self.logger.error(f'Get profile endpoint error: {str(e)}')
            return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

    @swag_from({
        'tags': ['Authentication'],
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string', 'example': 'John Smith'},
                        'userType': {
                            'type': 'string',
                            'enum': ['admin', 'service', 'kitchen']
                        }
                    }
                }
            }
        ],
        'responses': {
            200: {'description': 'Profile updated successfully'},
            400: {'description': 'Bad request'},
            401: {'description': 'Unauthorized'},
            500: {'description': 'Internal server error'}
        }
    })
    def update_profile(self):
        try:
            self.logger.info('Update profile request received')
            # Get token from cookie
            token = request.cookies.get('auth_token')
            
            if not token:
                self.logger.warning('Update profile request without token')
                return jsonify({'error': 'No authentication token provided'}), 401

            # Verify token
            token_result = self.user_service.verify_token(token)
            
            if not token_result['success']:
                self.logger.warning(f'Invalid token for update profile: {token_result["error"]}')
                return jsonify({'error': token_result['error']}), 401

            # Get update data
            data = request.get_json()
            if not data:
                self.logger.warning('Update profile request with no data')
                return jsonify({'error': 'No data provided'}), 400

            # Validate update data
            validated_data = self.user_schema.validate_update_data(data)
            if 'errors' in validated_data:
                self.logger.warning(f'Update profile validation failed: {validated_data["errors"]}')
                return jsonify({'error': 'Validation failed', 'details': validated_data['errors']}), 400

            # Update profile
            user_id = token_result['user']['id']
            result = self.user_service.update_user_profile(user_id, validated_data)
            
            if result['success']:
                self.logger.info(f'Profile updated for user: {token_result["user"]["username"]}')
                return jsonify({
                    'success': True,
                    'message': result['message'],
                    'user': result['user']
                }), 200
            else:
                self.logger.warning(f'Failed to update profile: {result["error"]}')
                return jsonify({'error': result['error']}), 400

        except Exception as e:
            self.logger.error(f'Update profile endpoint error: {str(e)}')
            return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

    @swag_from({
        'tags': ['Authentication'],
        'responses': {
            200: {'description': 'Token is valid'},
            401: {'description': 'Invalid or expired token'}
        }
    })
    def verify_token(self):
        try:
            self.logger.info('Verify token request received')
            # Get token from cookie
            token = request.cookies.get('auth_token')
            
            if not token:
                self.logger.warning('Verify token request without token')
                return jsonify({'error': 'No authentication token provided'}), 401

            # Verify token
            result = self.user_service.verify_token(token)
            
            if result['success']:
                self.logger.info(f'Token verified for user: {result["user"]["username"]}')
                return jsonify({
                    'success': True,
                    'user': result['user']
                }), 200
            else:
                self.logger.warning(f'Token verification failed: {result["error"]}')
                return jsonify({'error': result['error']}), 401

        except Exception as e:
            self.logger.error(f'Verify token endpoint error: {str(e)}')
            return jsonify({'error': f'Token verification failed: {str(e)}'}), 500