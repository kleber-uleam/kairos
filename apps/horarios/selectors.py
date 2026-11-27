from .models import Horario, SesionClase


def _publicadas():
    return (
        SesionClase.objects
        .filter(horario__estado=Horario.Estado.PUBLICADO)
        .select_related("horario", "profesor")
        .order_by("dia", "hora_inicio")
    )


def por_grupo(grupo):
    return _publicadas().filter(grupo=grupo)


def por_aula(aula):
    return _publicadas().filter(aula=aula)


def por_profesor(profesor_id):
    return _publicadas().filter(profesor_id=profesor_id)


def por_estudiante(estudiante):
    # Esto hara que cuando Lozada defina cómo se relaciona un estudiante con su grupo.
    return por_grupo(estudiante.grupo)