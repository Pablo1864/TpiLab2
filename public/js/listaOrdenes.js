document.addEventListener('DOMContentLoaded', () => {
    // Función para formatear las fechas
    function formatearFechas() {
        const fechas = document.querySelectorAll('.fecha-orden');
        fechas.forEach(fecha => {
            const fechaOriginal = new Date(fecha.textContent);
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
            const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            const fechaFormateada = fechaOriginal.toLocaleDateString('es-ES', opcionesFecha);
            const horaFormateada = fechaOriginal.toLocaleTimeString('es-ES', opcionesHora);

            fecha.textContent = `${fechaFormateada}`;
        });
    }

    // Llama a la función para formatear fechas
    formatearFechas();
});

$(document).ready(function () {
    $('a[data-bs-toggle="modal"]').on('click', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        $('#modalIframe').attr('src', href);
        $('#modalDetalles').modal('show');
    });

    $('#modalDetalles').on('hidden.bs.modal', function () {
        $('#modalIframe').attr('src', '');
    });

    $('#modalCargaResultado').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var idExamen = button.data('id');
        var idMuestra = button.data('muestra');
        var nroOrden = $('#nroOrdenModal').val(); // Obtén el número de orden
        var edad = $('#edad').val(); // Suponiendo que tienes el campo edad en la vista
        var sexo = $('#sexo').val(); // Suponiendo que tienes el campo sexo en la vista

        var modal = $(this);
        modal.find('#idExamenModal').val(idExamen);
        modal.find('#idMuestraModal').val(idMuestra);
        modal.find('#nroOrdenModal').val(nroOrden);

        $.ajax({
            url: `/obtener-determinantes/${idExamen}`,
            type: 'GET',
            success: function (determinantes) {
                var tbody = modal.find('#determinantesTabla');
                tbody.empty();
                determinantes.forEach(function (det) {
                    $.ajax({
                        url: `/obtener-valores-referencia/${det.idDeterminantes}`,
                        type: 'GET',
                        data: { edad: edad, sexo: sexo },
                        success: function (valores) {
                            var row = `
                                <tr>
                                    <td>${det.nombre}</td>
                                    <td>${det.unidadMedida}</td>
                                    <td>
                                        <input type="number" step="any" name="valores[${det.idDeterminantes}]" class="form-control" required>
                                    </td>
                                    <td>${valores.length > 0 ? valores[0].valorMin : 'N/A'}</td>
                                    <td>${valores.length > 0 ? valores[0].valorMax : 'N/A'}</td>
                                </tr>
                            `;
                            tbody.append(row);
                        },
                        error: function (error) {
                            console.error('Error al obtener valores de referencia:', error);
                            alert('Hubo un problema al cargar los valores de referencia. Inténtalo de nuevo.');
                        }
                    });
                });
            },
            error: function (error) {
                console.error('Error al cargar determinantes:', error);
                alert('Hubo un problema al cargar los determinantes. Inténtalo de nuevo.');
            }
        });
    });

    $('#btnGuardarResultados').on('click', function () {
        Swal.fire({
            title: 'Confirmar',
            text: '¿Estás seguro de que deseas guardar los resultados?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                guardarResultados();
            }
        });
    });

    function guardarResultados() {
        console.log('Se ha presionado el botón "Guardar Resultados"');

        var formData = $('#formCargaResultado').serializeArray();
        var data = {};
        formData.forEach(function (item) {
            if (item.name.startsWith('valores')) {
                if (!data.valores) {
                    data.valores = {};
                }
                var idDeterminante = item.name.match(/\[(.*)\]/)[1];
                data.valores[idDeterminante] = item.value;
            } else {
                data[item.name] = item.value;
            }
        });

        console.log('Datos a enviar:', JSON.stringify(data));

        $.ajax({
            url: '/cargar-resultado',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                idMuestra: data.idMuestra,
                idExamen: data.idExamen,
                nroOrden: data.nroOrden,
                valores: convertirNumeros(data.valores) // función para convertir a números
            }),
            success: function (response) {
                console.log('Respuesta del servidor:', response);
                Swal.fire({
                    icon: 'success',
                    title: 'Resultados guardados',
                    text: 'Los resultados se guardaron exitosamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    $('#modalCargaResultado').modal('hide');
                    window.location.reload(); // Recargar la página
                });
            },
            error: function (error) {
                console.error('Error al cargar el resultado:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar los resultados. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }

    // Función para convertir los valores a números
    function convertirNumeros(valores) {
        const valoresNumeros = {};
        for (const key in valores) {
            if (valores.hasOwnProperty(key)) {
                valoresNumeros[key] = parseFloat(valores[key]);
            }
        }
        return valoresNumeros;
    }

    $('#modalVerResultado').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var idMuestra = button.data('muestra');
        var modal = $(this);

        $.ajax({
            url: `/obtenerResultados/${idMuestra}`,
            type: 'GET',
            success: function (resultados) {
                var tbody = modal.find('#verResultados');
                tbody.empty();
                resultados.forEach(function (resultado) {
                    var row = `
                        <tr>
                            <td>${resultado.determinante}</td>
                            <td>${resultado.unidadMedida}</td>
                            <td>${resultado.valor}</td>
                            <td>${resultado.valorMin}</td>
                            <td>${resultado.valorMax}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });

                // Verificar si la orden está para validar y mostrar el botón de validar
                if (orden.estado === 'para validar') {
                    $('#btnValidarResultados').show();
                } else {
                    $('#btnValidarResultados').hide();
                }
            },
            error: function (error) {
                console.error('Error al cargar resultados:', error);
                console.log('Hubo un problema al cargar los resultados. Inténtalo de nuevo.');
            }
        });

        // Agregar evento para el botón de validar
        $('#btnValidarResultados').off('click').on('click', function () {
            Swal.fire({
                title: 'Confirmar',
                text: '¿Estás seguro de que deseas validar los resultados?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, validar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    validarResultados(idMuestra);
                }
            });
        });
    });

    function validarResultados(idMuestra) {
        $.ajax({
            url: '/validar-resultado',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ idMuestra: idMuestra }),
            success: function (response) {
                console.log('Respuesta del servidor:', response);
                Swal.fire({
                    icon: 'success',
                    title: 'Resultados validados',
                    text: 'Los resultados se validaron exitosamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    $('#modalVerResultado').modal('hide');
                    window.location.reload(); // Recargar la página
                });
            },
            error: function (error) {
                console.error('Error al validar el resultado:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al validar los resultados. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
});

