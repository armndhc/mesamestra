"""
Cliente de PayPal para la integración de pagos
"""

import os
import logging
from dotenv import load_dotenv
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials
from paypalserversdk.logging.configuration.api_logging_configuration import (
    LoggingConfiguration,
    RequestLoggingConfiguration,
    ResponseLoggingConfiguration,
)
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient
from paypalserversdk.controllers.orders_controller import OrdersController
from paypalserversdk.controllers.payments_controller import PaymentsController

# Cargar variables de entorno
load_dotenv()

# Obtener credenciales de PayPal desde variables de entorno
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
ENVIRONMENT = os.getenv("FLASK_ENV", "development")

# Configuración del cliente PayPal
paypal_client = PaypalServersdkClient(
    client_credentials_auth_credentials=ClientCredentialsAuthCredentials(
        o_auth_client_id=PAYPAL_CLIENT_ID,
        o_auth_client_secret=PAYPAL_CLIENT_SECRET,
    ),
    logging_configuration=LoggingConfiguration(
        log_level=logging.INFO,
        mask_sensitive_headers=False if ENVIRONMENT == "development" else True,
        request_logging_config=RequestLoggingConfiguration(
            log_headers=True, log_body=True
        ),
        response_logging_config=ResponseLoggingConfiguration(
            log_headers=True, log_body=True
        ),
    ),
)

# Inicializar controladores de PayPal
orders_controller = paypal_client.orders
payments_controller = paypal_client.payments


class PayPalService:
    """
    Servicio para gestionar operaciones de PayPal
    """
    
    @staticmethod
    def create_paypal_order(order_data):
        """
        Crea una orden de PayPal a partir de los datos de orden
        
        Args:
            order_data (dict): Datos de la orden del restaurante
            
        Returns:
            dict: Respuesta del API de PayPal con el ID de orden
        """
        from paypalserversdk.models.order_request import OrderRequest
        from paypalserversdk.models.checkout_payment_intent import CheckoutPaymentIntent
        from paypalserversdk.models.purchase_unit_request import PurchaseUnitRequest
        from paypalserversdk.models.amount_with_breakdown import AmountWithBreakdown
        from paypalserversdk.models.amount_breakdown import AmountBreakdown
        from paypalserversdk.models.money import Money
        from paypalserversdk.models.item import Item
        from paypalserversdk.models.item_category import ItemCategory
        from paypalserversdk.api_helper import ApiHelper

        try:
            # Preparar items para PayPal
            paypal_items = []
            for dish in order_data.get("dishes", []):
                paypal_items.append(
                    Item(
                        name=dish.get("name", "Item"),
                        unit_amount=Money(
                            currency_code="USD", 
                            value=str(dish.get("price", 0))
                        ),
                        quantity=str(dish.get("quantity", 1)),
                        description=f"{dish.get('name', 'Item')}",
                        category=ItemCategory.DIGITAL_GOODS
                    )
                )
            
            # Obtener el total de la orden
            total = order_data.get("total", 0)
            
            # Crear orden en PayPal
            order_result = orders_controller.create_order(
                {
                    "body": OrderRequest(
                        intent=CheckoutPaymentIntent.CAPTURE,
                        purchase_units=[
                            PurchaseUnitRequest(
                                amount=AmountWithBreakdown(
                                    currency_code="USD",
                                    value=str(total),
                                    breakdown=AmountBreakdown(
                                        item_total=Money(currency_code="USD", value=str(total))
                                    ),
                                ),
                                items=paypal_items,
                            )
                        ],
                    )
                }
            )
            
            # Convertir respuesta a diccionario
            return ApiHelper.json_deserialize(ApiHelper.json_serialize(order_result.body))
            
        except Exception as e:
            logging.error(f"Error creating PayPal order: {str(e)}")
            raise
    
    @staticmethod
    def capture_paypal_order(order_id):
        """
        Captura el pago de una orden de PayPal
        
        Args:
            order_id (str): ID de la orden de PayPal
            
        Returns:
            dict: Respuesta del API de PayPal con los detalles de la captura
        """
        from paypalserversdk.api_helper import ApiHelper
        
        try:
            # Capturar orden en PayPal
            capture_result = orders_controller.capture_order(
                {"id": order_id, "prefer": "return=representation"}
            )
            
            # Convertir respuesta a diccionario
            return ApiHelper.json_deserialize(ApiHelper.json_serialize(capture_result.body))
            
        except Exception as e:
            logging.error(f"Error capturing PayPal order {order_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_paypal_order(order_id):
        """
        Obtiene los detalles de una orden de PayPal
        
        Args:
            order_id (str): ID de la orden de PayPal
            
        Returns:
            dict: Respuesta del API de PayPal con los detalles de la orden
        """
        from paypalserversdk.api_helper import ApiHelper
        
        try:
            # Obtener orden de PayPal
            order_result = orders_controller.get_order({"id": order_id})
            
            # Convertir respuesta a diccionario
            return ApiHelper.json_deserialize(ApiHelper.json_serialize(order_result.body))
            
        except Exception as e:
            logging.error(f"Error getting PayPal order {order_id}: {str(e)}")
            raise