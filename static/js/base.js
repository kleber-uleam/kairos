/* ==========================================================================
KAIRÓS - Comportamiento base del sistema
Inicializa el comportamiento de los componentes definidos en
css/componentes.css: mensajes, notificaciones, pestañas, acordeones,
menús desplegables, modales, confirmaciones, tablas ordenables y formularios.
========================================================================== */
(function () {
    "use strict";
    var SELECTOR_ENFOCABLES = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");

/* ----------------------------------------------------------------------
    Utilidades
---------------------------------------------------------------------- */
function aLista(coleccion) {
    return Array.prototype.slice.call(coleccion || []);
}

function enfocables(contenedor) {
    return aLista(contenedor.querySelectorAll(SELECTOR_ENFOCABLES)).filter(
    function (elemento) {
        return (
        elemento.offsetParent !== null || elemento === document.activeElement
        );
        },
    );
}

function anunciar(mensaje, tipo) {
    var region = document.querySelector(".notificaciones");

    if (!region) {
        region = document.createElement("div");
        region.className = "notificaciones";
        region.setAttribute("role", "status");
        region.setAttribute("aria-live", "polite");
        document.body.appendChild(region);
    }

    var notificacion = document.createElement("div");
    notificacion.className = "notificacion" + (tipo ? " notificacion--" + tipo : "");
    notificacion.textContent = mensaje;
    region.appendChild(notificacion);

    window.setTimeout(function () {
        retirar(notificacion, region);
    }, 5000);
}

function retirar(elemento, contenedor) {
    if (!elemento.isConnected) {
        return;
    }

    elemento.classList.add("mensaje--saliendo", "notificacion--saliendo");
    window.setTimeout(function () {
        elemento.remove();

    if (contenedor && !contenedor.children.length) {
        contenedor.remove();
    }
    }, 200);
}

/* ----------------------------------------------------------------------
    Mensajes del sistema (Django messages)
---------------------------------------------------------------------- */
function iniciarMensajes() {
    aLista(document.querySelectorAll(".mensaje")).forEach(function (mensaje) {
    if (mensaje.dataset.iniciado === "true") {
        return;
    }
    mensaje.dataset.iniciado = "true";

    if (mensaje.querySelector(".mensaje__cerrar")) {
        return;
    }

    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "mensaje__cerrar";
    boton.setAttribute("aria-label", "Cerrar mensaje");
    boton.innerHTML = "&times;";

    var texto = document.createElement("span");
    texto.className = "mensaje__texto";
    while (mensaje.firstChild) {
        texto.appendChild(mensaje.firstChild);
    }

    var contenedor = mensaje.parentElement;
    boton.addEventListener("click", function () {
        retirar(mensaje, contenedor);
    });

    mensaje.appendChild(texto);
    mensaje.appendChild(boton);
    mensaje.classList.add("mensaje--cerrable");
    mensaje.parentElement.classList.add("mensajes--cerrables");
    });

    aLista(document.querySelectorAll(".mensaje[data-autocerrar]")).forEach(
    function (mensaje) {
        var demora = parseInt(mensaje.dataset.autocerrar, 10);
        window.setTimeout(
        function () {
            retirar(mensaje, mensaje.parentElement);
        },isNaN(demora) ? 6000 : demora,
        );
    },
    );
}

/* ----------------------------------------------------------------------
    Pestañas accesibles
---------------------------------------------------------------------- */
function iniciarPestanas() {
    aLista(document.querySelectorAll("[data-pestanas]")).forEach(
    function (grupo) {
        var pestanas = aLista(grupo.querySelectorAll("[role='tab']"));

        if (!pestanas.length) {
            return;
        }

        function activar(pestana, enfocar) {
        pestanas.forEach(function (otra) {
            var seleccionada = otra === pestana;
            var panel = document.getElementById(
                otra.getAttribute("aria-controls") || "",
            );

            otra.setAttribute("aria-selected", seleccionada ? "true" : "false");
            otra.setAttribute("tabindex", seleccionada ? "0" : "-1");
            otra.classList.toggle("pestana--activa", seleccionada);

            if (panel) {
                panel.hidden = !seleccionada;
            }
        });

        if (enfocar) {
            pestana.focus();
        }
        }

        pestanas.forEach(function (pestana, indice) {
        pestana.addEventListener("click", function () {
            activar(pestana, false);
        });

        pestana.addEventListener("keydown", function (evento) {
            var destino = null;

            if (evento.key === "ArrowRight" || evento.key === "ArrowDown") {
                destino = pestanas[(indice + 1) % pestanas.length];
            } else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") {
                destino = pestanas[(indice - 1 + pestanas.length) % pestanas.length];
            } else if (evento.key === "Home") {
                destino = pestanas[0];
            } else if (evento.key === "End") {
                destino = pestanas[pestanas.length - 1];
            }

            if (destino) {
                evento.preventDefault();
                activar(destino, true);
            }
            });
        });

        var inicial = pestanas.filter(function (pestana) {
            return pestana.getAttribute("aria-selected") === "true";
        })[0] || pestanas[0];

        activar(inicial, false);
    },
    );
}

/* ----------------------------------------------------------------------
    Acordeones
---------------------------------------------------------------------- */
function iniciarAcordeones() {
    aLista(document.querySelectorAll("[data-acordeon]")).forEach(
    function (acordeon) {
        var exclusivo = acordeon.dataset.acordeon === "exclusivo";

        aLista(acordeon.querySelectorAll("[data-acordeon-disparador]")).forEach(
        function (disparador) {
            var elemento = disparador.closest(".acordeon__elemento");
            var panel = elemento
                ? elemento.querySelector("[data-acordeon-panel]")
                : null;

            if (!panel) {
                return;
            }

            disparador.addEventListener("click", function () {
                var abrir = disparador.getAttribute("aria-expanded") !== "true";

            if (abrir && exclusivo) {
                aLista(
                    acordeon.querySelectorAll("[data-acordeon-disparador]"),
                ).forEach(function (otro) {
                    otro.setAttribute("aria-expanded", "false");
                    var otroPanel = otro.closest(".acordeon__elemento");
                    var caja = otroPanel
                    ? otroPanel.querySelector("[data-acordeon-panel]")
                    : null;

                if (caja) {
                    caja.hidden = true;
                }

                if (otroPanel) {
                    otroPanel.classList.remove("acordeon__elemento--abierto");
                }
                });
            }

            disparador.setAttribute(
                "aria-expanded",
                abrir ? "true" : "false",
            );
            panel.hidden = !abrir;

            if (elemento) {
                elemento.classList.toggle("acordeon__elemento--abierto", abrir);
            }
            });
        },
        );
    },
    );
}

/* ----------------------------------------------------------------------
    Desplegables y menú de usuario
---------------------------------------------------------------------- */
function cerrarDesplegables(excepto) {
    aLista(document.querySelectorAll("[data-desplegable]")).forEach(
        function (contenedor) {
        if (contenedor === excepto) {
            return;
        }

        var disparador = contenedor.querySelector(
            "[data-desplegable-disparador]",
        );
        var menu = contenedor.querySelector(".desplegable");

        if (disparador) {
            disparador.setAttribute("aria-expanded", "false");
        }

        if (menu) {
            menu.hidden = true;
        }
        },
    );
}

function iniciarDesplegables() {
    aLista(document.querySelectorAll("[data-desplegable]")).forEach(
    function (contenedor) {
        var disparador = contenedor.querySelector(
            "[data-desplegable-disparador]",
        );
        var menu = contenedor.querySelector(".desplegable");

        if (!disparador || !menu) {
            return;
        }

        menu.hidden = disparador.getAttribute("aria-expanded") !== "true";

        disparador.addEventListener("click", function (evento) {
            evento.stopPropagation();
            var abrir = menu.hidden;

            cerrarDesplegables(contenedor);
            menu.hidden = !abrir;
            disparador.setAttribute("aria-expanded", abrir ? "true" : "false");

        if (abrir) {
            var primero = enfocables(menu)[0];
            if (primero) {
                primero.focus();
            }
        }
        });
    },
    );

    document.addEventListener("click", function (evento) {
    if (!evento.target.closest("[data-desplegable]")) {
        cerrarDesplegables(null);
    }
    });
}

/* ----------------------------------------------------------------------
    Modales
---------------------------------------------------------------------- */
var ultimoEnfoque = null;

function modalAbierto() {
    return ( aLista(document.querySelectorAll(".modal")).filter(function (modal) {
        return !modal.hidden;
        })[0] || null
    );
}

function abrirModal(modal) {
    if (!modal) {
        return;
    }

    ultimoEnfoque = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-abierto");
    cerrarDesplegables(null);

    var enfocar = modal.querySelector("[data-enfoque-inicial]") || enfocables(modal)[0];

    if (enfocar) {
        enfocar.focus();
    }
}

function cerrarModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = true;

    if (!modalAbierto()) {
        document.body.classList.remove("modal-abierto");
    }

    if (ultimoEnfoque && ultimoEnfoque.isConnected) {
        ultimoEnfoque.focus();
        ultimoEnfoque = null;
    }
}

