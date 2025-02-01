from django.urls import path
from .views import ShipmentListView, AddProductListView, ProductListView, ReserveAllView, CancelReservation, PlaceProducts

urlpatterns = [
    path('shipments/', ShipmentListView.as_view()),  # Получить список отгрузок
    path('addproducts/', AddProductListView.as_view(), name='add_products'),  # Получить список добавленных продуктов
    path('products/', ProductListView.as_view()),    # Получить список продуктов
    path('reserve/', ReserveAllView.as_view(), name='reserve-all'), #Резервирование товара
    path('reserve/cancel/', CancelReservation.as_view()), #Отмена резервирования
    path('placeship/', PlaceProducts.as_view()), #Отмена резервирования

]
