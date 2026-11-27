from abc import ABC, abstractmethod

from django.core.exceptions import ValidationError

from .models import Horario


class ReglaAsignacion(ABC):
    """Contrato: toda regla recibe el horario y los datos de la sesión."""

    @abstractmethod
    def validar(self, horario, datos):
        """Lanza ValidationError si la asignación no es válida."""


class HorarioEditable(ReglaAsignacion):
    def validar(self, horario, datos):
        if horario.estado == Horario.Estado.PUBLICADO:
            raise ValidationError("No se puede modificar un horario publicado.")


class HorasCoherentes(ReglaAsignacion):
    def validar(self, horario, datos):
        if datos.hora_inicio >= datos.hora_fin:
            raise ValidationError(
                "La hora de inicio debe ser menor que la hora de fin."
            )


# Lista de reglas que se aplican por defecto
REGLAS_POR_DEFECTO = [HorarioEditable(), HorasCoherentes()]