function iniciarModales() {
    document.addEventListener("click", function (evento) {
    var abridor = evento.target.closest("[data-modal-abrir]");

    if (abridor) {
        evento.preventDefault();
        abrirModal(document.getElementById(abridor.dataset.modalAbrir));
        return;
    }

    var cerrador = evento.target.closest("[data-modal-cerrar]");

    if (cerrador) {
        evento.preventDefault();
        cerrarModal(cerrador.closest(".modal"));
        return;
    }

    if (evento.target.classList.contains("modal")) {
        cerrarModal(evento.target);
    }
    });
}

/* ----------------------------------------------------------------------
    Confirmación de acciones destructivas
---------------------------------------------------------------------- */
function iniciarConfirmaciones() {
    function texto(elemento) {
        return elemento.dataset.confirmar || "¿Confirmas esta acción?";
    }

    document.addEventListener(
        "click",
        function (evento) {
        var elemento = evento.target.closest("[data-confirmar]");

        if (!elemento || elemento.tagName === "FORM") {
            return;
        }

        if (elemento.dataset.confirmado === "true") {
            elemento.dataset.confirmado = "false";
            return;
        }

        evento.preventDefault();
        evento.stopImmediatePropagation();

        if (!window.confirm(texto(elemento))) {
            return;
        }

        elemento.dataset.confirmado = "true";
        elemento.click();
    },
    true,
    );

    document.addEventListener("submit",
    function (evento) {
        var formulario = evento.target.closest("form[data-confirmar]");

        if (!formulario) {
            return;
        }

        if (formulario.dataset.confirmado === "true") {
            formulario.dataset.confirmado = "false";
            return;
        }

        evento.preventDefault();
        evento.stopImmediatePropagation();

        if (!window.confirm(texto(formulario))) {
            return;
        }

        formulario.dataset.confirmado = "true";

        if (typeof formulario.requestSubmit === "function") {
            formulario.requestSubmit();
        } else {
            formulario.submit();
        }
    },
    true,
    );
}

