from marshmallow import ValidationError

class OrderSchema:
    def validate_name(self, name):
        if not name or not isinstance(name, str):
            raise ValidationError("Name must be a non-empty string")
        
    def validate_table(self, table):
        if not isinstance(table, int) or table <= 0 or table > 100:
            raise ValidationError("Table must be a positive integer between 1 and 100")
            
    def validate_dishes(self, dishes):
        if not dishes or not isinstance(dishes, list) or len(dishes) == 0:
            raise ValidationError("Dishes must be a non-empty list")
            
        for dish in dishes:
            if not isinstance(dish, dict):
                raise ValidationError("Each dish must be an object")
                
            if 'name' not in dish or not dish['name']:
                raise ValidationError("Each dish must have a name")
                
            if 'price' not in dish or not isinstance(dish['price'], (int, float)) or dish['price'] <= 0:
                raise ValidationError("Each dish must have a positive price")
                
            if 'quantity' not in dish or not isinstance(dish['quantity'], int) or dish['quantity'] <= 0:
                raise ValidationError("Each dish must have a positive quantity")
    
    def validate_time(self, time):
        """Valida que el tiempo tenga el formato correcto (HH:MM:SS)"""
        if not time or not isinstance(time, str):
            raise ValidationError("Time must be a non-empty string")
            
        # Validación básica del formato de tiempo (HH:MM:SS)
        try:
            parts = time.split(':')
            if len(parts) != 3:
                raise ValidationError("Time format should be HH:MM:SS")
                
            hours, minutes, seconds = int(parts[0]), int(parts[1]), int(parts[2])
            
            if hours < 0 or hours > 23 or minutes < 0 or minutes > 59 or seconds < 0 or seconds > 59:
                raise ValidationError("Invalid time values")
        except (ValueError, IndexError):
            raise ValidationError("Invalid time format")