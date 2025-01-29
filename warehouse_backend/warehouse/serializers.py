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
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    cell = serializers.CharField()
    sector = serializers.CharField()
    zone = serializers.CharField()
