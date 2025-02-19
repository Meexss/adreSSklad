from rest_framework import serializers
from .data_models import (
    TranzitData, ShipData, AddData, ShipList, AddList, ProductList,
    ReservList, PlaceProduct, ArchiveShip, ArchiveAdd, ArchiveProduct, MoveList
)

class TranzitDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranzitData
        fields = '__all__'

class ShipDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipData
        fields = '__all__'

class AddDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddData
        fields = '__all__'

class ShipListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipList
        fields = '__all__'

class AddListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddList
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductList
        fields = '__all__'

class ReservListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservList
        fields = '__all__'

class PlaceProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceProduct
        fields = '__all__'

class ArchiveShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveShip
        fields = '__all__'

class ArchiveAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveAdd
        fields = '__all__'

class ArchiveProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveProduct
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductList
        fields = '__all__'       

  
class MoveListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoveList
        fields = '__all__'         
