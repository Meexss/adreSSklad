from .serializers import (
    TranzitDataSerializer, ShipDataSerializer, AddDataSerializer,
    ShipListSerializer, AddListSerializer, ProductListSerializer,
    ReservListSerializer, PlaceProductSerializer, ArchiveShipSerializer,
    ArchiveAddSerializer, ArchiveProductSerializer, ProductListSerializer, MoveListSerializer
)
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .data_models import (
    TranzitData, ShipData, AddData, ShipList, AddList, ProductList,
    ReservList, PlaceProduct, ArchiveShip, ArchiveAdd, ArchiveProduct, MoveList
)
import uuid
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import traceback
from django.db import transaction
from collections import defaultdict
from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Вы авторизованы!", "user": request.user.username})

# Работает [{},{}]
#Входные данные Запись перемещений в таблицы и логика распределения на другие ShipList и AddList
class TranzitDataViewSet(viewsets.ModelViewSet):
    queryset = TranzitData.objects.all()
    serializer_class = TranzitDataSerializer

    def create(self, request, *args, **kwargs):
        # Очистка таблицы перед загрузкой новых данных
        TranzitData.objects.all().delete()

        print(f"Получены данные: {request.data}")
        if not isinstance(request.data, list):
            return Response({"error": "Ожидался массив данных"}, status=status.HTTP_400_BAD_REQUEST)

        all_tranzit_records = []
        all_ship_records = []
        all_add_list_records = []

        for tranzit in request.data:
            unique_id = uuid.uuid4()
            tranz_number = "p" + tranzit.get("tranz_number", "")
            tranz_date = tranzit.get("tranz_date")
            from_house = tranzit.get("from_house", "")
            to_house = tranzit.get("to_house", "")
            position_data = tranzit.get("positionData", [])

            
            tranz_date = datetime.strptime(tranz_date, "%Y-%m-%dT%H:%M:%SZ")

            # Группировка данных по артикулу и баркоду
            grouped_positions = defaultdict(lambda: {"name": "", "quantity": 0})
            
            for position in position_data:
                article = position.get("article", "")
                barcode = position.get("barcode", "")
                key = (article, barcode)

                grouped_positions[key]["name"] = position.get("name", "")
                grouped_positions[key]["quantity"] += position.get("quantity", 0)

            # Формируем записи для TranzitData
            tranzit_records = [
                TranzitData(
                    tranz_number=tranz_number,
                    tranz_date=tranz_date,
                    from_house=from_house,
                    to_house=to_house,
                    article=article,
                    name=data["name"],
                    barcode=barcode,
                    quantity=data["quantity"],
                )
                for (article, barcode), data in grouped_positions.items()
            ]
            all_tranzit_records.extend(tranzit_records)

            # Логика добавления в ShipList и AddList
            if from_house == "Центральный новый" and not ShipList.objects.filter(ship_number=tranz_number).exists():
                ship_records = [
                    ShipList(
                        unique_id_ship=unique_id,
                        type="Перемещение",
                        ship_number=tranz_number,
                        ship_date=tranz_date,
                        counterparty=to_house,
                        warehouse=from_house,
                        progress="Новый",
                        article=article,
                        name=data["name"],
                        barcode=barcode,
                        quantity=data["quantity"],
                    )
                    for (article, barcode), data in grouped_positions.items()
                ]
                all_ship_records.extend(ship_records)

            if to_house == "Центральный новый" and not AddList.objects.filter(add_number=tranz_number).exists():
                add_list_records = [
                    AddList(
                        unique_id_add=unique_id,
                        type="Перемещение",
                        add_number=tranz_number,
                        add_date=tranz_date,
                        counterparty=from_house if from_house != "Центральный новый" else to_house,
                        warehouse=to_house if to_house == "Центральный новый" else from_house,
                        progress="Новый",
                        article=article,
                        name=data["name"],
                        barcode=barcode,
                        quantity=data["quantity"],
                        error_barcode=False,
                        newbarcode="",
                        final_quantity=0,
                        goods_status="Приемка перемещения",
                    )
                    for (article, barcode), data in grouped_positions.items()
                ]
                all_add_list_records.extend(add_list_records)

        # Массовая вставка данных в базу
        if all_tranzit_records:
            TranzitData.objects.bulk_create(all_tranzit_records)

        if all_ship_records:
            ShipList.objects.bulk_create(all_ship_records)

        if all_add_list_records:
            AddList.objects.bulk_create(all_add_list_records)

        return Response({"message": "Данные успешно сохранены"}, status=status.HTTP_201_CREATED)