/* ----------------------------------------------------------------------
    Tablas ordenables
---------------------------------------------------------------------- */
function valorCelda(celda) {
    var dato = celda.dataset.valor;

    if (typeof dato === "string" && dato !== "") {
        return dato;
    }

    return (celda.textContent || "").trim();
}

function comparar(a, b) {
    var numeroA = parseFloat(
    String(a)
        .replace(/[^0-9,.-]/g, "")
        .replace(",", "."),
    );
    var numeroB = parseFloat(
    String(b)
        .replace(/[^0-9,.-]/g, "")
        .replace(",", "."),
    );

    if (!isNaN(numeroA) && !isNaN(numeroB)) {
        return numeroA - numeroB;
    }

    return String(a).localeCompare(String(b), "es", {
        numeric: true,
        sensitivity: "base",
    });
}

function iniciarTablas() {
    aLista(document.querySelectorAll("table[data-ordenar]")).forEach(
    function (tabla) {
        var cuerpo = tabla.tBodies[0];

        if (!cuerpo) {
        return;
        }

        tabla.classList.add("tabla-ordenable");

        aLista(tabla.querySelectorAll("thead th")).forEach(
        function (cabecera, indice) {
            if (cabecera.dataset.ordenar === "no" || cabecera.colSpan > 1) {
            return;
            }

            var boton = cabecera.querySelector("button");

            if (!boton) {
            boton = document.createElement("button");
            boton.type = "button";

            while (cabecera.firstChild) {
                boton.appendChild(cabecera.firstChild);
            }

            cabecera.appendChild(boton);
            }

            cabecera.setAttribute("aria-sort", "none");

            boton.addEventListener("click", function () {
            var descendente =
                cabecera.getAttribute("aria-sort") === "ascending";

            aLista(tabla.querySelectorAll("thead th")).forEach(
                function (otra) {
                otra.setAttribute("aria-sort", "none");
                },
            );

            cabecera.setAttribute(
                "aria-sort",
                descendente ? "descending" : "ascending",
            );

            var filas = aLista(cuerpo.rows).sort(function (filaA, filaB) {
                var celdaA = filaA.cells[indice];
                var celdaB = filaB.cells[indice];

                if (!celdaA || !celdaB) {
                    return 0;
                }

                var resultado = comparar(
                valorCelda(celdaA),
                valorCelda(celdaB),
                );
                return descendente ? -resultado : resultado;
            });

            filas.forEach(function (fila) {
                cuerpo.appendChild(fila);
            });
            });
        },
        );
    },
    );
}

