from rest_framework.response import Response
from rest_framework.views import APIView
from .data_models import Shipment, Product
from .serializers import ShipmentSerializer, ProductSerializer

class ShipmentListView(APIView):
    def get(self, request):
        shipments = Shipment.get_all()
        serializer = ShipmentSerializer(shipments, many=True)
        return Response(serializer.data)

class ProductListView(APIView):
    def get(self, request):
        products = Product.get_all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_data = request.data
        Product.add(product_data)
        return Response({"status": "success"})