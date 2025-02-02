from django.urls import path
from .views import ShipmentListView, AddProductListView, ProductListView, ReserveAllView, CancelReservation, PlaceProducts, DataShipIn

urlpatterns = [
    path('shipments/', ShipmentListView.as_view()),
    path('addproducts/', AddProductListView.as_view(), name='add_products'),
    path('products/', ProductListView.as_view()),
    path('reserve/', ReserveAllView.as_view(), name='reserve-all'),
    path('reserve/cancel/', CancelReservation.as_view()),
    path('placeship/', PlaceProducts.as_view()),
    path('dataShipIn/', DataShipIn.as_view()),
]