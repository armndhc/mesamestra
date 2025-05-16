from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from logger.logger_base import Logger
from flasgger import swag_from

# Routes for Inventory
class InventoryRoutes(Blueprint):
    def __init__(self, inventory_service, inventory_schema):
        super().__init__('inventory', __name__)
        self.inventory_service = inventory_service
        self.inventory_schema = inventory_schema
        self.register_routes()
        self.logger = Logger()

    # Routes
    def register_routes(self):
        self.route('/api/v1/inventories', methods=['GET', 'OPTIONS'])(self.get_inventories)
        self.route('/api/v1/inventories', methods=['POST', 'OPTIONS'])(self.add_inventories)
        self.route('/api/v1/inventories/<int:inventory_id>', methods = ['PUT', 'OPTIONS'])(self.update_inventory)
        self.route('/api/v1/inventories/existence/<int:inventory_id>', methods = ['PUT', 'OPTIONS'])(self.update_inventory_existence)
        self.route('/api/v1/inventories/<int:inventory_id>', methods = ['DELETE', 'OPTIONS'])(self.delete_inventory)
    
    @swag_from({
        'tags': ['Inventories'],
        'responses': {
            200: {
                'description': 'Get All inventories',
                'schema': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'name': { 'type': 'string' },
                            'unit': { 'type': 'string' },
                            'existence': { 'type': 'integer' },
                            'image': { 'type': 'string' },
                        }
                    }
                }
            }
        }
    })
    # Getting all the inventories.
    def get_inventories(self):
        inventories = self.inventory_service.get_all_inventories()
        return jsonify(inventories), 200
    
    @swag_from({
        'tags': ['Inventories'],
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'name': { 'type': 'string' },
                        'unit': { 'type': 'string' },
                        'existence': { 'type': 'integer' },
                        'image': { 'type': 'string' },
                    },
                    'required': ['name', 'unit', 'existence', 'image']
                }
            }
        ],
        'responses': {
            201: {
                'description': 'Inventory successfully created'
            },
            400: {
                'description': 'Invalid data'
            },
            500: {
                'description': 'Internal server error'
            }
        }
    })
    # Adding new inventory
    def add_inventories(self):
        try:
            request_data = request.json

            if not request_data:
                return jsonify({'error': 'invalid data'}), 400
            
            name = request_data.get('name')
            unit = request_data.get('unit')
            existence = request_data.get('existence')
            image = request_data.get('image')


            try:
                self.inventory_schema.validate_name(name)
                self.inventory_schema.validate_unit(unit)
                self.inventory_schema.validate_existence(existence)
                self.inventory_schema.validate_image(image)
            except ValidationError as e:
                return jsonify({ 'error': 'Invalid data' }), 400

            new_inventory = {
                'name': name,
                'unit': unit,
                'existence': existence,
                'image': image
            }

            created_inventory = self.inventory_service.add_inventory(new_inventory)
            return jsonify(created_inventory), 201
        except Exception as e:
            self.logger.error(f'Error adding new inventory to the database: {e}')
            return jsonify({ 'error': f'An exception has ocurred: {e}' }), 500
    
    @swag_from({
        'tags': ['Inventories'],
        'parameters': [
            {
                'name': 'inventory_id',
                'in': 'path',
                'required': True,
                'type': 'string',
                'description': 'ID of the inventory to update'
            },
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string'},
                        'unit': {'type': 'string'},
                        'existence': {'type': 'integer'},
                        'image': {'type': 'string'},
                    },
                    'required': ['name', 'unit', 'existence', 'image']
                }
            }
        ],
        'responses': {
            200: {
                'description': 'Inventory successfully updated',
                'schema': {
                    'type': 'object',
                    'properties': {
                        '_id': {'type': 'string'},
                        'name': {'type': 'string'},
                        'unit': {'type': 'string'},
                        'existence': {'type': 'integer'},
                        'image': {'type': 'string'},
                    }
                }
            },
            400: {
                'description': 'Invalid data'
            },
            404: {
                'description': 'Inventory not found'
            },
            500: {
                'description': 'Internal server error'
            }
        }
    })
    # Updating an inventory
    def update_inventory(self, inventory_id):
        try:
            request_data = request.json    
            
            if not request_data:
                return jsonify({'error': 'Invalid data'}), 400
            
            name = request_data.get('name')
            unit = request_data.get('unit')
            existence = request_data.get('existence')
            image = request_data.get('image')            

            try:
                self.inventory_schema.validate_name(name)
                self.inventory_schema.validate_unit(unit)
                self.inventory_schema.validate_existence(existence)
                self.inventory_schema.validate_image(image)
            except ValidationError as e:
                return jsonify({'error': f'Invalid data {e}'}), 400
            
            update_inventory = {
                '_id': inventory_id,
                'name': name,
                'unit': unit,
                'existence': existence,
                'image': image
            }
            updated_inventory = self.inventory_service.update_inventory(inventory_id, update_inventory)
            if updated_inventory:
                return jsonify(update_inventory), 200
            else:            
                return jsonify({'error': 'Inventory not found'}), 404
        except Exception as e:
            self.logger.error(f'Error updating the inventory in the database: {e}')
            return jsonify({'error': f'An exception has ocurred: {e}'})
    
    @swag_from({
        'tags': ['Inventories'],
        'parameters': [
            {
                'name': 'inventory_id',
                'in': 'path',
                'required': True,
                'type': 'string',
                'description': 'ID of the inventory to update its existence'
            },
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'existence': {'type': 'integer'},
                    },
                    'required': ['existence']
                }
            }
        ],
        'responses': {
            200: {
                'description': 'Existence inventory successfully updated',
                'schema': {
                    'type': 'object',
                    'properties': {
                        '_id': {'type': 'string'},
                        'name': {'type': 'string'},
                        'unit': {'type': 'string'},
                        'existence': {'type': 'integer'},
                        'image': {'type': 'string'},
                    }
                }
            },
            400: {
                'description': 'Invalid data'
            },
            404: {
                'description': 'Inventory not found'
            },
            500: {
                'description': 'Internal server error'
            }
        }
    })
    # Updating the existence for an inventory
    def update_inventory_existence(self, inventory_id):
        try:
            request_data = request.json    
            
            if not request_data:
                return jsonify({'error': 'Invalid data'}), 400
            
            existence = request_data.get('existence')

            try:
                self.inventory_schema.validate_existence(existence)
            except ValidationError as e:
                return jsonify({'error': f'Invalid data {e}'}), 400
            
            updated_inventory = self.inventory_service.update_inventory_existence(inventory_id, existence)
            if updated_inventory:
                return jsonify(updated_inventory), 200
            else:            
                return jsonify({'error': 'Inventory not found'}), 404
        except Exception as e:
            self.logger.error(f'Error updating the inventory in the database: {e}')
            return jsonify({'error': f'An exception has ocurred: {e}'})
    
    @swag_from({
        'tags': ['Inventories'],
        'parameters': [
            {
                'name': 'inventory_id',
                'in': 'path',
                'required': True,
                'type': 'string',
                'description': 'ID of the inventory to delete'
            }
        ],
        'responses': {
            200: {
                'description': 'Inventory successfully deleted'
            },
            404: {
                'description': 'Inventory not found'
            },
            500: {
                'description': 'Internal server error'
            }
        }
    })
    # Deleting an inventory
    def delete_inventory(self, inventory_id):
        try:
            delete_inventory = self.inventory_service.delete_inventory(inventory_id)

            if delete_inventory:
                return jsonify(delete_inventory), 200
            else:
                jsonify({'error': 'Inventory not found'}), 404
        except Exception as e:
            self.logger.error(f'Error deleting the inventory data: {e}')
            jsonify({'error': f'Error deleting the inventory data: {e}'}), 500
