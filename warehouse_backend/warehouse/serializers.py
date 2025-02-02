from rest_framework import serializers
from .models import Shipment, AddProduct, Product, Reserv, PlaceProduct, ArchiveShipProduct, ArchiveAddProduct, WarehouseShipment

class StockSerializer(serializers.Serializer):
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    barcode = serializers.CharField()

class PositionDataSerializer(serializers.Serializer):
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    barcode = serializers.CharField()
    error_barcode = serializers.BooleanField()
    newbarcode = serializers.CharField()
    final_quantity = serializers.IntegerField()

class AddProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddProduct
        fields = '__all__'

class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ReservSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserv
        fields = '__all__'

class PlaceProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceProduct
        fields = '__all__'

class ArchiveShipProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveShipProduct
        fields = '__all__'


class ArchiveAddProduct(serializers.ModelSerializer):
    class Meta:
        model = ArchiveAddProduct
        fields = '__all__'


class WarehouseShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseShipment
        fields = ['shipment_number', 'shipment_date', 'counterparty', 'warehouse', 'article', 'name', 'quantity', 'barcode', 'progress', 'unique_id_ship']

