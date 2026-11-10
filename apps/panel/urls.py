from django.urls import path

from . import views

#Creación del listado de URLs para este módulo
urlpatterns = [
    path('', views.Inicio, name='inicio'),
]