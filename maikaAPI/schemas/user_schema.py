from marshmallow import Schema, fields, validate, ValidationError, post_load
from logger.logger_base import Logger



class UserSchema:
    def validate_username(self, username):
        if not username or not isinstance(username, str):
            raise ValidationError("Username must be a non-empty string")
        if len(username) < 3 or len(username) > 50:
            raise ValidationError("Username must be between 3 and 50 characters")
        if not username.isalnum() and "_" not in username:
            raise ValidationError("Username can only contain letters, numbers, and underscores")

    def validate_password(self, password):
        if not password or not isinstance(password, str):
            raise ValidationError("Password must be a non-empty string")
        if len(password) < 6 or len(password) > 100:
            raise ValidationError("Password must be between 6 and 100 characters")

    def validate_name(self, name):
        if not name or not isinstance(name, str):
            raise ValidationError("Name must be a non-empty string")
        if len(name) < 2 or len(name) > 100:
            raise ValidationError("Name must be between 2 and 100 characters")

    def validate_user_type(self, user_type):
        valid_types = ['admin', 'service', 'kitchen']
        if not user_type or not isinstance(user_type, str):
            raise ValidationError("User type must be a non-empty string")
        if user_type not in valid_types:
            raise ValidationError(f"User type must be one of: {', '.join(valid_types)}")

    def validate_registration_data(self, data):
        """Valida todo el conjunto de datos de registro"""
        self.validate_username(data.get('username'))
        self.validate_password(data.get('password'))
        self.validate_name(data.get('name'))
        self.validate_user_type(data.get('userType'))
        return data
