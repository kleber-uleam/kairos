from django import forms

from .models import Horario, SesionClase


class HorarioForm(forms.ModelForm):
    class Meta:
        model = Horario
        fields = ["periodo", "nombre"]


class SesionClaseForm(forms.ModelForm):
    class Meta:
        model = SesionClase
        fields = [
            "materia", "profesor", "grupo", "aula",
            "dia", "hora_inicio", "hora_fin",
        ]
        widgets = {
            "hora_inicio": forms.TimeInput(attrs={"type": "time"}),
            "hora_fin": forms.TimeInput(attrs={"type": "time"}),
        }