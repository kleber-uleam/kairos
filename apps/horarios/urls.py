from django.urls import path

from . import views

app_name = "horarios"

urlpatterns = [
    path("crear/", views.crear_horario_view, name="crear"),
    path("<int:pk>/", views.detalle_horario_view, name="detalle"),
    path("<int:pk>/sesiones/agregar/", views.agregar_sesion_view, name="agregar_sesion"),
    path("sesiones/<int:pk>/quitar/", views.quitar_sesion_view, name="quitar_sesion"),
    path("<int:pk>/publicar/", views.publicar_horario_view, name="publicar"),
    path("consulta/<str:tipo>/<str:valor>/", views.consulta_view, name="consulta"),
]