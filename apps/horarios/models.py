from django.conf import settings
from django.db import models


class Horario(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "borrador", "Borrador"
        PUBLICADO = "publicado", "Publicado"

    periodo = models.CharField(max_length=20)  
    nombre = models.CharField(max_length=100)
    estado = models.CharField(
        max_length=10, choices=Estado.choices, default=Estado.BORRADOR
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.periodo})"


class SesionClase(models.Model):
    class Dia(models.IntegerChoices):
        LUNES = 1, "Lunes"
        MARTES = 2, "Martes"
        MIERCOLES = 3, "Miércoles"
        JUEVES = 4, "Jueves"
        VIERNES = 5, "Viernes"
        SABADO = 6, "Sábado"

    horario = models.ForeignKey(
        Horario, on_delete=models.CASCADE, related_name="sesiones"
    )
    materia = models.CharField(max_length=100)
    profesor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="sesiones_dictadas",
    )
    grupo = models.CharField(max_length=20)
    aula = models.CharField(max_length=20)
    dia = models.PositiveSmallIntegerField(choices=Dia.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    def __str__(self):
        return f"{self.materia} - {self.grupo} ({self.get_dia_display()})"