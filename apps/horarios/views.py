from django.contrib import messages
from django.core.exceptions import ValidationError
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from . import selectors, services
from .forms import HorarioForm, SesionClaseForm
from .models import Horario, SesionClase
from .services import DatosSesion

CONSULTAS = {
    "grupo": selectors.por_grupo,
    "aula": selectors.por_aula,
    "profesor": selectors.por_profesor,
}


def crear_horario_view(request):
    form = HorarioForm(request.POST or None)
    if form.is_valid():
        horario = services.crear_horario(**form.cleaned_data)
        return redirect("horarios:detalle", pk=horario.pk)
    return render(request, "horarios/crear.html", {"form": form})


def detalle_horario_view(request, pk):
    horario = get_object_or_404(Horario, pk=pk)
    return render(
        request,
        "horarios/detalle.html",
        {"horario": horario, "sesiones": horario.sesiones.all()},
    )


def agregar_sesion_view(request, pk):
    horario = get_object_or_404(Horario, pk=pk)
    form = SesionClaseForm(request.POST or None)
    if form.is_valid():
        try:
            services.agregar_sesion(horario, DatosSesion(**form.cleaned_data))
            return redirect("horarios:detalle", pk=horario.pk)
        except ValidationError as error:
            form.add_error(None, error)
    return render(
        request, "horarios/agregar_sesion.html", {"form": form, "horario": horario}
    )


@require_POST
def quitar_sesion_view(request, pk):
    sesion = get_object_or_404(SesionClase, pk=pk)
    horario_pk = sesion.horario_id
    try:
        services.quitar_sesion(sesion)
    except ValidationError as error:
        messages.error(request, error.message)
    return redirect("horarios:detalle", pk=horario_pk)


@require_POST
def publicar_horario_view(request, pk):
    horario = get_object_or_404(Horario, pk=pk)
    try:
        services.publicar_horario(horario)
        messages.success(request, "Horario publicado.")
    except ValidationError as error:
        messages.error(request, error.message)
    return redirect("horarios:detalle", pk=pk)


def consulta_view(request, tipo, valor):
    consulta = CONSULTAS.get(tipo)
    if consulta is None:
        raise Http404("Tipo de consulta no válido")
    return render(
        request,
        "horarios/consulta.html",
        {"sesiones": consulta(valor), "tipo": tipo, "valor": valor},
    )