from django.contrib import admin

from .models import Horario, SesionClase


class SesionClaseInline(admin.TabularInline):
    model = SesionClase
    extra = 0


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ("nombre", "periodo", "estado")
    inlines = [SesionClaseInline]


@admin.register(SesionClase)
class SesionClaseAdmin(admin.ModelAdmin):
    list_display = ("materia", "grupo", "aula", "dia", "hora_inicio", "hora_fin")