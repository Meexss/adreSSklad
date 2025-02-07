from django.urls import path
# from .oldviews import ShipmentListView, AddProductListView, ProductListView, ReserveAllView, CancelReservation, PlaceProducts, protected_view, ArchiveShip, ArchiveAdd
from .views import TranzitDataViewSet, ShipDataViewSet, AddDataViewSet, ProductListView, ProductListCreateView, ShipmentListView, ReserveAllView, CancelReservation
from rest_framework_simplejwt.views import (                                                                                            
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('shipments/', ShipmentListView.as_view()),  # Получить список отгрузок
    # path('addproducts/', AddProductListView.as_view(), name='add_products'),  # Получить список добавленных продуктов
    path('products/', ProductListView.as_view()),    # Получить список продуктов
    path('reserve/', ReserveAllView.as_view()), #Резервирование товара
    path('reserve/cancel/', CancelReservation.as_view()), #Отмена резервирования
    # path('placeship/', PlaceProducts.as_view()), #Отмена резервирования
    # path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('protected/', protected_view, name='protected_view'),
    # path('archiveAdd/', ArchiveAdd.as_view()), #перенос в архив прихода
    # path('archiveShip/', ArchiveShip.as_view()), #перенос в архив прихода

    path('inTranzit/', TranzitDataViewSet.as_view({'post': 'create'})),  # Только crea
    path('inShip/', ShipDataViewSet.as_view({'post': 'create'})),  # Только crea
    path('inAdd/', AddDataViewSet.as_view({'post': 'create'})),  # Только crea
    path('send_product/', ProductListCreateView.as_view()),
]
