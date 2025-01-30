from rest_framework import serializers

class StockSerializer(serializers.Serializer):
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()

class ShipmentSerializer(serializers.Serializer):
    shipment_number = serializers.CharField()
    shipment_date = serializers.DateField()
    counterparty = serializers.CharField()
    warehouse = serializers.CharField()
    progress = serializers.CharField()
    stocks = StockSerializer(many=True)

class AddProductSerializer(serializers.Serializer):
    add_number = serializers.CharField()
    add_date = serializers.DateField()
    counterparty = serializers.CharField()
    warehouse = serializers.CharField()
    progress = serializers.CharField()
    stocks = StockSerializer(many=True)

class ProductSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    place = serializers.CharField()
    goods_status = serializers.CharField()
    barcode = serializers.CharField()

class ReservSerializer(serializers.Serializer):
    shipment_number = serializers.CharField()
    reserve_data = serializers.CharField()
    unique_id = serializers.CharField()
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    place = serializers.CharField()
    goods_status = serializers.CharField()
    barcode = serializers.CharField()