/* ----------------------------------------------------------------------
    Buscadores de listados
---------------------------------------------------------------------- */
function iniciarBuscadores() {
    aLista(document.querySelectorAll("[data-buscador]")).forEach(
    function (contenedor) {
        var entrada = contenedor.querySelector("input");
        var limpiar = contenedor.querySelector("[data-buscador-limpiar]");
        var destino = document.querySelector(contenedor.dataset.buscador);

        if (!entrada || !destino) {
        return;
        }

        var elementos = aLista(destino.children);

        function filtrar() {
        var termino = entrada.value.trim().toLowerCase();

        elementos.forEach(function (elemento) {
            var coincide =
            !termino ||
            (elemento.textContent || "").toLowerCase().indexOf(termino) !== -1;
            elemento.hidden = !coincide;
        });

        if (limpiar) {
            limpiar.hidden = !termino;
        }
        }

        entrada.addEventListener("input", filtrar);

        if (limpiar) {
        limpiar.addEventListener("click", function () {
            entrada.value = "";
            filtrar();
            entrada.focus();
        });
        }

        filtrar();
    },
    );
}

/* ----------------------------------------------------------------------
    Envío de formularios
---------------------------------------------------------------------- */
function iniciarFormularios() {
    document.addEventListener("submit", function (evento) {
    var formulario = evento.target;

    if (
        !(formulario instanceof HTMLFormElement) ||
        formulario.dataset.enviando !== "true"
    ) {
        return;
    }

    formulario.dataset.estado = "enviando";
    aLista(
        formulario.querySelectorAll("[type='submit'], button:not([type])"),
    ).forEach(function (boton) {
        boton.disabled = true;
        boton.setAttribute("aria-busy", "true");
    });
    });

    window.addEventListener("pageshow", function () {
    aLista(document.querySelectorAll("form[data-estado='enviando']")).forEach(
        function (formulario) {
        formulario.dataset.estado = "";
        aLista(formulario.querySelectorAll("[aria-busy='true']")).forEach(
            function (boton) {
            boton.disabled = false;
            boton.removeAttribute("aria-busy");
            },
        );
        },
    );
    });
}

/* ----------------------------------------------------------------------
    Mantener foco dentro del modal y cerrar con Escape
---------------------------------------------------------------------- */
function iniciarTeclado() {
    document.addEventListener("keydown", function (evento) {
    var modal = modalAbierto();

    if (evento.key === "Escape") {
        if (modal) {
        evento.preventDefault();
        cerrarModal(modal);
        return;
        }

        cerrarDesplegables(null);
        return;
    }

    if (evento.key !== "Tab" || !modal) {
        return;
    }

    var lista = enfocables(modal);

    if (!lista.length) {
        return;
    }

    var primero = lista[0];
    var ultimo = lista[lista.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
    }
    });
}

/* ----------------------------------------------------------------------
    Estado activo de la navegación
---------------------------------------------------------------------- */
function iniciarNavegacion() {
    var ruta = window.location.pathname;
    var enlaces = aLista(document.querySelectorAll("[data-nav] a[href]"));

    enlaces.forEach(function (enlace) {
    var destino = new URL(enlace.href, window.location.origin).pathname;
    var esInicio = destino === "/" || destino === "/index.html";
    var activo = esInicio ? ruta === destino : ruta.indexOf(destino) === 0;

    enlace.classList.toggle("activo", activo);

    if (activo) {
        enlace.setAttribute("aria-current", "page");
    } else {
        enlace.removeAttribute("aria-current");
    }
    });
}

/* ----------------------------------------------------------------------
    Inicialización
---------------------------------------------------------------------- */
function iniciar(raiz) {
    var ambito = raiz || document;

    if (ambito === document) {
    iniciarMensajes();
    iniciarPestanas();
    iniciarAcordeones();
    iniciarDesplegables();
    iniciarModales();
    iniciarConfirmaciones();
    iniciarTablas();
    iniciarBuscadores();
    iniciarFormularios();
    iniciarTeclado();
    iniciarNavegacion();
    document.documentElement.classList.add("js-listo");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
    iniciar(document);
    });
} else {
    iniciar(document);
}

window.Kairos = {
    iniciar: iniciar,
    notificar: anunciar,
    abrirModal: abrirModal,
    cerrarModal: cerrarModal,
    cerrarDesplegables: cerrarDesplegables,
};
})();
