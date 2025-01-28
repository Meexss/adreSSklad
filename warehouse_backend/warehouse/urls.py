from django.urls import path
from .views import ShipmentListView, ProductListView

urlpatterns = [
    path('shipments/', ShipmentListView.as_view()),
    path('products/', ProductListView.as_view()),
]