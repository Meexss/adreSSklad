from rest_framework import serializers

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

class AddProductSerializer(serializers.Serializer):
    add_number = serializers.CharField()
    add_date = serializers.DateField()
    counterparty = serializers.CharField()
    warehouse = serializers.CharField()
    progress = serializers.CharField()
    positionData = PositionDataSerializer(many=True)


class ShipmentSerializer(serializers.Serializer):
    shipment_number = serializers.CharField()
    shipment_date = serializers.DateField()
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

class PlaceProductsSerializer(serializers.Serializer):
    add_number = serializers.CharField()
    article = serializers.CharField()
    name = serializers.CharField()
    barcode = serializers.CharField()
    quantity = serializers.IntegerField()
    unique_id = serializers.CharField()
    place = serializers.CharField()
    goods_status = serializers.CharField()
   
