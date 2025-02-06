from .newserializers import (
    TranzitDataSerializer, ShipDataSerializer, AddDataSerializer,
    ShipListSerializer, AddListSerializer, ProductListSerializer,
    ReservListSerializer, PlaceProductSerializer, ArchiveShipSerializer,
    ArchiveAddSerializer, ArchiveProductSerializer
)
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .newmodels import (
    TranzitData, ShipData, AddData, ShipList, AddList, ProductList,
    ReservList, PlaceProduct, ArchiveShip, ArchiveAdd, ArchiveProduct
)
import uuid
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Вы авторизованы!", "user": request.user.username})


#Входные данные Запись перемещений в таблицы и логика распределения на другие ShipList и AddList
class TranzitDataViewSet(viewsets.ModelViewSet):
    queryset = TranzitData.objects.all()
    serializer_class = TranzitDataSerializer

    def create(self, request, *args, **kwargs):
        # Полностью очищаем таблицу
        TranzitData.objects.all().delete()

        # Получение данных из запроса
        unique_id = uuid.uuid4()
        tranz_number = "p" + request.data.get("tranz_number", "")
        tranz_date = request.data.get("tranz_date")
        from_house = request.data.get("from_house", "")
        to_house = request.data.get("to_house", "")
        position_data = request.data.get("positionData", [])

        tranz_date = datetime.strptime(tranz_date, "%d.%m.%Y").date()

        # Массовое добавление данных в TranzitData
        tranzit_records = [
            TranzitData(
                tranz_number=tranz_number,
                tranz_date=tranz_date,
                from_house=from_house,
                to_house=to_house,
                article=position.get("article", ""),
                name=position.get("name", ""),
                barcode=position.get("barcode", ""),
                quantity=position.get("quantity", 0),
            )
            for position in position_data
        ]
        TranzitData.objects.bulk_create(tranzit_records)

        # Проверка условий и массовое добавление в ShipList и AddList
        ship_records = []
        add_list_records = []

        if from_house == "Центральный новый" and not ShipList.objects.filter(ship_number=tranz_number).exists():
            ship_records = [
                ShipList(
                    unique_id_ship = unique_id,
                    type="Перемещение",
                    ship_number=tranz_number,
                    ship_date=tranz_date,
                    counterparty=to_house,
                    warehouse=from_house,
                    progress="Новый",
                    article=position["article"],
                    name=position["name"],
                    barcode=position["barcode"],
                    quantity=position["quantity"],
                )
                for position in position_data
            ]

        if to_house == "Центральный новый" and not AddList.objects.filter(add_number=tranz_number).exists():
            add_list_records = [
                AddList(
                    unique_id_add=unique_id,
                    type="Приемка",
                    add_number=tranz_number,
                    add_date=tranz_date,
                    counterparty=from_house if from_house != "Центральный новый" else to_house,
                    warehouse=to_house if to_house == "Центральный новый" else from_house,
                    progress="Новый",
                    article=position.get("article", ""),
                    name=position.get("name", ""),
                    barcode=position.get("barcode", ""),
                    quantity=position.get("quantity", 0),
                    error_barcode=False,
                    newbarcode="",
                    final_quantity=0,
                    goods_status="Приемка",
                )
                for position in position_data
            ]

        # Массовое сохранение
        if ship_records:
            ShipList.objects.bulk_create(ship_records)

        if add_list_records:
            AddList.objects.bulk_create(add_list_records)

        return Response({"message": "Данные успешно сохранены"}, status=status.HTTP_201_CREATED)
    
