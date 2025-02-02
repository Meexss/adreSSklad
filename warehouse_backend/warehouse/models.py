from django.db import models
import uuid

class Shipment(models.Model):
        # уникальный id поставки генерируем в момент поступления данных
    unique_id_ship = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) 
    shipment_number = models.CharField(max_length=100, unique=False)
    shipment_date = models.DateField()
    counterparty = models.CharField(max_length=100)
    warehouse = models.CharField(max_length=100)
    progress = models.CharField(max_length=100)

    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    barcode = models.CharField(max_length=100)

class AddProduct(models.Model):
        # уникальный id поставки генерируем в момент поступления данных
    unique_id_add = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) 
    add_number = models.CharField(max_length=100)
    add_date = models.DateField()
    counterparty = models.CharField(max_length=100)
    warehouse = models.CharField(max_length=100)
    progress = models.CharField(max_length=100)

    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    barcode = models.CharField(max_length=100)
    error_barcode = models.BooleanField(default=False)
    newbarcode = models.CharField(max_length=100)  
    final_quantity = models.IntegerField(default=0)


class Product(models.Model):
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100)

class Reserv(models.Model):
    shipment_number = models.CharField(max_length=100)
    reserve_data = models.DateField()
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100)

class PlaceProduct(models.Model):
    add_number = models.CharField(max_length=100)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100)
    quantity = models.IntegerField()
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100)



class ArchiveShipProduct(models.Model):
    unique_id_ship = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) 
    shipment_number = models.CharField(max_length=100, unique=False)
    shipment_date = models.DateField()
    shipment_date_end = models.DateField()
    counterparty = models.CharField(max_length=100)
    warehouse = models.CharField(max_length=100)
    progress = models.CharField(max_length=100)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    barcode = models.CharField(max_length=100)
    place = models.CharField(max_length=100)
    goods_status = models.CharField(max_length=100)

class ArchiveAddProduct(models.Model):
    unique_id_add = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) 
    add_number = models.CharField(max_length=100, unique=False)
    add_date = models.DateField()
    add_date_end = models.DateField()
    counterparty = models.CharField(max_length=100)
    warehouse = models.CharField(max_length=100)
    progress = models.CharField(max_length=100)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    barcode = models.CharField(max_length=100)
    error_barcode = models.BooleanField(default=False)  # Добавлено default
    newbarcode = models.CharField(max_length=100, default="")  # Добавлено default
    final_quantity = models.IntegerField(default=0)  # Добавлено default

class WarehouseShipment(models.Model):
    shipment_number = models.CharField(max_length=100)
    shipment_date = models.DateField()
    counterparty = models.CharField(max_length=100)
    warehouse = models.CharField(max_length=100)
    article = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    barcode = models.CharField(max_length=100)
    progress = models.CharField(max_length=100, default="Новый")
    unique_id_ship = models.UUIDField(default=uuid.uuid4, editable=False)

    def __str__(self):
        return f"Shipment {self.shipment_number} - {self.article} - {self.unique_id_ship}"
