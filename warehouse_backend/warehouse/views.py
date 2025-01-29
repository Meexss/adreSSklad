from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .data_models import Shipment, AddProduct, Product
from .serializers import ShipmentSerializer, AddProductSerializer, ProductSerializer
import logging

logger = logging.getLogger(__name__)

# Обработчик для получения всех отгрузок
class ShipmentListView(APIView):
    def get(self, request):
        try:
            shipments = Shipment.get_all()  # Читаем данные из shipment.json
            serializer = ShipmentSerializer(shipments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Ошибка при получении отгрузок: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            shipment_data = request.data
            Shipment.add(shipment_data)  # Добавляем данные в shipment.json
            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Ошибка при добавлении отгрузки: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Обработчик для получения всех добавленных продуктов
class AddProductListView(APIView):
    def get(self, request):
        try:
            addproducts = AddProduct.get_all()  # Читаем данные из addproduct.json
            serializer = AddProductSerializer(addproducts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Ошибка при получении добавленных продуктов: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            addproduct_data = request.data
            AddProduct.add(addproduct_data)  # Добавляем данные в addproduct.json
            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Ошибка при добавлении добавленных продуктов: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Обработчик для работы с продуктами
class ProductListView(APIView):
    def get(self, request):
        try:
            products = Product.get_all()
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Ошибка: {e}")  # Логируем исключение
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            product_data = request.data
            Product.add(product_data)
            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Ошибка при добавлении продукта: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