# Работает  [{},{}]  
#Входные данные Запись отгрузок с типом склад равно Центральный Новый 
class ShipDataViewSet(viewsets.ModelViewSet):
    queryset = ShipData.objects.all()
    serializer_class = ShipDataSerializer

    def create(self, request, *args, **kwargs):
        shipments = request.data  # Ожидаем массив объектов

        if not isinstance(shipments, list):
            return Response({"error": "Ожидался массив данных"}, status=status.HTTP_400_BAD_REQUEST)

        # Очистка таблицы ShipData перед записью новых данных
        ShipData.objects.all().delete()

        ship_data_instances = []
        ship_list_instances = []

        for data in shipments:
            unique_id = uuid.uuid4()
            ship_number = "s" + data.get("ship_number", "")
            ship_date = data.get("ship_date")
            counterparty = data.get("counterparty", "")
            warehouse = data.get("warehouse", "")
            position_data = data.get("positionData", [])

            try:
                ship_date = datetime.strptime(ship_date, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                return Response({"error": f"Неверный формат даты: {ship_date}"}, status=status.HTTP_400_BAD_REQUEST)

            # Группировка данных по артикулу и баркоду
            grouped_positions = defaultdict(lambda: {"name": "", "quantity": 0})

            for item in position_data:
                article = item.get("article", "")
                barcode = item.get("barcode", "")
                key = (article, barcode)

                grouped_positions[key]["name"] = item.get("name", "")
                grouped_positions[key]["quantity"] += item.get("quantity", 0)

            # Запись агрегированных данных в ShipData
            for (article, barcode), data in grouped_positions.items():
                ship_data_instances.append(
                    ShipData(
                        ship_number=ship_number,
                        ship_date=ship_date,
                        counterparty=counterparty,
                        warehouse=warehouse,
                        article=article,
                        name=data["name"],
                        barcode=barcode,
                        quantity=data["quantity"]
                    )
                )

                # Если warehouse == "Центральный новый" и такой ship_number ещё не существует в ShipList
                if warehouse == "Центральный новый" and not ShipList.objects.filter(ship_number=ship_number).exists():
                    ship_list_instances.append(
                        ShipList(
                            unique_id_ship=unique_id,
                            type="Реализация",
                            ship_number=ship_number,
                            ship_date=ship_date,
                            counterparty=counterparty,
                            warehouse=warehouse,
                            progress="Новый",
                            article=article,
                            name=data["name"],
                            barcode=barcode,
                            quantity=data["quantity"]
                        )
                    )

        # Массовая вставка данных
        if ship_data_instances:
            ShipData.objects.bulk_create(ship_data_instances)

        if ship_list_instances:
            ShipList.objects.bulk_create(ship_list_instances)

        return Response({"message": "Данные успешно сохранены"}, status=status.HTTP_201_CREATED)


# Работает  [{},{}]  
# Входные данные Запись оприходования с типом склад равно Центральный новый
class AddDataViewSet(viewsets.ModelViewSet):
    queryset = AddData.objects.all()
    serializer_class = AddDataSerializer

    def create(self, request, *args, **kwargs):
        additions = request.data  # Ожидаем массив объектов

        if not isinstance(additions, list):
            return Response({"error": "Ожидался массив данных"}, status=status.HTTP_400_BAD_REQUEST)

        # Очистка AddData перед записью новых данных
        AddData.objects.all().delete()

        add_data_instances = []
        add_list_instances = []

        for data in additions:
            unique_id = uuid.uuid4()
            add_number = "o" + data.get("add_number", "")
            add_date = data.get("add_date")
            counterparty = data.get("counterparty", "")
            warehouse = data.get("warehouse", "")
            position_data = data.get("positionData", [])

            try:
                add_date = datetime.strptime(add_date, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                return Response({"error": f"Неверный формат даты: {add_date}"}, status=status.HTTP_400_BAD_REQUEST)

            # Группировка данных по артикулу и баркоду
            grouped_positions = defaultdict(lambda: {"name": "", "quantity": 0})

            for item in position_data:
                article = item.get("article", "")
                barcode = item.get("barcode", "")
                key = (article, barcode)

                grouped_positions[key]["name"] = item.get("name", "")
                grouped_positions[key]["quantity"] += item.get("quantity", 0)

            # Запись агрегированных данных в AddData
            for (article, barcode), data in grouped_positions.items():
                add_data_instances.append(
                    AddData(
                        add_number=add_number,
                        add_date=add_date,
                        counterparty=counterparty,
                        warehouse=warehouse,
                        article=article,
                        name=data["name"],
                        barcode=barcode,
                        quantity=data["quantity"]
                    )
                )

                # Если warehouse == "Центральный новый" и такой add_number ещё не существует в AddList
                if warehouse == "Центральный новый" and not AddList.objects.filter(add_number=add_number).exists():
                    add_list_instances.append(
                        AddList(
                            unique_id_add=unique_id,
                            type="Оприходование",
                            add_number=add_number,
                            add_date=add_date,
                            counterparty=counterparty,
                            warehouse=warehouse,
                            progress="Новый",
                            article=article,
                            name=data["name"],
                            barcode=barcode,
                            quantity=data["quantity"],
                            error_barcode=False,
                            newbarcode="",
                            final_quantity=0,
                            goods_status="Приёмка"
                        )
                    )

        # Массовая вставка данных
        if add_data_instances:
            AddData.objects.bulk_create(add_data_instances)

        if add_list_instances:
            AddList.objects.bulk_create(add_list_instances)

        return Response({"message": "Данные успешно сохранены"}, status=status.HTTP_201_CREATED)
    
# Работает get и post 
# Обработчик для получения всех отгрузок
class ShipmentListView(APIView):

    def get(self, request):
        try:
            shipments = ShipList.objects.all().order_by("ship_date")  # Читаем данные из базы данных
            serializer = ShipListSerializer(shipments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            # Получаем данные из запроса
            uid_ship = request.data.get('uid_ship')
            progress = request.data.get('progress')

            if not uid_ship or not progress:
                return Response(
                    {"error": "Параметры uid_ship и progress обязательны"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ищем нужную запись по unique_id_ship
            updated_count = ShipList.objects.filter(unique_id_ship=uid_ship).update(progress=progress)

            if updated_count == 0:
                return Response(
                    {"error": f"Отгрузка с unique_id_ship={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({"status": "success", "updated_count": updated_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Ошибка на сервере: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Работает {} post и get
# Обработчик для получения списка товаров и смены места хранения
class ProductListView(APIView):
    def post(self, request):
        try:
            data = request.data
            place = data.get("place")
            barcode = data.get("barcode")
            colChange = int(data.get("colChange", 0))
            newPlace = data.get("newPlace")

            if not all([place, barcode, colChange, newPlace]):
                return Response({"error": "Не все поля заполнены"}, status=status.HTTP_400_BAD_REQUEST)

            # Фильтруем товары по месту и штрихкоду
            matching_products = ProductList.objects.filter(place=place, barcode=barcode)

            if not matching_products.exists():
                return Response({"error": "Товар не найден в указанной ячейке"}, status=status.HTTP_404_NOT_FOUND)

            remaining_qty = colChange  # Количество, которое нужно переместить

            for product in matching_products:
                if remaining_qty <= 0:
                    break  # Если уже перенесли всё нужное количество — выходим

                if product.quantity <= remaining_qty:
                    # Если количество полностью переносится — просто меняем `place`
                    product.place = newPlace
                    remaining_qty -= product.quantity
                else:
                    # Если часть остается, делаем "разделение" записи
                    new_product = ProductList(
                        unique_id=uuid.uuid4(),  # Новый уникальный ID
                        article=product.article,
                        name=product.name,
                        barcode=product.barcode,
                        place=newPlace,  # Меняем место
                        quantity=remaining_qty,  # Только часть переносим
                        goods_status=product.goods_status,
                        add_date=product.add_date,  # Дата поступления
                    )
                    new_product.save()

                    # Уменьшаем количество в старой позиции
                    product.quantity -= remaining_qty
                    product.save()
                    remaining_qty = 0

            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            print("Получен запрос на список товаров")

            products = ProductList.objects.all()
            if not products:
                print("Список товаров пуст")
                return Response({"error": "Товары не найдены"}, status=status.HTTP_404_NOT_FOUND)

            # Сортировка
            sort_by = request.query_params.get('sort', 'article')
            reverse = request.query_params.get('order', 'asc') == 'desc'

            try:
                products = products.order_by(f"{'-' if reverse else ''}{sort_by}")
                print(f"Сортировка по {sort_by}, порядок {'убывающий' if reverse else 'возрастающий'}")
            except Exception as e:
                print(f"Ошибка при сортировке: {e}")
                return Response({"error": f"Некорректное поле сортировки: {sort_by}"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = ProductListSerializer(products, many=True)
            print("Данные успешно отправлены")
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

# Работает get и post
# Для установки места есть сомнения в Post
class PlaceProducts(APIView):

    def get(self, request):
        try:
            uid_add = request.query_params.get("uid_add")
            
            if uid_add:
                filtered_products = PlaceProduct.objects.filter(unique_id_add=uid_add)
            else:
                filtered_products = PlaceProduct.objects.all()

            # Используем сериализатор для преобразования объектов в JSON
            serializer = PlaceProductSerializer(filtered_products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            new_products = request.data
            print("Полученные данные:", new_products)  # Лог запроса

            print("Тип полученных данных:", type(new_products))

            if not isinstance(new_products, list):
                return Response({"error": "Ожидается список объектов"}, status=status.HTTP_400_BAD_REQUEST)

            created_products = []
           
            for product in new_products:
                add_date = product.get("add_date")
                uniqid = uuid.uuid4()

                # Фильтруем данные
                filtered_add = AddList.objects.filter(unique_id_add=product.get("uid_add"), article=product.get("article"))
                filtered_place = PlaceProduct.objects.filter(unique_id_add=product.get("uid_add"), article=product.get("article"))

                # Считаем сумму полей
                sum_add = filtered_add.aggregate(total=Sum("final_quantity"))["total"] or 0
                sum_place = filtered_place.aggregate(total=Sum("quantity"))["total"] or 0

                # Вычисляем разницу
                difference = sum_add - sum_place

                if difference < product.get("quantity"):
                    return Response(
                        {"error": f"Недостаточное количество товара: {difference} доступно, {product.get('quantity')} требуется"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if add_date:
                    try:
                        add_date_fin = datetime.strptime(add_date, "%Y-%m-%dT%H:%M:%SZ")
                    except ValueError:
                        return Response({"error": f"Неверный формат даты: {add_date}"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Поле add_date обязательно"}, status=status.HTTP_400_BAD_REQUEST)
                

                # Исключаем `unique_id`, так как Django сам его создаст
                place_product = PlaceProduct.objects.create(
                    unique_id_add = product.get("uid_add", ""),
                    unique_id=uniqid,
                    type=product.get("type", ""),
                    add_number=product.get("add_number", ""),
                    add_date=add_date_fin,
                    article=product.get("article"),
                    name=product.get("name"),
                    barcode=product.get("barcode"),
                    place=product.get("place"),
                    quantity=product.get("quantity"),
                    goods_status=product.get("goods_status")
                )

                prod_list = ProductList.objects.create(
                    unique_id=uniqid,
                    add_date=add_date_fin,
                    article=product.get("article"),
                    name=product.get("name"),
                    barcode=product.get("barcode"),
                    place=product.get("place"),
                    quantity=product.get("quantity"),
                    goods_status=product.get("goods_status")
                )

                # Сериализуем объект


                serializerPlace = PlaceProductSerializer(place_product)
                created_products.append(serializerPlace.data)
                serializerProd = ProductListSerializer(prod_list)
                created_products.append(serializerProd.data)
            return Response({"message": "Данные успешно добавлены", "data": created_products}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Ошибка сервера:", traceback.format_exc())  # Теперь traceback работает
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Работает get и post
# Обработчик для получения всех добавленных продуктов 
class AddProductListView(APIView):
    def get(self, request):
        try:
            print(f"Query params: {request.query_params}")  # Логирование запроса
            uid_add = request.query_params.get("uid_add")
            print(f"Получен параметр uid_add: {uid_add}")  # Логирование

            if uid_add:
                products = AddList.objects.filter(add_number=uid_add)
                print(f"Найдено записей: {products.count()}")  # Логирование результатов запроса

                if not products.exists():
                    print("Товар не найден")  
                    return Response({"error": "Товар не найден"}, status=status.HTTP_404_NOT_FOUND)

                serializer = AddListSerializer(products, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            print("uid_add не передан! Возвращаем все записи.")  # Лог

            products = AddList.objects.all().order_by("add_date") 
            serializer = AddListSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            addproduct_data = request.data
            uid_add = addproduct_data.get('uid_add')
            position_data = addproduct_data.get('positionData')
            new_progress = addproduct_data.get('progress')

            # Находим список позиций по unique_id_add
            products = AddList.objects.filter(unique_id_add=uid_add)

            if not products.exists():
                return Response({"error": "Product with this add_number not found"}, status=status.HTTP_404_NOT_FOUND)

            print("Position data:", position_data)

            # Обновляем данные для найденных позиций
            updated = False
            for product in products:
                for new_position in position_data:
                    article = new_position.get("article")

                    # Проверяем, есть ли позиция с таким артикулом в списке
                    if product.article == article:
                        product.error_barcode = new_position.get("error_barcode", product.error_barcode)
                        product.newbarcode = new_position.get("newbarcode", product.newbarcode)
                        product.final_quantity = new_position.get("final_quantity", product.final_quantity)
                        updated = True

                if new_progress:
                    product.progress = new_progress
                    updated = True

                product.save()  # Сохраняем только если обновили

            if updated:
                return Response({"status": "success"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "No matching articles found"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#Работает Post и get
# Обработчик для работы с резервом на отгрузку Не увидел больших проблем 
class ReserveAllView(APIView):
    def post(self, request):
        stocks = request.data.get("stocks", [])
        uid_ship = request.data.get("uid_ship", "RESERVED")
        type = request.data.get("type", "RESERVED")
        ship_number = request.data.get("ship_number", "RESERVED")
        ship_date = request.data.get("ship_date")
        counterparty = request.data.get("counterparty", "RESERVED")
        warehouse = request.data.get("warehouse", "RESERVED")
        progress = request.data.get("progress", "RESERVED")
        
        
          # Получаем номер отгрузки
        print(f"Поиск по отгрузке с номером: {uid_ship}")

        if isinstance(ship_date, str) and ship_date != "RESERVED":
            try:
                ship_date = datetime.fromisoformat(ship_date)
            except ValueError:
                print(f"Ошибка конвертации ship_date: {ship_date}")
            
               
        total_reserved = 0
        reserved_items = []
        no_reserv_items = []

        try:
            for stock in stocks:
                article = stock.get("article")
                quantity = stock.get("quantity")

                # Резервируем товар
                reserved_quantity, reserved_places, no_reserv = self.reserve_product(article, quantity, uid_ship, ship_number, type, ship_date, counterparty, warehouse, progress)

                total_reserved += reserved_quantity
                reserved_items.append(
                    {
                        "article": article,
                        "reserved_quantity": reserved_quantity,
                        "reserved_places": reserved_places,
                    }
                )

                if no_reserv:
                    no_reserv_items.append(
                        {
                            "article": article,
                            "no_reserv_quantity": quantity - reserved_quantity,
                        }
                    )

            return Response(
                {
                    "status": "success",
                    "total_reserved": total_reserved,
                    "reserved_items": reserved_items,
                    "no_reserv_items": no_reserv_items,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print(f"Ошибка в reserve_product: {str(e)}")
            return Response(
                {"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        try:
            uid_ship = request.query_params.get("uid_ship")
            print(f"получили данные : {uid_ship}")   
            if not uid_ship:
                return Response(
                    {"error": "Параметр uid_ship обязателен"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Получаем все записи из базы данных для указанного uid_ship
            reserv = ReservList.objects.filter(unique_id_ship=uid_ship)

            if not reserv.exists():
                return Response(
                    {"error": f"Отгрузка с uid_ship={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = ReservListSerializer(reserv, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка в get: {str(e)}")
            return Response(
                {"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def reserve_product(self, article, quantity, uid_ship, ship_number, type, ship_date, counterparty, warehouse, progress):
        try:
            products = ProductList.objects.filter(
                article=article, goods_status__in=["Хранение"]
            ).order_by("add_date")

            reserved_quantity = 0
            reserved_places = []
            remaining_needed = quantity  # Сколько еще нужно зарезервировать

            for product in products:
                print(f"Товар: {product.article}, статус: {product.goods_status}")

                available_quantity = product.quantity

                if available_quantity >= remaining_needed:
                    # Резервируем нужное количество
                    reserved_quantity += remaining_needed
                    reserved_places.append(product.place)

                    # Создаем запись в резерве
                    reserved_product = ReservList(
                        unique_id_ship=uid_ship,
                        reserve_data=datetime.now(),
                        unique_id=uuid.uuid4(),
                        article=product.article,
                        name=product.name,
                        barcode=product.barcode,
                        quantity=remaining_needed,
                        place=product.place,
                        goods_status="В отгрузке",
                        add_date=product.add_date,

                        type = type,
                        ship_number = ship_number,
                        ship_date = ship_date,
                        counterparty = counterparty,
                        warehouse = warehouse,
                        progress = progress,

                    )

                    try:
                        reserved_product.save()
                    except Exception as e:
                        print(f"Ошибка сохранения ReservList: {e}")
                        raise

                    # Уменьшаем количество товара
                    product.quantity -= remaining_needed
                    product.save(update_fields=["quantity"])

                    if product.quantity == 0:
                        product.delete()

                    break  # Завершаем, так как резерв выполнен

                else:
                    # Если товара не хватает, резервируем всё, что есть
                    reserved_quantity += available_quantity
                    reserved_places.append(product.place)
                    remaining_needed -= available_quantity

                    # Создаем запись в резерве
                    reserved_product = ReservList(
                        unique_id_ship=uid_ship,
                        reserve_data=datetime.now(),
                        unique_id=uuid.uuid4(),
                        article=product.article,
                        name=product.name,
                        barcode=product.barcode,
                        quantity=available_quantity,
                        place=product.place,
                        goods_status="В отгрузке",
                        add_date=product.add_date,

                        type = type,
                        ship_number = ship_number,
                        ship_date = ship_date,
                        counterparty = counterparty,
                        warehouse = warehouse,
                        progress = progress,
                    )
                    try:
                        reserved_product.save()
                    except Exception as e:
                        print(f"Ошибка сохранения ReservList: {e}")
                        raise

                    # Удаляем товар
                    product.delete()

            # Если не удалось зарезервировать всю требуемую партию, создаем запись о нехватке
            no_reserv = quantity > reserved_quantity

            return reserved_quantity, reserved_places, no_reserv

        except Exception as e:
            print(f"Ошибка в reserve_product: {str(e)}")
            raise


# Работает массовая отмена при частичной выдает ошибку 500 но работает вынести просто в get
# Обработчик для Отмены резерва тоже больных проблем не увидел 
class CancelReservation(APIView):
    def post(self, request):
        try:
            reserve_ids = request.data.get('reserve_ids', [])
            new_goods_status = request.data.get('goods_status', 'Хранение')
            
            print(f"Полученные данные: {reserve_ids}")
            print(f"Новый статус товаров: {new_goods_status}")
            
            canceled_items = []  # Список отмененных товаров
            
            reserv_items = ReservList.objects.filter(unique_id__in=reserve_ids)
            print(f"Найденные резервированные позиции: {reserv_items}")
            
            with transaction.atomic():  # Оборачиваем в транзакцию для целостности данных
                for item in reserv_items:
                    if item.place == "НЕУДАЛОСЬ ЗАРЕЗЕРВИРОВАТЬ":
                        canceled_items.append(item)
                        item.delete()
                        continue

                    if item.place == "Сборка":
                        continue  
                            
                    product = ProductList.objects.filter(article=item.article, place=item.place, add_date=item.add_date).first()
                    

                    if product:
                        product.quantity += item.quantity  # Добавляем количество к существующему товару
                        product.save()
                    else:
                        product = ProductList.objects.create(
                            unique_id=item.unique_id,  # Присваиваем UUID от резерва
                            add_date=item.add_date,
                            article=item.article,
                            name=item.name,
                            barcode=item.barcode,
                            place=item.place,
                            quantity=item.quantity,
                            goods_status=new_goods_status,
                        )
                    
                    canceled_items.append(item)
                    item.delete()  # Удаляем запись из резерва
            
            # Сериализация отмененных товаров
            canceled_items_serializer = ReservListSerializer(canceled_items, many=True)
            
            return Response(
                {
                    "status": "success",
                    "canceled_count": len(canceled_items),
                    "canceled_items": canceled_items_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print(f"Ошибка: {str(e)}")  # Для отладки
            return Response(
                {"error": "Ошибка на сервере", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
#поправил Post сделал get для полчения списка        
#Обработчик для переноса в архив отгрузок Надо проверить 
class ArchiveShipView(APIView):
    def post(self, request):
        data = request.data  # Получаем список объектов
        if not isinstance(data, list):
            return Response({"error": "Invalid data format, expected a list"}, status=400)
        print(f"полученные данные : {data}")
        unique_id_ship = data[0].get("unique_id_ship")  # Берем `unique_id_ship` из первого элемента
        print(f"фильтруем id : {unique_id_ship}")
        try:
            with transaction.atomic():  # Группируем операции в одну транзакцию
                # Архивируем данные для ShipList и ReservList
                print(f"начлаи с atomic")
                archive_ship_data = []
                archive_product_data = []

                for item in data:
                    # Подготовка данных для архивирования в ArchiveShip
                    print(f"получаем item: {item}")
                    archive_ship_data.append(
                        ArchiveShip(
                            unique_id_ship=item.get("unique_id_ship"),
                            type=item.get("type"),
                            ship_number=item.get("ship_number"),
                            ship_date=item.get("ship_date"),
                            counterparty=item.get("counterparty"),
                            warehouse=item.get("warehouse"),
                            progress=item.get("progress"),
                            reserve_data=item.get("reserve_data"),
                            unique_id=item.get("unique_id"),
                            article=item.get("article"),
                            name=item.get("name"),
                            barcode=item.get("barcode"),
                            quantity=item.get("quantity"),
                            place=item.get("place"),
                            final_ship_date=datetime.now()  # Дата архивирования
                        )
                    )

                    # Подготовка данных для архивирования в ArchiveProduct
                    archive_product_data.append(
                        ArchiveProduct(
                            unique_id=item.get("unique_id"),
                            add_date=item.get("add_date"),
                            article=item.get("article"),
                            name=item.get("name"),
                            barcode=item.get("barcode"),
                            quantity=item.get("quantity"),
                            place=item.get("place"),
                            goods_status=item.get("goods_status"),
                            close_product_date=datetime.now()  # Дата архивирования
                        )
                    )
                print(f"закончили цикол")
                # Выполняем массовую вставку данных в архивы
                ArchiveShip.objects.bulk_create(archive_ship_data)
                ArchiveProduct.objects.bulk_create(archive_product_data)

                # Удаляем записи в ShipList и ReservList, относящиеся к текущему unique_id_ship
                ShipList.objects.filter(unique_id_ship=unique_id_ship).delete()
                ReservList.objects.filter(unique_id_ship=unique_id_ship).delete()

            return Response({"message": "Data archived successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def get(self, request):
        try:
            archiveShip = ArchiveShip.objects.all().order_by("-final_ship_date")  # Читаем данные из базы данных
            serializer = ArchiveShipSerializer(archiveShip, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Сделал get на получение 
# Обработчик для почения списка архва продуктов 
class ArchiveProductView(APIView):
    def get(self, request):
        try:
            archiveProd = ArchiveProduct.objects.all().order_by("-close_product_date")  # Читаем данные из базы данных
            serializer = ArchiveProductSerializer(archiveProd, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#обработчик для переноса в архив поставок НО проверить
class ArchiveAddView(APIView):
    def post(self, request):
        data = request.data  # Получаем список объектов
        if not isinstance(data, list):
            return Response({"error": "Invalid data format, expected a list"}, status=400)
        print(f"полученные данные : {data}")
        unique_id_add = data[0].get("unique_id_add")  # Берем `unique_id_ship` из первого элемента
        print(f"фильтруем id : {unique_id_add}")
        try:
            with transaction.atomic():  # Группируем операции в одну транзакцию
                # Архивируем данные для ShipList и ReservList
                print(f"начлаи с atomic")
                archive_add_data = []
        

                for item in data:
                    # Подготовка данных для архивирования в ArchiveShip
                    print(f"получаем item: {item}")
                    archive_add_data.append(
                        ArchiveAdd(
                            unique_id_add=item.get("unique_id_add"),
                            type=item.get("type"),
                            add_number=item.get("add_number"),
                            add_date=item.get("add_date"),
                            counterparty=item.get("counterparty"),
                            warehouse=item.get("warehouse"),
                            progress=item.get("progress"),

                            unique_id=item.get("unique_id"),
                            article=item.get("article"),
                            name=item.get("name"),
                            barcode=item.get("barcode"),
                            place=item.get("place"),
                            quantity_start=item.get("quantity_start"),
                            quanity_place=item.get("quanity_place"),
                            goods_status=item.get("goods_status"),
                            close_add_date=datetime.now()  # Дата архивирования
                        )
                    )

                print(f"закончили цикол")
                # Выполняем массовую вставку данных в архивы
                ArchiveAdd.objects.bulk_create(archive_add_data)

                # Удаляем записи в ShipList и ReservList, относящиеся к текущему unique_id_ship
                AddList.objects.filter(unique_id_add=unique_id_add).delete()
                PlaceProduct.objects.filter(unique_id_add=unique_id_add).delete()

            return Response({"message": "Data archived successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def get(self, request):
        try:
            archiveAdd = ArchiveAdd.objects.all().order_by("-close_add_date")  # Читаем данные из базы данных
            serializer = ArchiveAddSerializer(archiveAdd, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
        
# Работает {} и post
# загрузка карточек в базу
class ProductListCreateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Получаем массив данных из запроса
            data = request.data

            # Проверяем, что данные — это массив
            if not isinstance(data, list):
                return Response({"error": "Данные должны быть в виде массива объектов"}, status=status.HTTP_400_BAD_REQUEST)

            # Список для хранения объектов, которые нужно добавить в базу
            products_to_create = []

            # Обрабатываем каждый элемент в массиве
            for item in data:
                # Проверяем, что все необходимые поля присутствуют в каждом объекте
                required_fields = ['add_date', 'article', 'name', 'barcode', 'place', 'quantity', 'goods_status']
                if not all(field in item for field in required_fields):
                    return Response({"error": "Не все поля заполнены для одного из товаров"}, status=status.HTTP_400_BAD_REQUEST)

                # Переводим дату в нужный формат
                add_date = datetime.strptime(item['add_date'], "%Y-%m-%dT%H:%M:%SZ")

                # Создаем объект товара, добавляем его в список
                product = ProductList(
                    unique_id=uuid.uuid4(),
                    add_date=add_date,
                    article=item['article'],
                    name=item['name'],
                    barcode=item['barcode'],
                    place=item['place'],
                    quantity=item['quantity'],
                    goods_status="Хранение"  # Статус товара
                )

                # Добавляем товар в список для массового сохранения
                products_to_create.append(product)

            # Сохраняем все товары в базу данных за один запрос
            ProductList.objects.bulk_create(products_to_create)

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    


class FindBarcodeViews(APIView):
    def get(self, request):
        try:
            # Получаем штрих-код из параметров запроса
            code = request.query_params.get("barcode", "").strip()
            print(f"Поиск по штрих-коду: {code}")

            # Проверяем, передан ли штрих-код
            if not code:
                return Response({"error": "Штрих-код не указан"}, status=status.HTTP_400_BAD_REQUEST)

            # Поиск товаров по штрих-коду
            filtered_products = ProductList.objects.filter(barcode=code)

            # Если товары не найдены
            if not filtered_products.exists():
                return Response({"message": "Товары не найдены"}, status=status.HTTP_404_NOT_FOUND)

            # Сериализация данных
            serializer = ProductListSerializer(filtered_products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {str(e)}")  # Логируем ошибку
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FindPlaceViews(APIView):
    def get(self, request):
        try:
            # Получаем значение места из параметров запроса (используем query_params, а не data)
            code = request.query_params.get("place", "")
            print(f"Поиск по месту: {code}")

            # Инициализируем переменную `filtered_products`
           

            if code:
                # Ищем товары по месту хранения
                filtered_products = ProductList.objects.filter(place=code)
                print(f"Найденные товары: {filtered_products}")

            # Проверяем, нашлись ли товары
            if not filtered_products.exists():
                return Response({"message": "Товары не найдены"}, status=status.HTTP_404_NOT_FOUND)

            # Сериализация данных для ответа
            serializer = ProductListSerializer(filtered_products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {str(e)}")  # Логируем ошибку
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NewDataViews(APIView):
    def get(self, request):
        try:
            number = request.query_params.get('ship_number')
            print(f"получен номер: {number}")
            if not number:
                return Response({"error": "Параметр ship_number обязателен"}, status=status.HTTP_400_BAD_REQUEST)

            dataNumber = number[1:]  # Убираем первую букву номера
            print(f"получен номер: {dataNumber}")
            # Определяем, с каким типом данных работаем
            if number.startswith("p"):
                gettranz = TranzitData.objects.filter(tranz_number=number)
                getFinal = ShipList.objects.filter(ship_number=number)
                print(f"фильтрованный массив : {gettranz}")
                # Удаляем старые записи
                getFinal.delete()
                id=str(uuid.uuid4())   
                # Копируем данные из TranzitData в ShipList
                new_entries = [
                    ShipList(
                        unique_id_ship=id,
                        type="Перемещение",
                        ship_number=number,
                        ship_date=data.tranz_date,
                        counterparty=data.to_house,
                        warehouse=data.from_house,
                        progress="Обновленный",
                        article=data.article,
                        name=data.name,
                        barcode=data.barcode,
                        quantity=data.quantity
                    ) for data in gettranz
                ]
                print(f"записываем данные : {new_entries}")

            elif number.startswith("s"):
                gettranz = ShipData.objects.filter(ship_number=number)
                getFinal = ShipList.objects.filter(ship_number=number)

                # Удаляем старые записи
                getFinal.delete()
                id=str(uuid.uuid4()) 
                # Копируем данные из ShipData в ShipList
                new_entries = [
                    ShipList(
                        unique_id_ship=id,
                        type="Реализация",
                        ship_number=number,
                        ship_date=data.ship_date,
                        counterparty=data.counterparty,
                        warehouse=data.warehouse,
                        progress="Обновленный",
                        article=data.article,
                        name=data.name,
                        barcode=data.barcode,
                        quantity=data.quantity
                    ) for data in gettranz
                ]
            else:
                return Response({"error": "Неверный формат номера"}, status=status.HTTP_400_BAD_REQUEST)

            # Записываем новые данные в базу
            ShipList.objects.bulk_create(new_entries)

            # Возвращаем обновленные данные
            updated_data = ShipList.objects.filter(ship_number=number)
            serializer = ShipListSerializer(updated_data, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Ошибка на сервере: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# частичная отмена товара
class ChangeReserveStatus(APIView):
    def post(self, request):
        try:
            reserve_id = request.data.get("reserve_id")
            new_status = request.data.get("new_status")
            quantity_to_cancel = int(request.data.get("quantity_to_cancel", 0))

            if not reserve_id or not new_status or quantity_to_cancel <= 0:
                return Response({"error": "reserve_id, new_status и количество обязательны"}, status=status.HTTP_400_BAD_REQUEST)

            # Найти запись в ReservList
            reserved_item = ReservList.objects.filter(unique_id=reserve_id).first()

            if not reserved_item:
                return Response({"error": "Запись не найдена"}, status=status.HTTP_404_NOT_FOUND)

            if reserved_item.quantity < quantity_to_cancel:
                return Response({"error": "Недостаточное количество для отмены"}, status=status.HTTP_400_BAD_REQUEST)

            # Создаем запись в нужном списке
            if new_status in ["Брак", "Недостача"]:
                ArchiveProduct.objects.create(
                    unique_id=reserved_item.unique_id,
                    add_date=reserved_item.add_date,
                    article=reserved_item.article,
                    name=reserved_item.name,
                    barcode=reserved_item.barcode,
                    quantity=quantity_to_cancel,
                    place=reserved_item.place,
                    goods_status=new_status,
                    close_product_date=datetime.now()
                
                )
            elif new_status == "Хранение":
                existing_products = ProductList.objects.filter(article=reserved_item.article, place=reserved_item.place, add_date=reserved_item.add_date)

                if existing_products.exists():
                    # Если записи есть, обновляем первую найденную (можно улучшить логику)
                    product = existing_products.first()
                    product.quantity += quantity_to_cancel
                    product.save()
                else:
                    # Если записи нет, создаем новую
                    ProductList.objects.create(
                        unique_id=reserved_item.unique_id,  # Добавляем, если уникальность важна
                        add_date=reserved_item.add_date,
                        article=reserved_item.article,
                        name=reserved_item.name,
                        barcode=reserved_item.barcode,
                        quantity=quantity_to_cancel,
                        place=reserved_item.place,
                        goods_status=new_status,
                    )

            # Если после списания остается товар — обновляем количество, иначе удаляем запись
            if reserved_item.quantity > quantity_to_cancel:
                reserved_item.quantity -= quantity_to_cancel
                reserved_item.save()
            else:
                reserved_item.delete()

            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка: {str(e)}")
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ChangeStatusAndPlace(APIView):
    def post(self, request):
        try:
            ship_id = request.data.get("ship_id")
            stock = request.data.get("stock", [])  # Список уникальных ID товаров  

            # Получаем все записи с этим ship_id
            ship_items = ReservList.objects.filter(unique_id_ship=ship_id)

            # Проходим по stock и обновляем записи, если они есть в ship_items
            updated_count = 0
            for item_id in stock:
                item = ship_items.filter(unique_id=item_id).first()  # Проверяем, есть ли товар  
                if item:
                    item.place = "Сборка"
                    item.goods_status = "Собран"
                    item.progress = "Собран"
                    item.save()
                    updated_count += 1  # Подсчитываем количество обновлённых записей  

            if updated_count > 0:
                return Response({"message": "Данные обновлены", "updated": updated_count}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Нет подходящих товаров"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoveProducts(APIView):
    def post(self, request):
        try:
            move_id = request.data.get("moveNumber")
            stock = request.data.get("stock", [])  # Список уникальных ID товаров  

            for item in stock:
                # Удаляем товар из списка резервов
                ReservList.objects.filter(unique_id=item["unique_id"]).delete()

                # Перемещаем в MoveList
                MoveList.objects.create(
                    moveNumber=move_id,
                    unique_id=item["unique_id"],
                    add_date=item["add_date"],
                    article=item["article"],
                    name=item["name"],
                    barcode=item["barcode"],
                    place=item["place"],
                    quantity=item["quantity"],
                    goods_status="В работе",
                    newPlace="",
                )
            return Response({"message": "Товары перемещены"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            moveData = MoveList.objects.all()
            serializer = MoveListSerializer(moveData, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class MoviFinalData(APIView):
    def post(self, request):
        try:
            barcode = request.data.get("barcode")
            quantity = int(request.data.get("colChange"))  # Количество для перемещения
            updatedNewPlace = request.data.get("newPlace")  # Новое место хранения

            if not barcode or quantity <= 0:
                return Response({"error": "Неверные данные"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                move_items = MoveList.objects.filter(barcode=barcode)  # Берем записи в порядке добавления
                remaining_quantity = quantity

                for item in move_items:
                    if remaining_quantity <= 0:
                        break  # Если уже всё перенесли, выходим

                    if item.quantity > remaining_quantity:
                        # Если текущая запись содержит больше, чем нужно переместить
                        ProductList.objects.create(
                            unique_id=uuid.uuid4(),
                            add_date=item.add_date,
                            article=item.article,
                            name=item.name,
                            barcode=item.barcode,
                            place=updatedNewPlace,  # Новое место хранения
                            quantity=remaining_quantity,
                            goods_status='Хранение',
                        )
                        item.quantity -= remaining_quantity  # Уменьшаем количество в MoveList
                        item.save()
                        remaining_quantity = 0
                    else:
                        # Если количество в item меньше или равно запрошенному
                        ProductList.objects.create(
                            unique_id=item.unique_id,
                            add_date=item.add_date,
                            article=item.article,
                            name=item.name,
                            barcode=item.barcode,
                            place=updatedNewPlace,  # Новое место хранения
                            quantity=remaining_quantity,
                            goods_status='Хранение',
                        )
                        remaining_quantity -= item.quantity  # Вычитаем перемещенное количество
                        item.delete()  # Полностью перемещенная позиция удаляется из MoveList

                if remaining_quantity > 0:
                    return Response({"error": "Недостаточно товара для перемещения"}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"success": "Товары перемещены"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReserfIndo(APIView):
    def get(self, request):
        try:
            uid_ship = request.query_params.get("uid_ship")
            print(f"получили данные : {uid_ship}")   
            if not uid_ship:
                return Response(
                    {"error": "Параметр uid_ship обязателен"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Получаем все записи из базы данных для указанного uid_ship
            reserv = ReservList.objects.filter(ship_number=uid_ship).order_by('place')

            if not reserv.exists():
                return Response(
                    {"error": f"Отгрузка с uid_ship={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = ReservListSerializer(reserv, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка в get: {str(e)}")
            return Response(
                {"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )