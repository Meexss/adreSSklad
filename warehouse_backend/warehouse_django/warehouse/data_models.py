from .utils import read_json, write_json

class Shipment:
    def __init__(self, shipment_number, shipment_date, counterparty, warehouse, progress, stocks):
        self.shipment_number = shipment_number
        self.shipment_date = shipment_date
        self.counterparty = counterparty
        self.warehouse = warehouse
        self.progress = progress
        self.stocks = stocks

    @staticmethod
    def get_all():
        data = read_json('shipments.json')
        print("Данные из shipments.json:", data)  # Проверяем содержимое
        return [Shipment(**item) for item in data]

    @staticmethod
    def add(shipment_data):
        # Читаем текущие данные из shipments.json
        data = read_json('shipments.json')
        # Добавляем новые данные
        data.append(shipment_data)
        # Записываем обратно в файл
        write_json('shipments.json', data)

class AddProduct:
    def __init__(self, add_number, add_date, counterparty, warehouse, progress, positionData):
        self.add_number = add_number
        self.add_date = add_date
        self.counterparty = counterparty
        self.warehouse = warehouse
        self.progress = progress
        self.positionData = positionData

    @staticmethod
    def get_all():
        # Читаем данные из addproduct.json
        data = read_json('addproduct.json')
        return [AddProduct(**item) for item in data]

    @staticmethod
    def add(addproduct_data):
        # Читаем текущие данные из addproduct.json
        data = read_json('addproduct.json')
        # Добавляем новые данные
        data.append(addproduct_data)
        # Записываем обратно в файл
        write_json('addproduct.json', data)

class Product:
    def __init__(self, unique_id, article, name, quantity, place, goods_status, barcode):
        self.unique_id = unique_id
        self.article = article
        self.name = name
        self.quantity = quantity
        self.place = place
        self.goods_status = goods_status
        self.barcode = barcode

    @staticmethod
    def get_all():
        data = read_json('products.json')
        return [Product(**item) for item in data]

    @staticmethod
    def add(product_data):
        data = read_json('products.json')
        data.append(product_data)
        write_json('products.json', data)

class Reserv:
    def __init__(self, shipment_number, reserve_data, unique_id, article, name, quantity, place, goods_status, barcode):
        self.shipment_number = shipment_number
        self.reserve_data = reserve_data
        self.unique_id = unique_id
        self.article = article
        self.name = name
        self.quantity = quantity
        self.place = place
        self.goods_status = goods_status
        self.barcode = barcode

    @staticmethod
    def get_all():
        # Читаем данные из addproduct.json
        data = read_json('reserv.json')
        return [Reserv(**item) for item in data]

    @staticmethod
    def add(addproduct_data):
        # Читаем текущие данные из addproduct.json
        data = read_json('reserv.json')
        # Добавляем новые данные
        data.append(addproduct_data)
        # Записываем обратно в файл
        write_json('reserv.json', data)

class PlaceProducr:
    def __init__(self, add_number, article, name, barcode, quantity, unique_id, place, goods_status):
        self.add_number = add_number
        self.article = article
        self.name = name
        self.barcode = barcode
        self.quantity = quantity
        self.unique_id = unique_id
        self.place = place
        self.goods_status = goods_status

    @staticmethod
    def get_all():
        data = read_json('scanProducts.json')
        print("Данные из scanProducts.json:", data)  # Проверяем содержимое
        return [Shipment(**item) for item in data]

    @staticmethod
    def add(scanProducts_data):
        # Читаем текущие данные из shipments.json
        data = read_json('scanProducts.json')
        # Добавляем новые данные
        data.append(scanProducts_data)
        # Записываем обратно в файл
        write_json('scanProducts.json', data)