#Входные данные Запись отгрузок с типом склад равно Центральный Новый 
class ShipDataViewSet(viewsets.ModelViewSet):
    queryset = ShipData.objects.all()
    serializer_class = ShipDataSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        # 1. Очистка ShipData перед записью новых данных
        ShipData.objects.all().delete()

        unique_id = uuid.uuid4()
        ship_number = "s" + data.get("ship_number")
        ship_date = data.get("ship_date")
        counterparty = data.get("counterparty")
        warehouse = data.get("warehouse")
        position_data = data.get("positionData", [])

        ship_date = datetime.strptime(ship_date, "%d.%m.%Y").date()

        # 2. Запись всех данных в ShipData
        ship_data_instances = [
            ShipData(
                ship_number=ship_number,
                ship_date=ship_date,
                counterparty=counterparty,
                warehouse=warehouse,
                article=item["article"],
                name=item["name"],
                barcode=item["barcode"],
                quantity=item["quantity"]
            ) 
            for item in position_data
        ]
        ShipData.objects.bulk_create(ship_data_instances)  # Оптимизация записи в базу

        # 3. Проверка, есть ли такой ship_number в ShipList
        exists = ShipList.objects.filter(ship_number=ship_number).exists()

        # 4. Добавляем в ShipList только если warehouse == "Центральный новый"
        if not exists and warehouse == "Центральный новый":
            ship_list_instances = [
                ShipList(
                    unique_id_ship=unique_id,
                    type="реализация",
                    ship_number=ship_number,
                    ship_date=ship_date,
                    counterparty=counterparty,
                    warehouse=warehouse,
                    progress="Новый",
                    article=item["article"],
                    name=item["name"],
                    barcode=item["barcode"],
                    quantity=item["quantity"]
                ) 
                for item in position_data
            ]
            ShipList.objects.bulk_create(ship_list_instances)  # Оптимизированная запись

        return Response({"message": "Данные обработаны успешно"}, status=status.HTTP_201_CREATED)
    
# Входные данные Запись оприходования с типом склад равно Центральный новый
class AddDataViewSet(viewsets.ModelViewSet):
    queryset = AddData.objects.all()
    serializer_class = AddDataSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Очистка AddData перед записью новых данных
        AddData.objects.all().delete()

        # Генерация уникального ID
        unique_id = uuid.uuid4()
        add_number = "o" + data.get("add_number")
        add_date = data.get("add_date")
        counterparty = data.get("counterparty")
        warehouse = data.get("warehouse")
        position_data = data.get("positionData", [])
        
        # 2. Переводим строку с датой в формат DateField
        add_date = datetime.strptime(add_date, "%d.%m.%Y").date()

        # 3. Запись всех данных в AddData
        add_data_instances = [
            AddData(
                add_number=add_number,
                add_date=add_date,
                counterparty=counterparty,
                warehouse=warehouse,
                article=item["article"],
                name=item["name"],
                barcode=item["barcode"],
                quantity=item["quantity"]
            ) 
            for item in position_data
        ]
        AddData.objects.bulk_create(add_data_instances)  # Оптимизация записи в базу

        # 4. Проверка, есть ли такой add_number в AddList
        exists = AddList.objects.filter(add_number=add_number).exists()

        # 5. Добавляем в AddList только если warehouse == "Центральный новый"
        if not exists and warehouse == "Центральный новый":
            add_list_instances = [
                AddList(
                    unique_id_add=unique_id,
                    type="оприходование",  # Можно адаптировать в зависимости от типа
                    add_number=add_number,
                    add_date=add_date,
                    counterparty=counterparty,
                    warehouse=warehouse,
                    progress="Новый",  # Статус
                    article=item["article"],
                    name=item["name"],
                    barcode=item["barcode"],
                    quantity=item["quantity"],
                    error_barcode=False,  # Можно адаптировать
                    newbarcode="",  # Пример
                    final_quantity=0,  # Пример
                    goods_status="Приёмка"  # Статус товара
                ) 
                for item in position_data
            ]
            AddList.objects.bulk_create(add_list_instances)  # Оптимизированная запись

        return Response({"message": "Данные обработаны успешно"}, status=status.HTTP_201_CREATED)
    
