from django.db import models
import uuid

# Гтово прием данных о перемещении 1С
class TranzitData(models.Model):
    tranz_number =  models.CharField(max_length=100) #Номер перемещения 1С
    tranz_date = models.DateField() #Дата перемещения 1С
    from_house = models.CharField(max_length=100) #Отправиьель 1С
    to_house = models.CharField(max_length=100) #Получатель 1С

    article = models.CharField(max_length=100) 
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #баркод 1С
    quantity = models.IntegerField() #количество 1С


# Готово прием данных о релизации 1С
class ShipData(models.Model):
    ship_number = models.CharField(max_length=100) #Номер реализации 1С
    ship_date = models.DateField() #Дата реализации 1С
    counterparty = models.CharField(max_length=100) #Контрагент 1С
    warehouse = models.CharField(max_length=100) #Склад отгрузки 1С

    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #баркод 1С
    quantity = models.IntegerField() #количество 1С


# Готово прием данных о поступлении 1С
class AddData(models.Model):
    add_number = models.CharField(max_length=100) #Номер поступления 1С
    add_date = models.DateField() #Дата поступления 1С
    counterparty = models.CharField(max_length=100) #Контрагент 1С
    warehouse = models.CharField(max_length=100) #Склад поступления 1С

    article = models.CharField(max_length=100) 
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #баркод 1С
    quantity = models.IntegerField() #количество 1С
    

# Готово хранение данных об отгрузках/перемещениях с ЦС
class ShipList(models.Model):
    unique_id_ship = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) #при перемещении с ShipData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100) #Тип задания реализация/перемещение
    ship_number = models.CharField(max_length=100) #tranz_number или ship_number
    ship_date = models.DateField() #tranz_date или ship_date
    counterparty = models.CharField(max_length=100) #Из ShipData counterparty или to_house != Центральный новый
    warehouse = models.CharField(max_length=100) #Из ShipData warehouse или  from_house === Центральный новый
    progress = models.CharField(max_length=100) #На входе устанавливаем статус отгрузки на Новый

    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #баркод 1С
    quantity = models.IntegerField() #количество 1С


# Готово хранение данных об приемках перемещениях на ЦС
class AddList(models.Model):
    unique_id_add = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) #при перемещении с AddData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100) #Тип задания реализация/перемещение
    add_number = models.CharField(max_length=100) #tranz_number или add_number
    add_date = models.DateField() #tranz_date или add_date
    counterparty = models.CharField(max_length=100) #Из AddData counterparty или from_house != Центральный новый
    warehouse = models.CharField(max_length=100) #Из AddData warehouse или  to_house === Центральный новый
    progress = models.CharField(max_length=100) #На входе устанавливаем статус прихода на Новый

    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #баркод 1С
    quantity = models.IntegerField()  #количество 1С
    error_barcode = models.BooleanField(default=False) #Ошибка Штрихкода
    newbarcode = models.CharField(max_length=100)  #Новый баркод на товаре
    final_quantity = models.IntegerField(default=0) #финальное принятое кол-во
    goods_status = models.CharField(max_length=100) #Устанавливаем статус товара на входе Приёмка далее после приемке устанавливаем Принят


# Готово хранение данных о товарах на ЦС
class ProductList(models.Model):
    unique_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) #уникальный id товара
    add_date = models.DateField() #дата поступления
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) #если ошибка error_barcode === true то новый баркод если false то шк 1С
    place = models.CharField(max_length=100) #место хранения на складе
    quantity = models.IntegerField() #размещенное кол-во в ячейке
    goods_status = models.CharField(max_length=100) #в этом списке только Хранение


# Готово хранение данных о резерве товара под отгрузку
class ReservList(models.Model):
    unique_id_ship = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)  #при перемещении с ShipData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100) #Тип задания реализация/перемещение
    ship_number = models.CharField(max_length=100)  #tranz_number или ship_number
    ship_date = models.DateField()  #tranz_date или ship_date
    counterparty = models.CharField(max_length=100) #Из ShipData counterparty или to_house != Центральный новый
    warehouse = models.CharField(max_length=100)  #Из ShipData warehouse или  from_house === Центральный новый
    progress = models.CharField(max_length=100) #при переходе в эту базу ставим В работе 
    reserve_data = models.DateField() #дата установки в резерв
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) #уникальный id товара
    add_date = models.DateField()  #tranz_date или add_date
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100) 
    quantity = models.IntegerField()
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100) #при переходе в эту базу статус Резерв


# Готово хранение данных о резмещение товара на месте хранения удаление после закрытия приемки
class PlaceProduct(models.Model):
    unique_id_add = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)  #при перемещении с AddData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100) #Тип задания реализация/перемещение
    add_number = models.CharField(max_length=100) #tranz_number или add_number

    unique_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) #На этом этапе присваивается уникальный id
    add_date = models.DateField() #tranz_date или add_date
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100)
    place = models.CharField(max_length=100) #тут устанавливается место хранения
    quantity = models.IntegerField() #тут и дальше идет размещенное кол-во
    goods_status = models.CharField(max_length=100) #тут статус тавара устанавливается на Хранение


# Готово архив хранения данных об отгруженных позициях
class ArchiveShip(models.Model):
    unique_id_ship = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) #при перемещении с ShipData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100) #Тип задания реализация/перемещение
    ship_number = models.CharField(max_length=100) #tranz_number или ship_number
    ship_date = models.DateField() #tranz_date или ship_date
    counterparty = models.CharField(max_length=100)  #Из ShipData counterparty или to_house != Центральный новый
    warehouse = models.CharField(max_length=100)  #Из ShipData warehouse или  from_house === Центральный новый
    progress = models.CharField(max_length=100) #На этом этапе устанавливается завершенный
    reserve_data = models.DateField() #дата установки в резерв
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100)
    quantity = models.IntegerField()
    place = models.CharField(max_length=100) 
    final_ship_date = models.DateField() #дата отгрузки устанавливается при переносе в эту базу


# Готово хранения данных о приходе товара 
class ArchiveAdd(models.Model):
    unique_id_add = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)  #при перемещении с AddData и TranzitData присваиваем номер отгрузки
    type = models.CharField(max_length=100)  #Тип задания реализация/перемещение
    add_number = models.CharField(max_length=100)  #tranz_number или add_number
    add_date = models.DateField() #tranz_date или add_date
    unique_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100)
    place = models.CharField(max_length=100) #
    quantity_start = models.IntegerField() #количество на входе
    quanity_place = models.IntegerField() #Финальное кол-во размещенного товара 
    goods_status = models.CharField(max_length=100) #статус товара
    close_add_date = models.DateField() #дата закрытия приемки


# Готво хранение данных о товарах перенесенных на брак или недостачу
class ArchiveProduct(models.Model):
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    add_date = models.DateField()
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100)
    quantity = models.IntegerField()
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100) #при удалении из резерва устанавливаетя Брак или Недостача
    close_product_date = models.DateField() #дата переноса в эту таблицу
