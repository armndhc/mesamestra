from marshmallow import Schema, fields, validate, ValidationError, post_load
from logger.logger_base import Logger

class UserRegistrationSchema(Schema):
    username = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, max=50),
            validate.Regexp(r'^[a-zA-Z0-9_]+$', error='Username can only contain letters, numbers, and underscores')
        ]
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6, max=100)
    )
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )
    userType = fields.Str(
        required=True,
        validate=validate.OneOf(['admin', 'service', 'kitchen'])
    )

    @post_load
    def clean_data(self, data, **kwargs):
        # Clean and format data
        data['username'] = data['username'].lower().strip()
        data['name'] = data['name'].strip()
        return data

class UserLoginSchema(Schema):
    username = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50)
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100)
    )

    @post_load
    def clean_data(self, data, **kwargs):
        data['username'] = data['username'].lower().strip()
        return data

class UserUpdateSchema(Schema):
    name = fields.Str(
        validate=validate.Length(min=2, max=100),
        missing=None
    )
    userType = fields.Str(
        validate=validate.OneOf(['admin', 'service', 'kitchen']),
        missing=None
    )

    @post_load
    def clean_data(self, data, **kwargs):
        # Remove None values
        cleaned_data = {k: v for k, v in data.items() if v is not None}
        # Clean string values
        if 'name' in cleaned_data:
            cleaned_data['name'] = cleaned_data['name'].strip()
        return cleaned_data

class UserResponseSchema(Schema):
    id = fields.Str()
    username = fields.Str()
    name = fields.Str()
    userType = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

class AuthResponseSchema(Schema):
    success = fields.Bool()
    message = fields.Str()
    user = fields.Nested(UserResponseSchema)
    token = fields.Str()
    error = fields.Str()

class UserSchema:
    def __init__(self):
        self.logger = Logger()
        self.registration_schema = UserRegistrationSchema()
        self.login_schema = UserLoginSchema()
        self.update_schema = UserUpdateSchema()
        self.response_schema = UserResponseSchema()
        self.auth_response_schema = AuthResponseSchema()

    def validate_registration_data(self, data):
        """Validate user registration data"""
        try:
            self.logger.info('Validating user registration data')
            validated_data = self.registration_schema.load(data)
            self.logger.info('User registration data validation successful')
            return validated_data
        except ValidationError as e:
            self.logger.warning(f'User registration validation failed: {e.messages}')
            return {'errors': e.messages}

    def validate_login_data(self, data):
        """Validate user login data"""
        try:
            self.logger.info('Validating user login data')
            validated_data = self.login_schema.load(data)
            self.logger.info('User login data validation successful')
            return validated_data
        except ValidationError as e:
            self.logger.warning(f'User login validation failed: {e.messages}')
            return {'errors': e.messages}

    def validate_update_data(self, data):
        """Validate user update data"""
        try:
            self.logger.info('Validating user update data')
            validated_data = self.update_schema.load(data)
            self.logger.info('User update data validation successful')
            return validated_data
        except ValidationError as e:
            self.logger.warning(f'User update validation failed: {e.messages}')
            return {'errors': e.messages}

    def serialize_user(self, user):
        """Serialize user data for response"""
        try:
            if user:
                serialized = self.response_schema.dump(user)
                self.logger.info('User data serialization successful')
                return serialized
            return None
        except Exception as e:
            self.logger.error(f'Error serializing user data: {e}')
            return None

    def serialize_auth_response(self, response_data):
        """Serialize authentication response"""
        try:
            serialized = self.auth_response_schema.dump(response_data)
            self.logger.info('Auth response serialization successful')
            return serialized
        except Exception as e:
            self.logger.error(f'Error serializing auth response: {e}')
            return response_data