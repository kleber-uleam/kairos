from dataclasses import dataclass
from datetime import time

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Horario, SesionClase
from .reglas import REGLAS_POR_DEFECTO, HorarioEditable


@dataclass(frozen=True)
class DatosSesion:
    materia: str
    profesor: object  # instancia del usuario profesor
    grupo: str
    aula: str
    dia: int
    hora_inicio: time
    hora_fin: time


def crear_horario(*, periodo, nombre) -> Horario:
    """Crear horario por periodo."""
    return Horario.objects.create(periodo=periodo, nombre=nombre)


def validar_asignacion(horario, datos, reglas=None):
    """Aplica todas las reglas. Equivale a validarAsignacion de la tabla."""
    for regla in reglas or REGLAS_POR_DEFECTO:
        regla.validar(horario, datos)


@transaction.atomic
def agregar_sesion(horario, datos, reglas=None) -> SesionClase:
    validar_asignacion(horario, datos, reglas)
    return SesionClase.objects.create(
        horario=horario,
        materia=datos.materia,
        profesor=datos.profesor,
        grupo=datos.grupo,
        aula=datos.aula,
        dia=datos.dia,
        hora_inicio=datos.hora_inicio,
        hora_fin=datos.hora_fin,
    )


def quitar_sesion(sesion):
    HorarioEditable().validar(sesion.horario, None)
    sesion.delete()


def publicar_horario(horario) -> Horario:
    if horario.estado == Horario.Estado.PUBLICADO:
        raise ValidationError("El horario ya está publicado.")
    if not horario.sesiones.exists():
        raise ValidationError("No se puede publicar un horario sin sesiones.")
    horario.estado = Horario.Estado.PUBLICADO
    horario.save(update_fields=["estado"])
    return horario