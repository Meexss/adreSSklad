from .utils import read_json, write_json

class Shipment:
    def __init__(self, id, shipment_number, shipment_date, counterparty, warehouse, stocks):
        self.id = id
        self.shipment_number = shipment_number
        self.shipment_date = shipment_date
        self.counterparty = counterparty
        self.warehouse = warehouse
        self.stocks = stocks

    @staticmethod
    def get_all():
        data = read_json('shipments.json')
        return [Shipment(**item) for item in data]

class Product:
    def __init__(self, article, name, quantity, cell, sector, status, zone):
        self.article = article
        self.name = name
        self.quantity = quantity
        self.cell = cell
        self.sector = sector
        self.status = status
        self.zone = zone

    @staticmethod
    def get_all():
        data = read_json('products.json')
        return [Product(**item) for item in data]

    @staticmethod
    def add(product_data):
        data = read_json('products.json')
        data.append(product_data)
        write_json('products.json', data)