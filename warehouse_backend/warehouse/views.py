from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Shipment
from .serializers import ShipmentSerializer, WarehouseShipmentSerializer

class ShipmentListView(APIView):
    def get(self, request):
        shipments = Shipment.objects.all()
        serializer = ShipmentSerializer(shipments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        shipment_number = request.data.get("shipment_number")
        progress = request.data.get("progress")

        if not shipment_number or not progress:
            return Response({"error": "shipment_number и progress обязательны"}, status=status.HTTP_400_BAD_REQUEST)

        # Находим все записи с таким shipment_number
        shipments = Shipment.objects.filter(shipment_number=shipment_number)

        if not shipments.exists():
            return Response({"error": "Отгрузка не найдена"}, status=status.HTTP_404_NOT_FOUND)

        # Обновляем поле progress у всех найденных записей
        shipments.update(progress=progress)

        # Сериализуем обновленные данные и отправляем обратно
        updated_shipments = Shipment.objects.filter(shipment_number=shipment_number)
        serializer = ShipmentSerializer(updated_shipments, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import AddProduct
from .serializers import AddProductSerializer

class AddProductListView(APIView):
    def get(self, request):
        add_number = request.query_params.get("add_number")
        if add_number:
            add_products = AddProduct.objects.filter(add_number=add_number)
        else:
            add_products = AddProduct.objects.all()
        serializer = AddProductSerializer(add_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Product, Reserv
from .serializers import ReservSerializer

class ReserveAllView(APIView):
    def post(self, request):
        stocks = request.data.get('stocks', [])
        shipment_number = request.data.get('shipment_number', 'RESERVED')
        total_reserved = 0
        reserved_items = []

        for stock in stocks:
            article = stock.get('article')
            quantity = stock.get('quantity')

            products = Product.objects.filter(article=article, goods_status__in=["хранение", "приемка"])
            for product in products:
                if product.quantity >= quantity:
                    product.quantity -= quantity
                    product.goods_status = "В отгрузке"
                    product.save()

                    reserved_product = Reserv(
                        shipment_number=shipment_number,
                        reserve_data=datetime.now().date(),
                        unique_id=product.unique_id,
                        article=product.article,
                        name=product.name,
                        quantity=quantity,
                        place=product.place,
                        goods_status="В отгрузке",
                        barcode=product.barcode
                    )
                    reserved_product.save()

                    total_reserved += quantity
                    reserved_items.append({
                        "article": article,
                        "reserved_quantity": quantity,
                        "reserved_places": [product.place]
                    })
                    break
                else:
                    quantity -= product.quantity
                    total_reserved += product.quantity
                    reserved_items.append({
                        "article": article,
                        "reserved_quantity": product.quantity,
                        "reserved_places": [product.place]
                    })
                    product.quantity = 0
                    product.goods_status = "В отгрузке"
                    product.save()

        return Response(
            {"status": "success", "total_reserved": total_reserved, "reserved_items": reserved_items},
            status=status.HTTP_200_OK,
        )

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Reserv, Product

class CancelReservation(APIView):
    def post(self, request):
        reserve_ids = request.data.get('reserve_ids', [])
        cancel_quantities = request.data.get('cancel_quantities', {})
        new_goods_status = request.data.get('goods_status', 'Хранение')

        canceled_items = []

        for reserve_id in reserve_ids:
            reserv = Reserv.objects.get(unique_id=reserve_id)
            cancel_quantity = cancel_quantities.get(reserve_id, reserv.quantity)

            if cancel_quantity < reserv.quantity:
                reserv.quantity -= cancel_quantity
                reserv.save()

                product = Product(
                    unique_id=reserv.unique_id,
                    article=reserv.article,
                    name=reserv.name,
                    quantity=cancel_quantity,
                    place=reserv.place,
                    goods_status=new_goods_status,
                    barcode=reserv.barcode
                )
                product.save()
            else:
                canceled_items.append(reserv)
                product = Product(
                    unique_id=reserv.unique_id,
                    article=reserv.article,
                    name=reserv.name,
                    quantity=reserv.quantity,
                    place=reserv.place,
                    goods_status=new_goods_status,
                    barcode=reserv.barcode
                )
                product.save()
                reserv.delete()

        return Response(
            {"status": "success", "canceled_count": len(canceled_items), "canceled_items": canceled_items},
            status=status.HTTP_200_OK,
        )             

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import PlaceProduct, Product
from .serializers import PlaceProductsSerializer

class PlaceProducts(APIView):
    def get(self, request):
        add_number = request.query_params.get("add_number")
        if add_number:
            place_products = PlaceProduct.objects.filter(add_number=add_number)
        else:
            place_products = PlaceProduct.objects.all()
        serializer = PlaceProductsSerializer(place_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        new_products = request.data
        if not isinstance(new_products, list):
            return Response({"error": "Ожидается список объектов"}, status=status.HTTP_400_BAD_REQUEST)

        for product in new_products:
            place_product = PlaceProduct(
                add_number=product.get("add_number"),
                article=product.get("article"),
                name=product.get("name"),
                barcode=product.get("barcode"),
                quantity=product.get("quantity"),
                unique_id=product.get("unique_id"),
                place=product.get("place"),
                goods_status=product.get("goods_status")
            )
            place_product.save()

            product_record = Product(
                unique_id=product.get("unique_id"),
                article=product.get("article"),
                name=product.get("name"),
                quantity=product.get("quantity"),
                place=product.get("place"),
                goods_status=product.get("goods_status"),
                barcode=product.get("barcode")
            )
            product_record.save()

        return Response({"message": "Данные успешно добавлены"}, status=status.HTTP_201_CREATED)  

class DataShipIn(APIView):
    def post(self, request):
        # Данные из запроса
        shipment_data = request.data
        shipment_number = shipment_data.get("shipment_number")
        shipment_date = shipment_data.get("shipment_date")
        counterparty = shipment_data.get("counterparty")
        warehouse = shipment_data.get("warehouse")
        article = shipment_data.get("article")
        name = shipment_data.get("name")
        quantity = shipment_data.get("quantity")
        barcode = shipment_data.get("barcode")

        # Проверка на обязательные поля
        if not all([shipment_number, shipment_date, counterparty, warehouse, article, name, quantity, barcode]):
            return Response({"error": "Все поля обязательны."}, status=status.HTTP_400_BAD_REQUEST)

        # Создаем запись в таблице Shipment
        shipment = Shipment(
            shipment_number=shipment_number,
            shipment_date=shipment_date,
            counterparty=counterparty,
            warehouse=warehouse,
            progress="Не начато",  # Можно установить статус по умолчанию
            article=article,
            name=name,
            quantity=quantity,
            barcode=barcode
        )
        shipment.save()

        # Сериализация данных и возвращение ответа
        serializer = ShipmentSerializer(shipment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
