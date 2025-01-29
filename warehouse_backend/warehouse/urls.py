from django.urls import path
from .views import ShipmentListView, AddProductListView, ProductListView

urlpatterns = [
    path('shipments/', ShipmentListView.as_view()),  # Получить список отгрузок
    path('addproducts/', AddProductListView.as_view()),  # Получить список добавленных продуктов
    path('products/', ProductListView.as_view()),    # Получить список продуктов
]
