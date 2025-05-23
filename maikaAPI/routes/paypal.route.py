"""
Rutas para la integración con PayPal
"""

from flask import Blueprint, request, jsonify
import logging
from flasgger import swag_from

# Importar el servicio de PayPal
from services.paypal_client import PayPalService

# Crear Blueprint para las rutas de PayPal
paypal_bp = Blueprint('paypal', __name__)

@paypal_bp.route('/paypal/orders', methods=['POST'])
@swag_from({
    'tags': ['PayPal'],
    'summary': 'Crear una orden de PayPal',
    'description': 'Crea una nueva orden de PayPal a partir de los datos de un pedido',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'orderData': {
                        'type': 'object',
                        'properties': {
                            'total': {'type': 'number'},
                            'dishes': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'name': {'type': 'string'},
                                        'price': {'type': 'number'},
                                        'quantity': {'type': 'integer'}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Orden creada exitosamente',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},
                    'status': {'type': 'string'}
                }
            }
        },
        '400': {
            'description': 'Error en la solicitud'
        },
        '500': {
            'description': 'Error interno del servidor'
        }
    }
})
def create_order():
    """
    Crea una orden de PayPal a partir de los datos del pedido
    """
    try:
        # Obtener los datos de la solicitud
        request_data = request.get_json()
        
        if not request_data or 'orderData' not in request_data:
            return jsonify({'error': 'Missing orderData in request'}), 400
        
        # Crear orden en PayPal
        paypal_order = PayPalService.create_paypal_order(request_data['orderData'])
        
        # Devolver la respuesta
        return jsonify(paypal_order), 200
        
    except Exception as e:
        logging.error(f"Error creating PayPal order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@paypal_bp.route('/paypal/orders/<order_id>/capture', methods=['POST'])
@swag_from({
    'tags': ['PayPal'],
    'summary': 'Capturar el pago de una orden de PayPal',
    'description': 'Captura el pago de una orden de PayPal previamente creada',
    'parameters': [
        {
            'name': 'order_id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'description': 'ID de la orden de PayPal'
        }
    ],
    'responses': {
        '200': {
            'description': 'Pago capturado exitosamente'
        },
        '400': {
            'description': 'Error en la solicitud'
        },
        '500': {
            'description': 'Error interno del servidor'
        }
    }
})
def capture_order(order_id):
    """
    Captura el pago de una orden de PayPal
    """
    try:
        # Capturar orden en PayPal
        capture_result = PayPalService.capture_paypal_order(order_id)
        
        # Verificar si la captura fue exitosa
        if capture_result.get('status') == 'COMPLETED':
            # Aquí podrías actualizar tu base de datos con la información del pago
            # Por ejemplo: payment_service.update_payment_status(order_id, 'PAID')
            pass
        
        # Devolver la respuesta
        return jsonify(capture_result), 200
        
    except Exception as e:
        logging.error(f"Error capturing PayPal order {order_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@paypal_bp.route('/paypal/orders/<order_id>', methods=['GET'])
@swag_from({
    'tags': ['PayPal'],
    'summary': 'Obtener detalles de una orden de PayPal',
    'description': 'Obtiene los detalles de una orden de PayPal por su ID',
    'parameters': [
        {
            'name': 'order_id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'description': 'ID de la orden de PayPal'
        }
    ],
    'responses': {
        '200': {
            'description': 'Detalles de la orden'
        },
        '404': {
            'description': 'Orden no encontrada'
        },
        '500': {
            'description': 'Error interno del servidor'
        }
    }
})
def get_order(order_id):
    """
    Obtiene los detalles de una orden de PayPal
    """
    try:
        # Obtener orden de PayPal
        order_result = PayPalService.get_paypal_order(order_id)
        
        # Devolver la respuesta
        return jsonify(order_result), 200
        
    except Exception as e:
        logging.error(f"Error getting PayPal order {order_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500