from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .data_models import Shipment, AddProduct, Product
from .serializers import ShipmentSerializer, AddProductSerializer, ProductSerializer, ReservSerializer
import uuid
from .utils import read_json, write_json
from datetime import datetime
from datetime import datetime


# Обработчик для получения всех отгрузок
class ShipmentListView(APIView):
    def get(self, request):
        try:
            shipments = Shipment.get_all()  # Читаем данные из shipment.json
            serializer = ShipmentSerializer(shipments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            # Получаем данные из запроса
            shipment_number = request.data.get('shipment_number')
            progress = request.data.get('progress')

            if not shipment_number or not progress:
                return Response(
                    {"error": "Параметры shipment_number и progress обязательны"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Читаем текущие данные из shipment.json
            shipments = read_json('shipments.json')

            # Ищем нужную запись по shipment_number
            shipment_found = False
            for shipment in shipments:
                if shipment.get('shipment_number') == shipment_number:
                    shipment['progress'] = progress  # Обновляем поле progress
                    shipment_found = True
                    break

            if not shipment_found:
                return Response(
                    {"error": f"Отгрузка с shipment_number={shipment_number} не найдена"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Сохраняем обновленные данные обратно в shipment.json
            write_json('shipments.json', shipments)

            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Ошибка на сервере: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Обработчик для получения всех добавленных продуктов
class AddProductListView(APIView):
    def get(self, request):
        try:
            addproducts = AddProduct.get_all()  # Читаем данные из addproduct.json
            serializer = AddProductSerializer(addproducts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            addproduct_data = request.data
            AddProduct.add(addproduct_data)  # Добавляем данные в addproduct.json
            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
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
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Обработчик для работы с резервом на отгрузку
class ReserveAllView(APIView):
    def post(self, request):
        stocks = request.data.get('stocks', [])
        shipment_number = request.data.get('shipment_number', 'RESERVED')  # Получаем номер отгрузки
        total_reserved = 0
        reserved_items = []

        try:
            for stock in stocks:
                article = stock.get('article')
                quantity = stock.get('quantity')

                # Логика резервирования для каждого товара
                reserved_quantity, reserved_places = self.reserve_product(article, quantity, shipment_number)
                total_reserved += reserved_quantity
                reserved_items.append({
                    "article": article,
                    "reserved_quantity": reserved_quantity,
                    "reserved_places": reserved_places
                })

            return Response(
                {"status": "success", "total_reserved": total_reserved, "reserved_items": reserved_items},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            shipment_number = request.query_params.get('shipment_number')

            # Проверка наличия shipment_number в запросе
            if not shipment_number:
                return Response(
                    {"error": "Параметр shipment_number обязателен"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reserv = read_json('reserv.json')
            filtered_reserv = [item for item in reserv if item['shipment_number'] == shipment_number]

            # Проверка наличия данных по shipment_number
            if not filtered_reserv:
                return Response(
                    {"error": f"Отгрузка с shipment_number={shipment_number} не найдена"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = ReservSerializer(filtered_reserv, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Ошибка на сервере"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    def reserve_product(self, article, quantity, shipment_number):
        try:
            # Чтение данных из products.json и reserv.json
            products = read_json('products.json')
            reserv = read_json('reserv.json')

            reserved_quantity = 0
            reserved_places = []

            for product in products:
                if product['article'] == article and product['goods_status'] in ["Хранение", "Приемка"]:
                    available_quantity = product['quantity']
                    remaining_needed = quantity - reserved_quantity

                    if available_quantity >= remaining_needed:
                        # Если текущего товара достаточно для полного резерва
                        reserved_quantity += remaining_needed

                        # Создаем запись для reserv.json
                        reserved_product = {
                            "shipment_number": shipment_number,
                            "reserve_data": datetime.now().strftime("%Y-%m-%d"),  # Текущая дата
                            "unique_id": str(uuid.uuid4()),  # Новый уникальный ID
                            "article": product['article'],
                            "name": product['name'],
                            "quantity": remaining_needed,
                            "place": product['place'],
                            "goods_status": "В отгрузке",
                            "barcode": product['barcode']
                        }

                        # Валидация данных через ReservSerializer
                        serializer = ReservSerializer(data=reserved_product)
                        if serializer.is_valid():
                            reserv.append(serializer.validated_data)
                        else:
                            continue

                        # Обновляем текущий товар
                        product['quantity'] -= remaining_needed
                        if product['quantity'] == 0:
                            product['goods_status'] = "В отгрузке"

                        break  # Завершаем, т.к. резерв выполнен
                    else:
                        # Если товара не хватает, резервируем всё, что есть
                        reserved_quantity += available_quantity

                        # Создаем запись для reserv.json
                        reserved_product = {
                            "shipment_number": shipment_number,
                            "reserve_data": datetime.now().strftime("%Y-%m-%d"),  # Текущая дата
                            "unique_id": product['unique_id'],  # Новый уникальный ID
                            "article": product['article'],
                            "name": product['name'],
                            "quantity": available_quantity,
                            "place": product['place'],
                            "goods_status": "В отгрузке",
                            "barcode": product['barcode']
                        }

                        # Валидация данных через ReservSerializer
                        serializer = ReservSerializer(data=reserved_product)
                        if serializer.is_valid():
                            reserv.append(serializer.validated_data)
                        else:
                            continue

                        # Обнуляем количество и обновляем статус
                        product['quantity'] = 0
                        product['goods_status'] = "В отгрузке"

            # Удаляем товары с нулевым количеством из products.json
            products = [product for product in products if product['quantity'] > 0]            

            # Сохраняем изменения в products.json и reserv.json
            write_json('products.json', products)
            write_json('reserv.json', reserv)

            return reserved_quantity, reserved_places

        except Exception as e:
            raise

class CancelReservation(APIView):
    def post(self, request):
        try:
            reserve_ids = request.data.get('reserve_ids', [])
            
            # Читаем данные из файлов
            reserv = read_json('reserv.json')
            products = read_json('products.json')

            # Находим записи для отмены
            canceled_items = [item for item in reserv if item['unique_id'] in reserve_ids]
            
            # Если не найдено ни одной записи
            if not canceled_items:
                return Response(
                    {"error": "Не найдено резервирований с указанными ID"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Переносим товары обратно в products.json
            for item in canceled_items:
                # Создаем копию с обновленным статусом
                product_entry = {
                    "unique_id": item['unique_id'],  # Сохраняем оригинальный ID
                    "article": item['article'],
                    "name": item['name'],
                    "quantity": item['quantity'],
                    "place": item['place'],
                    "goods_status": "Хранение",  # Обновляем статус
                    "barcode": item['barcode']
                }
                products.append(product_entry)

            # Удаляем отмененные записи из reserv.json
            new_reserv = [item for item in reserv if item['unique_id'] not in reserve_ids]

            # Сохраняем изменения
            write_json('reserv.json', new_reserv)
            write_json('products.json', products)

            return Response(
                {"status": "success", "canceled_count": len(canceled_items)},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": "Ошибка на сервере"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )