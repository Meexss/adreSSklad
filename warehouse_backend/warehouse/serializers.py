from rest_framework import serializers

class ProductSerializer(serializers.Serializer):
    article = serializers.CharField()
    name = serializers.CharField()
    quantity = serializers.IntegerField()
    cell = serializers.CharField()
    sector = serializers.CharField()
    status = serializers.CharField()
    zone = serializers.CharField()

class StockSerializer(serializers.Serializer):
    product = ProductSerializer()
    quantity = serializers.IntegerField()

class ShipmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    shipment_number = serializers.CharField()
    shipment_date = serializers.DateField()
    counterparty = serializers.CharField()
    warehouse = serializers.CharField()
    stocks = StockSerializer(many=True)