# Обработчик для получения всех отгрузок
class ShipmentListView(APIView):

    def get(self, request):
        try:
            shipments = ShipList.objects.all()  # Читаем данные из базы данных
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
            shipment = ShipList.objects.filter(unique_id_ship=uid_ship).first()

            if not shipment:
                return Response(
                    {"error": f"Отгрузка с unique_id_ship={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Обновляем поле progress
            shipment.progress = progress
            shipment.save()  # Сохраняем изменения в базе данных

            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Ошибка на сервере: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

            if not isinstance(new_products, list):
                return Response({"error": "Ожидается список объектов"}, status=status.HTTP_400_BAD_REQUEST)

            for product in new_products:
                unique_id = uuid.uuid4()
                unique_id_add = product.get("unique_id_add", "")    
                # Создаем объект PlaceProduct
                place_product = PlaceProduct.objects.create(
                    unique_id=unique_id,
                    unique_id_add=unique_id_add,  # Пример, нужно использовать ваш uid_add
                    type=product.get("type", ""),
                    add_number=product.get("add_number", ""),
                    add_date=product.get("add_date"),
                    article=product.get("article"),
                    name=product.get("name"),
                    barcode=product.get("barcode"),
                    place=product.get("place"),
                    quantity=product.get("quantity"),
                    goods_status=product.get("goods_status")
                )
            
                        # Создаем сериализатор с данными
                serializer = PlaceProductSerializer(data=place_product)

                if serializer.is_valid():
                    serializer.save()  # Сохраняем данные в базе
                else:
                    return Response({"error": "Неверные данные", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "Данные успешно добавлены"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

# Обработчик для получения всех добавленных продуктов 
class AddProductListView(APIView):
    def get(self, request):
        try:
            uid_add = request.query_params.get("uid_add")
            print(f"Поиск товара add_number={uid_add}")  # Логирование

            # Фильтрация по add_number (uid_add)
            if uid_add:
                products = AddList.objects.filter(add_number=uid_add)
                if not products:
                    return Response({"error": "Товар не найден"}, status=status.HTTP_404_NOT_FOUND)

                serializer = AddListSerializer(products, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            # Если uid_add не передан, возвращаем все товары
            products = AddList.objects.all()
            serializer = AddListSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {e}")  # Логирование ошибки
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            addproduct_data = request.data
            uid_add = addproduct_data.get('uid_add')
            position_data = addproduct_data.get('positionData')
            new_progress = addproduct_data.get('progress')

            # Находим продукт по add_number (uid_add)
            product = AddList.objects.filter(add_number=uid_add).first()

            if product:
                print("Position data:", position_data)
                # Обновляем данные для найденных позиций
                for new_position in position_data:
                    article = new_position.get("article")
                    if product.article == article:
                        # Обновляем данные
                        product.error_barcode = new_position.get("error_barcode", product.error_barcode)
                        product.newbarcode = new_position.get("newbarcode", product.newbarcode)
                        product.final_quantity = new_position.get("final_quantity", 0)

                if new_progress:
                    product.progress = new_progress

                # Сохраняем обновленные данные в базе
                product.save()
                return Response({"status": "success"}, status=status.HTTP_201_CREATED)

            else:
                return Response({"error": "Product with this add_number not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

# Обработчик для работы с резервом на отгрузку Не увидел больших проблем 
class ReserveAllView(APIView):
    def post(self, request):
        stocks = request.data.get('stocks', [])
        uid_ship = request.data.get('uid_ship', 'RESERVED')  # Получаем номер отгрузки
        print(f"Поиск по отгрузке с номером: {uid_ship}")
        total_reserved = 0
        reserved_items = []

        try:
            for stock in stocks:
                article = stock.get('article')
                quantity = stock.get('quantity')

                # Логика резервирования для каждого товара
                reserved_quantity, reserved_places = self.reserve_product(article, quantity, uid_ship)
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
            print(f"Ошибка в reserve_product: {str(e)}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            uid_ship = request.query_params.get('uid_ship')

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
            return Response(
                {"error": "Ошибка на сервере"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    def reserve_product(self, article, quantity, uid_ship):
        try:
            # Получаем товары для резервирования
            products = ProductList.objects.filter(article=article, goods_status__in=["Хранение"])

            reserved_quantity = 0
            reserved_places = []

            for product in products:
                print(f"Товар: {product.article}, статус: {product.goods_status}")

                available_quantity = product.quantity
                remaining_needed = quantity - reserved_quantity

                if available_quantity >= remaining_needed:
                    # Резервируем нужное количество
                    reserved_quantity += remaining_needed

                    # Создаем запись для reserv_list в базе данных
                    reserved_product = ReservList(
                        unique_id_ship=uid_ship,
                        reserve_data=datetime.now().date(),
                        unique_id=uuid.uuid4(),
                        article=product.article,
                        name=product.name,
                        barcode=product.barcode,
                        quantity=remaining_needed,
                        place=product.place,
                        goods_status="В отгрузке",
                        add_date=datetime.now().date()
                    )
                    reserved_product.save()

                    # Обновляем количество товара
                    product.quantity -= remaining_needed
                    product.goods_status = "В отгрузке"
                    product.save()

                    break  # Завершаем, т.к. резерв выполнен
                else:
                    # Если товара не хватает, резервируем всё, что есть
                    reserved_quantity += available_quantity

                    # Создаем запись для reserv_list
                    reserved_product = ReservList(
                        unique_id_ship=uid_ship,
                        reserve_data=datetime.now().date(),
                        unique_id=product.unique_id,
                        article=product.article,
                        name=product.name,
                        barcode=product.barcode,
                        quantity=available_quantity,
                        place=product.place,
                        goods_status="В отгрузке",
                        add_date=datetime.now().date()
                    )
                    reserved_product.save()

                    # Обнуляем количество товара
                    product.quantity = 0
                    product.goods_status = "В отгрузке"
                    product.save()

            return reserved_quantity, reserved_places

        except Exception as e:
            print(f"Ошибка в reserve_product: {str(e)}")
            raise  

# Обработчик для Отмены резерва тоже больных проблем не увидел 
class CancelReservation(APIView):
    def post(self, request):
        try:
            reserve_ids = request.data.get('reserve_ids', [])
            cancel_quantities = request.data.get('cancel_quantities', {})  # Словарь {unique_id: количество для отмены}
            new_goods_status = request.data.get('goods_status', 'Хранение')

            print(f"полученные данные : {reserve_ids}")
            print(f"статус данных : {new_goods_status}")

            canceled_items = []  # Список отмененных товаров
            updated_reserv = []  # Обновленные записи резервирования

            reserv = ReservList.objects.filter(unique_id__in=reserve_ids)
            products = ProductList.objects.all()  # Получаем все товары
            archive = ArchiveProduct.objects.all()  # Получаем все архивные товары

            for item in reserv:
                if item.unique_id in reserve_ids:
                    # Определяем, сколько нужно отменить
                    cancel_quantity = cancel_quantities.get(str(item.unique_id), item.quantity)
                    print(f"сопределение : {cancel_quantity}")

                    # Логика для статусов "Брак" и "Недостача"
                    if item.goods_status in ['Брак', 'Недостача']:
                        # Если отменяем часть товара
                        if cancel_quantity < item.quantity:
                            # Создаем запись для отмененной части товара с новым уникальным ID
                            canceled_item = ArchiveProduct(
                                unique_id=uuid.uuid4(),
                                article=item.article,
                                name=item.name,
                                quantity=cancel_quantity,
                                place=item.place,
                                goods_status=new_goods_status,  # Статус для возвращаемого товара
                                barcode=item.barcode,
                                close_product_date=item.add_date
                            )
                            canceled_item.save()

                            # Обновление резервированной записи
                            item.quantity -= cancel_quantity
                            item.goods_status = "Хранение"
                            item.save()
                        else:
                            # Если отменяем весь товар
                            canceled_items.append(item)
                            # Добавляем весь товар в архив
                            archived_product = ArchiveProduct(
                                unique_id=item.unique_id,
                                article=item.article,
                                name=item.name,
                                quantity=item.quantity,
                                place=item.place,
                                goods_status=new_goods_status,
                                barcode=item.barcode,
                                close_product_date=item.add_date
                            )
                            archived_product.save()
                            item.delete()

                    elif item.goods_status == 'Хранение':  
                        # Если отменяем часть товара
                        if cancel_quantity < item.quantity:
                            # Создаем запись для отмененной части товара с новым уникальным ID
                            canceled_item = ProductList(
                                unique_id=uuid.uuid4(),
                                article=item.article,
                                name=item.name,
                                quantity=cancel_quantity,
                                place=item.place,
                                goods_status=new_goods_status,  # Статус для возвращаемого товара
                                barcode=item.barcode,
                                add_date=item.add_date
                            )
                            canceled_item.save()

                            # Обновление резервированной записи
                            item.quantity -= cancel_quantity
                            item.goods_status = "Хранение"
                            item.save()
                        else:
                            # Если отменяем весь товар
                            canceled_items.append(item)
                            # Добавляем товар в products
                            product_entry = ProductList(
                                unique_id=item.unique_id,
                                article=item.article,
                                name=item.name,
                                quantity=item.quantity,
                                place=item.place,
                                goods_status=new_goods_status,
                                barcode=item.barcode,
                                add_date=item.add_date
                            )
                            product_entry.save()
                            item.delete()

            return Response(
                {"status": "success", "canceled_count": len(canceled_items), "canceled_items": canceled_items},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(f"Ошибка: {str(e)}")  # Добавьте вывод ошибки для отладки
            return Response(
                {"error": "Ошибка на сервере"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
#Обработчик для переноса в архив отгрузок Надо проверить 
class ArchiveShipView(APIView):
    def post(self, request):
        # Получаем данные из запроса (массив объектов)
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected an array of objects"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Создаем набор uid_ship для быстрой проверки
            uid_ships_to_remove = {item.get('uid_ship') for item in data if item.get('uid_ship')}

            # Удаляем записи из базы данных для соответствующих uid_ship
            ArchiveShip.objects.filter(unique_id_ship__in=uid_ships_to_remove).delete()

            # Проходим по каждому элементу данных
            for item in data:
                uid_ship = item.get('uid_ship')
                if not uid_ship:
                    continue  # Пропускаем элемент, если нет uid_ship
                type = item.get('type')
                ship_number = item.get('shipment_number')
                ship_date = item.get('shipment_date')
                progress = item.get('progress')
                unique_id = item.get('unique_id')
                article = item.get('article')
                name = item.get('name')
                quantity = item.get('quantity')
                place = item.get('place')
                goods_status = item.get('goods_status')
                barcode = item.get('barcode')
                counterparty=item.get('counterparty')  # Предположим, что goods_status соответствует counterparty
                warehouse=item.get('warehouse')
                reserve_data=item.get('reserve_data')

                # Создаем новый объект ArchiveShip для архивации
                ArchiveShip.objects.create(
                    type=type,
                    ship_number=ship_number,
                    ship_date=ship_date,
                    counterparty=counterparty,  # Предположим, что goods_status соответствует counterparty
                    warehouse=warehouse,     # Аналогично warehouse
                    progress=progress,
                    reserve_data=reserve_data,
                    unique_id=unique_id,  # Новый уникальный ID
                    article=article,
                    name=name,
                    barcode=barcode,
                    quantity=quantity,
                    place=place,
                    final_ship_date=datetime.now().date(),  # Установим текущую дату как дату отгрузки
                )

            return Response({"message": "Ships archived successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Обрабатываем ошибки
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#обработчик для переноса в архив поставок НО проверить
class ArchiveAddView(APIView):
    def post(self, request):
        data = request.data
        print(f"Полученные данные: {data}")
        if not isinstance(data, list):
            return Response({"error": "Expected an array of objects"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Создаем набор uid_add для быстрой проверки
            uid_add_to_remove = {item.get('uid_add') for item in data if item.get('uid_add')}
            print(f"Проверки: {uid_add_to_remove}")

            # Удаляем записи, если uid_add совпадает
            ArchiveAdd.objects.filter(unique_id_add__in=uid_add_to_remove).delete()

            # Добавляем новые записи в архив
            for item in data:
                uid_add = item.get('uid_add')
                if not uid_add:
                    continue  # Пропускаем элемент, если нет uid_add
                type = item.get('type')
                add_number = item.get('add_number')
                add_date = item.get('add_date')
                progress = item.get('progress')
                unique_id = item.get('unique_id')
                article = item.get('article')
                name = item.get('name')
                quantity = item.get('quantity')
                place = item.get('place')
                goods_status = item.get('goods_status')
                barcode = item.get('barcode')
                quantity_start = item.get('quantity_start')

                # Создаем запись в базе данных
                ArchiveAdd.objects.create(
                    type=type,
                    add_number=add_number,
                    add_date=add_date,
                    unique_id=unique_id,
                    article=article,
                    name=name,
                    barcode=barcode,
                    place=place,
                    quantity_start=quantity_start,
                    quanity_place=quantity,  # или любое другое значение для финального количества
                    goods_status=goods_status,
                    close_add_date=datetime.now().date()  # Используем текущую дату
                )

            return Response({"message": "Ships archived successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Обрабатываем ошибки
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)