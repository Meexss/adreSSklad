from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .data_models import Shipment, AddProduct, Product
from .serializers import PlaceProductsSerializer, ShipmentSerializer, AddProductSerializer, ProductSerializer, ReservSerializer
import uuid
from .utils import read_json, write_json
from datetime import datetime
from datetime import datetime
import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Вы авторизованы!", "user": request.user.username})


class ArchiveAdd(APIView):
    def post(self, request):
        # Получаем данные из запроса (массив объектов)
        data = request.data
        print(f"Полученые: {data}")
        if not isinstance(data, list):
            return Response({"error": "Expected an array of objects"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Читаем текущие данные из JSON файлов
            add = read_json('addproduct.json')
            place = read_json('placeProducts.json')
            archive = read_json('archiveAdd.json')

            # Создаем набор uid_ship для быстрой проверки
            uid_add_to_remove = {item.get('uid_add') for item in data if item.get('uid_add')}

            print(f"проверки: {uid_add_to_remove}")
            # Удаляем записи из shipments и reserv
            add = [ship for ship in add if ship.get('uid_add') not in uid_add_to_remove]
            place = [res for res in place if res.get('uid_add') not in uid_add_to_remove]

            print(f"проверки add: {add}")
            print(f"проверки place: {place}")

            for item in data:
                uid_add = item.get('uid_add')
                if not uid_add:
                    continue  # Пропускаем элемент, если нет uid_add
                type = item.get('type')
                add_number = item.get('add_number')
                progress = item.get('progress')
                unique_id = item.get('unique_id')
                article = item.get('article')
                name = item.get('name')
                quantity = item.get('quantity')
                place = item.get('place')
                goods_status = item.get('goods_status')
                barcode = item.get('barcode')


                # Формируем новый продукт для архивации
                add_product = {
                    "type": type,
                    "uid_add": uid_add,
                    "add_number": add_number,
                    "final_data": datetime.now().strftime("%Y-%m-%d"),  # Текущая дата
                    "progress": progress,
                    "unique_id": unique_id, 
                    "article": article,
                    "name": name,
                    "quantity": quantity,
                    "place": place,
                    "goods_status": goods_status,
                    "barcode": barcode
                }
                
                print(f"Данные из reserv.json: {add_product}")
                # Добавляем в архив
                archive.append(add_product)

            # Записываем обновленные данные обратно в файлы JSON
            write_json('addproduct.json', add)
            write_json('place.json', place)
            write_json('archiveAdd.json', archive)

            return Response({"message": "Ships archived successfully"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Обрабатываем ошибки чтения/записи файлов
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# есть код SQLite
class ArchiveShip(APIView):
    def post(self, request):
        # Получаем данные из запроса (массив объектов)
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected an array of objects"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Читаем текущие данные из JSON файлов
            shipments = read_json('shipments.json')
            reserv = read_json('reserv.json')
            archive = read_json('archiveShip.json')

            # Создаем набор uid_ship для быстрой проверки
            uid_ships_to_remove = {item.get('uid_ship') for item in data if item.get('uid_ship')}

            # Удаляем записи из shipments и reserv
            shipments = [ship for ship in shipments if ship.get('uid_ship') not in uid_ships_to_remove]
            reserv = [res for res in reserv if res.get('uid_ship') not in uid_ships_to_remove]

            for item in data:
                uid_ship = item.get('uid_ship')
                if not uid_ship:
                    continue  # Пропускаем элемент, если нет uid_ship
                type = item.get('type')
                shipment_number = item.get('shipment_number')
                shipment_date = item.get('shipment_date')
                progress = item.get('progress')
                unique_id = item.get('unique_id')
                article = item.get('article')
                name = item.get('name')
                quantity = item.get('quantity')
                place = item.get('place')
                goods_status = item.get('goods_status')
                barcode = item.get('barcode')

                # Формируем новый продукт для архивации
                ship_product = {
                    "type": type,
                    "shipment_number": shipment_number,
                    "shipment_date": shipment_date,
                    "uid_ship": uid_ship,
                    "ship_data": datetime.now().strftime("%Y-%m-%d"),  # Текущая дата
                    "progress": progress,
                    "unique_id": unique_id,  # Новый уникальный ID
                    "article": article,
                    "name": name,
                    "quantity": quantity,
                    "place": place,
                    "goods_status": goods_status,
                    "barcode": barcode
                }

                # Добавляем в архив
                archive.append(ship_product)

            # Записываем обновленные данные обратно в файлы JSON
            write_json('shipments.json', shipments)
            write_json('reserv.json', reserv)
            write_json('archiveShip.json', archive)

            return Response({"message": "Ships archived successfully"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Обрабатываем ошибки чтения/записи файлов
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
# есть код SQLite
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
            uid_ship = request.data.get('uid_ship')
            progress = request.data.get('progress')

            if not uid_ship or not progress:
                return Response(
                    {"error": "Параметры uid_ship и progress обязательны"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Читаем текущие данные из shipment.json
            shipments = read_json('shipments.json')

            # Ищем нужную запись по shipment_number
            shipment_found = False
            for shipment in shipments:
                if shipment.get('uid_ship') == uid_ship:
                    shipment['progress'] = progress  # Обновляем поле progress
                    shipment_found = True
                    break

            if not shipment_found:
                return Response(
                    {"error": f"Отгрузка с shipment_number={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Сохраняем обновленные данные обратно в shipment.json
            write_json('shipments.json', shipments)

            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Ошибка на сервере: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# есть код SQLite
# Обработчик для получения всех добавленных продуктов
class AddProductListView(APIView):
    def get(self, request):
        try:
            uid_add = request.query_params.get("uid_add")
            print(f"Поиск товара article={uid_add}")  # Логирование

            # Читаем данные из JSON
            all_products = read_json("addproduct.json")

            # Фильтрация по add_number
            if uid_add:
                filtered_products = [p for p in all_products if str(p.get("uid_add")) == str(uid_add)]
                
                if not filtered_products:  # Если список пустой, отправляем 404
                    return Response({"error": "Товар не найден"}, status=status.HTTP_404_NOT_FOUND)

                print(f"Найденные товары: {filtered_products}")  # Логирование
                return Response(filtered_products, status=status.HTTP_200_OK)

            return Response(all_products, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Ошибка сервера: {e}")  # Логирование ошибки
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            addproduct_data = request.data
            uid_add = addproduct_data.get('uid_add')
            position_data = addproduct_data.get('positionData')
            new_progress = addproduct_data.get('progress')

            # Читаем данные из addproduct.json
            all_products = read_json("addproduct.json")

            # Находим продукт с нужным add_number
            product = next((p for p in all_products if str(p.get("uid_add")) == str(uid_add)), None)

            if product:
                print("Position data:", position_data)
                # Обновляем данные для найденных позиций
                for new_position in position_data:
                    article = new_position.get("article")
                    for position in product.get("positionData", []):
                        if position.get("article") == article:
                            # Обновляем error_barcode, newbarcode и final_quantity
                            position["error_barcode"] = new_position.get("error_barcode", position["error_barcode"])
                            position["newbarcode"] = new_position.get("newbarcode", position["newbarcode"])
                            position["final_quantity"] = new_position.get("final_quantity", 0)
                            
                if new_progress:
                    product["progress"] = new_progress            

                # Сохраняем обновленные данные в JSON
                write_json("addproduct.json", all_products)
                return Response({"status": "success"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Product with this add_number not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": "Ошибка на сервере", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# есть код SQLite
# Обработчик для работы с продуктами
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

            # Загружаем данные из JSON
            products = read_json("products.json")

            # Фильтруем товары по месту и штрихкоду
            matching_products = [p for p in products if p["place"] == place and p["barcode"] == barcode]

            if not matching_products:
                return Response({"error": "Товар не найден в указанной ячейке"}, status=status.HTTP_404_NOT_FOUND)

            remaining_qty = colChange  # Количество, которое нужно переместить

            for product in matching_products:
                if remaining_qty <= 0:
                    break  # Если уже перенесли всё нужное количество — выходим

                if product["quantity"] <= remaining_qty:
                    # Если количество полностью переносится — просто меняем `place`
                    product["place"] = newPlace
                    remaining_qty -= product["quantity"]
                else:
                    # Если часть остается, делаем "разделение" записи
                    new_product = {
                        "unique_id": str(uuid.uuid4()),  # Новый уникальный ID
                        "article": product["article"],
                        "name": product["name"],
                        "barcode": product["barcode"],
                        "place": newPlace,  # Меняем место
                        "quantity": remaining_qty,  # Только часть переносим
                        "goods_status": product["goods_status"],
                    }
                    products.append(new_product)

                    # Уменьшаем количество в старой позиции
                    product["quantity"] -= remaining_qty
                    remaining_qty = 0

            # Записываем обновленные данные обратно в JSON
            write_json("products.json", products)

            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        try:
            print("Получен запрос на список товаров")

            products = Product.get_all()
            if not products:
                print("Список товаров пуст")
                return Response({"error": "Товары не найдены"}, status=status.HTTP_404_NOT_FOUND)

            # Сортировка
            sort_by = request.query_params.get('sort', 'article')
            reverse = request.query_params.get('order', 'asc') == 'desc'

            try:
                products.sort(key=lambda x: getattr(x, sort_by, ''), reverse=reverse)
                print(f"Сортировка по {sort_by}, порядок {'убывающий' if reverse else 'возрастающий'}")
            except AttributeError as e:
                print(f"Ошибка при сортировке: {e}")
                return Response({"error": f"Некорректное поле сортировки: {sort_by}"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = ProductSerializer(products, many=True)
            print("Данные успешно отправлены")
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Ошибка сервера: {e}")
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# есть код SQLite
# Обработчик для работы с резервом на отгрузку
class ReserveAllView(APIView):
    def post(self, request):
        stocks = request.data.get('stocks', [])
        uid_ship = request.data.get('uid_ship', 'RESERVED')  # Получаем номер отгрузки
        print(f"Поиск по отгрузке с номером: {uid_ship}")
        print(f"Поиск по отгрузке с номером: {stocks}")
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

            # Проверка наличия shipment_number в запросе
            if not uid_ship:
                return Response(
                    {"error": "Параметр uid_ship обязателен"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reserv = read_json('reserv.json')
            filtered_reserv = [item for item in reserv if item['uid_ship'] == uid_ship]

            # Проверка наличия данных по shipment_number
            if not filtered_reserv:
                return Response(
                    {"error": f"Отгрузка с uid_ship={uid_ship} не найдена"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = ReservSerializer(filtered_reserv, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Ошибка на сервере"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    def reserve_product(self, article, quantity, uid_ship):
        try:
            products = read_json('products.json')
            reserv = read_json('reserv.json')

            print(f"Поиск товара article={article}, uid_ship={uid_ship}")  # Логирование

            reserved_quantity = 0
            reserved_places = []

            for product in products:
                # Приводим статус к нижнему регистру и удаляем пробелы
                goods_status = product.get('goods_status', '').strip().lower()
                print(f"Товар: {product['article']}, статус: {goods_status}")  # Логирование статуса
                
                # Проверяем, что статус товара подходит для резервирования
                if product['article'] == article and goods_status in ["хранение", "приемка"]:
                    print(f"Товар подходит для резерва: {product}")  # Логирование подходящего товара
                    # Логика резервирования
                    available_quantity = product['quantity']
                    remaining_needed = quantity - reserved_quantity

                    if available_quantity >= remaining_needed:
                        # Если текущего товара достаточно для полного резерва
                        reserved_quantity += remaining_needed

                        # Создаем запись для reserv.json
                        reserved_product = {
                            "uid_ship": uid_ship,
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
                            "uid_ship": uid_ship,
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

            # Удаляем товары с  нулевым количеством из products.json
            products = [product for product in products if product['quantity'] > 0]            

            # Сохраняем изменения в products.json и reserv.json
            write_json('products.json', products)
            write_json('reserv.json', reserv)

            return reserved_quantity, reserved_places

        except Exception as e:
            print(f"Ошибка в reserve_product: {str(e)}")
            raise


# есть код SQLite
class CancelReservation(APIView):
    def post(self, request):
        try:
            reserve_ids = request.data.get('reserve_ids', [])
            cancel_quantities = request.data.get('cancel_quantities', {})  # Словарь {unique_id: количество для отмены}
            new_goods_status = request.data.get('goods_status', 'Хранение')


            # Чтение данных из файлов
            reserv = read_json('reserv.json')
            products = read_json('products.json')
            archive = read_json('archiveProducts.json')

            print(f"Данные из reserv.json: {archive}")
            print(f"полученные данные : {reserve_ids}")
            print(f"статус данных : {new_goods_status}")

            canceled_items = []  # Список отмененных товаров
            updated_reserv = []  # Обновленные записи резервирования

            for item in reserv:
                if item['unique_id'] in reserve_ids:
                    # Определяем, сколько нужно отменить
                    cancel_quantity = cancel_quantities.get(item['unique_id'], item['quantity'])
                    print(f"сопределение : {cancel_quantity}")

                    # Логика для статусов "Брак" и "Недостача"
                    if item['goods_status'] in ['Брак', 'Недостача']:
                        # Если отменяем часть товара
                        if cancel_quantity < item['quantity']:
                            # Создаем запись для отмененной части товара с новым уникальным ID
                            canceled_item = {
                                "unique_id": str(uuid.uuid4()),  # Новый уникальный ID для отмененной части
                                "article": item['article'],
                                "name": item['name'],
                                "quantity": cancel_quantity,
                                "place": item['place'],
                                "goods_status": new_goods_status,  # Статус для возвращаемого товара
                                "barcode": item['barcode']
                            }
                            archive.append(canceled_item)

                            # Оставшаяся часть товара сохраняет старый unique_id
                            updated_reserv.append({
                                **item,
                                "quantity": item['quantity'] - cancel_quantity,  # Обновляем количество в резерве
                                "goods_status": "Хранение",  # Статус оставшегося товара
                            })
                        else:
                            # Если отменяем весь товар
                            canceled_items.append(item)
                            # Добавляем весь товар обратно в products.json
                            product_entry = {
                                "unique_id": item['unique_id'],
                                "article": item['article'],
                                "name": item['name'],
                                "quantity": item['quantity'],
                                "place": item['place'],
                                "goods_status": new_goods_status,  # Статус "Хранение" для возвращаемого товара
                                "barcode": item['barcode']
                            }
                            archive.append(product_entry)

                    elif item['goods_status'] == 'Хранение':  
                         # Если отменяем часть товара
                        if cancel_quantity < item['quantity']:
                            # Создаем запись для отмененной части товара с новым уникальным ID
                            canceled_item = {
                                "unique_id": str(uuid.uuid4()),  # Новый уникальный ID для отмененной части
                                "article": item['article'],
                                "name": item['name'],
                                "quantity": cancel_quantity,
                                "place": item['place'],
                                "goods_status": new_goods_status,  # Статус для возвращаемого товара
                                "barcode": item['barcode']
                            }
                            products.append(canceled_item)

                            # Оставшаяся часть товара сохраняет старый unique_id
                            updated_reserv.append({
                                **item,
                                "quantity": item['quantity'] - cancel_quantity,  # Обновляем количество в резерве
                                "goods_status": "Хранение",  # Статус оставшегося товара
                            })
                        else:
                            # Если отменяем весь товар
                            canceled_items.append(item)
                            # Добавляем весь товар обратно в products.json
                            product_entry = {
                                "unique_id": item['unique_id'],
                                "article": item['article'],
                                "name": item['name'],
                                "quantity": item['quantity'],
                                "place": item['place'],
                                "goods_status": new_goods_status,  # Статус "Хранение" для возвращаемого товара
                                "barcode": item['barcode']
                            }
                            products.append(product_entry)
                else:
                    updated_reserv.append(item)

            # Сохраняем обновленные данные в файлы
            write_json('reserv.json', updated_reserv)
            write_json('products.json', products)
            write_json('archiveProducts.json', archive)

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

# есть код SQLite
class PlaceProducts(APIView):
    def get(self, request):
        try:
            uid_add = request.query_params.get("uid_add")
            all_products = read_json("placeProducts.json")
            
            if uid_add:
                filtered_products = [p for p in all_products if str(p.get("uid_add")) == str(uid_add)]
                return Response(filtered_products, status=status.HTTP_200_OK)
            
            return Response(all_products, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            new_products = request.data
            print("Полученные данные:", new_products)  # Лог запроса
            if not isinstance(new_products, list):
                return Response({"error": "Ожидается список объектов"}, status=status.HTTP_400_BAD_REQUEST)
            
            all_products = read_json("placeProducts.json")
            product_records = read_json("products.json")
            
            for product in new_products:
                unique_id = str(uuid.uuid4())
                product["unique_id"] = unique_id
                all_products.append(product)
                
                product_records.append({
                    "unique_id": unique_id,
                    "article": product.get("article"),
                    "name": product.get("name"),
                    "quantity": product.get("quantity"),
                    "goods_status": product.get("goods_status"),
                    "barcode": product.get("barcode")
                })
            
            write_json("placeProducts.json", all_products)
            write_json("products.json", product_records)
            
            return Response({"message": "Данные успешно добавлены"}, status=status.HTTP_201_CREATED)
        except Exception:
            return Response({"error": "Ошибка на сервере"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
