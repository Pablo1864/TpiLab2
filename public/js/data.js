let dataTableIsInitialized = false;
let idExamenAEliminar = null;
let idExamenSeleccionado = null;
let determinantElement;

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

            fecha.textContent = `${fechaFormateada} ${horaFormateada}`;
        });
    }

    // Llama a la función para formatear fechas
    formatearFechas();
});

const dataTableOptions = {
    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
    pageLength: 10,
    destroy: true,
    columns: [
        { data: "idExamenes", title: "Código del examen" },
        { data: "nombre", title: "Nombre" },
        { data: "requerimiento", title: "Requerimiento" },
        { data: "diasDemora", title: "Horas demora" },
        { data: "tipoAnalisis", title: "Tipo de análisis" },
        {
            defaultContent: `
                <button type='button' class='editar btn btn-primary'>
                    <i class='bi bi-pencil-fill'></i>
                </button>
                <button type='button' class='eliminar btn btn-danger' data-bs-toggle='modal' data-bs-target='#modalEliminar'>
                    <i class="bi bi-trash-fill"></i>
                </button>
                <button type="button" class="cargaDeterminante btn">
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.883 3.007L12 3a1 1 0 0 1 .993.883L13 4v7h7a1 1 0 0 1 .993.883L21 12a1 1 0 0 1-.883.993L20 13h-7v7a1 1 0 0 1-.883.993L12 21a1 1 0 1 1-.993-.883L11 20v-7H4a1 1 0 1 1-.883-.993L4 11h7V4a1 1 0 1 1 .883-.993L12 3l-.117.007Z" fill="#212121"/>
                </svg>
                </button>
            `
        }
    ],
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún examen encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún examen encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar:  ",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
        }
    },
};

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }
    dataTable = $("#datatable_exams").DataTable(dataTableOptions);
    await listExams();

    $('#datatable_exams tbody').on('click', 'button.eliminar', function () {
        const data = dataTable.row($(this).parents('tr')).data();
        idExamenAEliminar = data.idExamenes;
        $('#modalEliminar').modal('show');

        $('#btnConfirmarEliminar').off('click').on('click', function () {
            $.ajax({
                type: 'POST',
                url: `/eliminarExamen/${idExamenAEliminar}`,
                success: function (response) {
                    window.location.reload();
                },
                error: function (error) {
                    console.error('Error al eliminar el examen:', error);
                    alert('Error al eliminar el examen');
                }
            });
        });

        $('#btnCancelarEliminar').off('click').on('click', function () {
            $('#modalEliminar').modal('hide');
        });
    });

    dataTableIsInitialized = true;
};

const listExams = async () => {
    try {
        const response = await fetch('/buscarexamen');
        const data = await response.json();
        dataTable.clear();
        dataTable.rows.add(data);
        dataTable.draw();
    } catch (error) {
        console.error('Error al listar los exámenes:', error);
    }
};

$(document).ready(function () {
    // Inicializa la DataTable
    initDataTable();

    $('#datatable_exams tbody').on('click', 'button.editar', function () {
        const data = dataTable.row($(this).parents('tr')).data();
        console.log('Data obtenida para edición:', data); // Verifica que los campos requerimiento y tipoAnalisis están presentes

        // Asigna los valores a los campos del modal
        $('#idExamen').val(data.idExamenes);
        $('#nombre').val(data.nombre);
        $('#requerimiento').val(data.requerimiento || "");  // Asegúrate de manejar valores nulos o indefinidos
        $('#diasDemora').val(data.diasDemora);
        $('#tipoAnalisis').val(data.tipoAnalisis || "");  // Asegúrate de manejar valores nulos o indefinidos

        $('#modalEditar').modal('show');
    });

    $('#btnGuardarCambios').on('click', function (e) {
        e.preventDefault();
        const formData = $('#editarExamenForm').serialize();

        Swal.fire({
            title: 'Confirmar',
            text: '¿Estás seguro de que deseas guardar los cambios?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'POST',
                    url: `/editarExamen/${$('#idExamen').val()}`,
                    data: formData,
                    success: function (response) {
                        Swal.fire('Guardado', 'Cambios guardados exitosamente', 'success').then(() => {
                            $('#modalEditar').modal('hide');
                            window.location.reload();
                        });
                    },
                    error: function (error) {
                        console.error('Error al guardar cambios:', error);
                        Swal.fire('Error', 'Error al guardar cambios', 'error');
                    }
                });
            }
        });
    });

    $('#modalCrearExamen').on('show.bs.modal', function () {
        $('#crearExamenForm').trigger('reset');
    });

    // Envío del formulario de creación de examen
    $('#crearExamenForm').on('submit', function (e) {
        e.preventDefault();
        const formData = $(this).serialize();

        Swal.fire({
            title: 'Confirmar',
            text: '¿Estás seguro de que deseas crear este examen?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'POST',
                    url: '/nuevo-examen',
                    data: formData,
                    success: function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Examen creado',
                            text: response.message,
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            $('#modalCrearExamen').modal('hide');
                            window.location.reload();
                        });
                    },
                    error: function (error) {
                        console.error('Error al crear el examen:', error);
                        const errorMessage = error.responseJSON && error.responseJSON.message ? error.responseJSON.message : 'Error al crear el examen';
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: errorMessage,
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    });




    $('#datatable_exams tbody').on('click', 'button.cargaDeterminante', function () {
        const data = dataTable.row($(this).parents('tr')).data();
        idExamenSeleccionado = data.idExamenes;

        const container = $('#determinantsContainer');
        container.empty();

        fetch(`/obtener-determinantes/${idExamenSeleccionado}`)
            .then(response => response.json())
            .then(determinantes => {
                determinantes.forEach(det => {
                    const determinantHtml = `
                        <div class="form-group determinant" data-id-determinante="${det.idDeterminantes}">
                            <label for="determinantName">Nombre del Determinante:</label>
                            <input class="determinantName form-control" type="text" name="determinantes[][nombre]" value="${det.nombre}" required>
                            <label for="determinantValue">Unidad de Medida:</label>
                            <input class="determinantValue form-control" type="text" name="determinantes[][unidadMedida]" value="${det.unidadMedida}" required>
                            <button class="btn btn-success btnAddValorReferencia" type="button">Agregar Valor de Referencia</button>
                            <button class="btn btn-danger btnRemoveDeterminant" type="button">Quitar</button>
                        </div>
                    `;
                    container.append(determinantHtml);
                });

                $('#modalDeterminantes').modal('show');
            })
            .catch(error => console.error('Error al cargar determinantes:', error));
    });

    // Manejo del clic en el botón "Añadir Determinante"
    $('#btnAddDeterminant').on('click', function () {
        const container = $('#determinantsContainer');
        const determinantHtml = `
            <div class="form-group determinant">
                <label for="determinantName">Nombre del Determinante:</label>
                <input class="determinantName form-control" type="text" name="determinantes[][nombre]" required>
                <label for="determinantValue">Unidad de Medida:</label>
                <input class="determinantValue form-control" type="text" name="determinantes[][unidadMedida]" required>
                <button class="btn btn-success btnAddValorReferencia" type="button">Agregar Valor de Referencia</button>
                <button class="btn btn-danger btnRemoveDeterminant" type="button">Quitar</button>
            </div>
        `;
        container.append(determinantHtml);
    });

    // Manejo del clic en el botón "Agregar Valor de Referencia" de un determinante
    $('#determinantsContainer').on('click', '.btnAddValorReferencia', function () {
        idDeterminanteSeleccionado = $(this).closest('.determinant').data('id-determinante');
        $('#modalValoresReferencia').modal('show');
    });










    // Manejo del clic en el botón "Quitar" de un determinante
    $('#determinantsContainer').on('click', '.btnRemoveDeterminant', function () {
        const determinantElement = $(this).closest('.determinant');

        // Verificar si el elemento tiene un ID válido o está vacío
        if (determinantElement.data('id-determinante') || determinantElement.find('.determinantName').val() || determinantElement.find('.determinantValue').val()) {
            $('#modalEliminarDeterminante').modal('show');
            $('#btnConfirmarEliminarDeterminante').data('id-determinante', determinantElement.data('id-determinante'));
        } else {
            // Si el elemento no tiene un ID o está vacío, eliminarlo directamente
            determinantElement.remove();
        }
    });

    // Confirmación de eliminación de determinante
    $('#btnConfirmarEliminarDeterminante').on('click', function () {
        const idDeterminanteAEliminar = $(this).data('id-determinante');

        if (idDeterminanteAEliminar) {
            $.ajax({
                type: 'POST',
                url: `/eliminarDeterminantes/${idDeterminanteAEliminar}`,
                success: function (response) {
                    $('#modalEliminarDeterminante').modal('hide');
                    $(`[data-id-determinante="${idDeterminanteAEliminar}"]`).remove();
                },
                error: function (error) {
                    console.log('Error al eliminar el determinante:', error);
                }
            });
        } else {
            $('#modalEliminarDeterminante').modal('hide');
            // Si no hay ID, eliminar directamente del DOM
            $('.determinant[data-id-determinante=""]').remove();
        }
    });

    // Manejo del clic en el botón "Guardar" del modal de determinantes
    $('#btnGuardarDeterminantes').on('click', function () {
        const nuevosDeterminantes = [];
        const determinantesActualizados = [];

        $('#determinantsContainer .determinant').each(function () {
            const nombre = $(this).find('.determinantName').val();
            const unidadMedida = $(this).find('.determinantValue').val();
            const idDeterminante = $(this).data('id-determinante');

            if (idDeterminante) {
                determinantesActualizados.push({ idDeterminante, nombre, unidadMedida });
            } else {
                nuevosDeterminantes.push({ nombre, unidadMedida });
            }
        });

        const params = new URLSearchParams();
        params.append('idExamen', idExamenSeleccionado);
        params.append('nuevosDeterminantes', JSON.stringify(nuevosDeterminantes));
        params.append('determinantesActualizados', JSON.stringify(determinantesActualizados));

        Swal.fire({
            title: 'Confirmar',
            text: '¿Estás seguro de que deseas guardar los determinantes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/agregarDeterminantes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire('Guardado', 'Determinantes agregados/actualizados exitosamente', 'success').then(() => {
                            $('#modalDeterminantes').modal('hide');
                            window.location.reload();
                        });
                    })
                    .catch(error => {
                        console.error('Error al agregar/actualizar determinantes:', error);
                        Swal.fire('Error', 'Error al agregar/actualizar determinantes', 'error');
                    });
            }
        });
    });


    $('#determinantsContainer').on('click', '.btnAddValorReferencia', function () {
        idDeterminanteSeleccionado = $(this).closest('.determinant').data('id-determinante');
        const container = $('#valoresReferenciaContainer');
        container.empty();

        fetch(`/obtener-valores-referencia/${idDeterminanteSeleccionado}`)
            .then(response => response.json())
            .then(valoresReferencia => {
                valoresReferencia.forEach(valor => {
                    const valorReferenciaHtml = `
                        <div class="form-group valor-referencia" data-id-valor-referencia="${valor.idValorReferencias}">
                            <label for="valorMin">Valor de Referencia Mínimo:</label>
                            <input type="number" step="0.01" class="form-control valorMin" name="valorMin[]" value="${valor.valorMin}" required>
                            <label for="valorMax">Valor de Referencia Máximo:</label>
                            <input type="number" step="0.01" class="form-control valorMax" name="valorMax[]" value="${valor.valorMax}" required>
                            <label for="edadMin">Edad Mínima:</label>
                            <input type="number" class="form-control edadMin" name="edadMin[]" value="${valor.edadMin}" required>
                            <label for="edadMax">Edad Máxima:</label>
                            <input type="number" class="form-control edadMax" name="edadMax[]" value="${valor.edadMax}" required>
                            <label for="sexo">Sexo:</label>
                            <select class="form-control sexo" name="sexo[]" required>
                                <option value="masculino" ${valor.sexo === 'masculino' ? 'selected' : ''}>Masculino</option>
                                <option value="femenino" ${valor.sexo === 'femenino' ? 'selected' : ''}>Femenino</option>
                                <option value="ambos" ${valor.sexo === 'ambos' ? 'selected' : ''}>Ambos</option>
                            </select>
                            <label for="embarazada">Embarazada:</label>
                            <select class="form-control embarazada" name="embarazada[]">
                                <option value="0" ${valor.embarazada === 0 ? 'selected' : ''}>No</option>
                                <option value="1" ${valor.embarazada === 1 ? 'selected' : ''}>Sí</option>
                            </select>
                            <button type="button" class="btn btn-danger btnRemoveValorReferencia">Quitar</button>
                        </div>
                    `;
                    container.append(valorReferenciaHtml);
                });

                $('#modalValoresReferencia').modal('show');
            })
            .catch(error => console.error('Error al cargar valores de referencia:', error));
    });

    // Manejo del clic en el botón "Añadir Valor de Referencia" en el modal
    $('#btnAddValorReferencia').on('click', function () {
        const container = $('#valoresReferenciaContainer');
        const valorReferenciaHtml = `
            <div class="form-group valor-referencia">
                <label for="valorMin">Valor de Referencia Mínimo:</label>
                <input type="number" step="0.01" class="form-control valorMin" name="valorMin[]" required>
                <label for="valorMax">Valor de Referencia Máximo:</label>
                <input type="number" step="0.01" class="form-control valorMax" name="valorMax[]" required>
                <label for="edadMin">Edad Mínima:</label>
                <input type="number" class="form-control edadMin" name="edadMin[]" required>
                <label for="edadMax">Edad Máxima:</label>
                <input type="number" class="form-control edadMax" name="edadMax[]" required>
                <label for="sexo">Sexo:</label>
                <select class="form-control sexo" name="sexo[]" required>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="ambos">Ambos</option>
                </select>
                <label for="embarazada">Embarazada:</label>
                <select class="form-control embarazada" name="embarazada[]">
                    <option value="0">No</option>
                    <option value="1">Sí</option>
                </select>
                <button type="button" class="btn btn-danger btnRemoveValorReferencia">Quitar</button>
            </div>
        `;
        container.append(valorReferenciaHtml);
    });

    // Manejo del clic en el botón "Quitar" de un valor de referencia
    $('#valoresReferenciaContainer').on('click', '.btnRemoveValorReferencia', function () {
        $(this).closest('.valor-referencia').remove();
    });

    // Manejo del clic en el botón "Guardar" del modal de valores de referencia
    $('#btnGuardarValoresReferencia').on('click', function () {
        const nuevosValoresReferencia = [];
        const valoresReferenciaActualizados = [];

        $('#valoresReferenciaContainer .valor-referencia').each(function () {
            const valorMin = $(this).find('.valorMin').val();
            const valorMax = $(this).find('.valorMax').val();
            const edadMin = $(this).find('.edadMin').val();
            const edadMax = $(this).find('.edadMax').val();
            const sexo = $(this).find('.sexo').val();
            const embarazada = $(this).find('.embarazada').val();
            const idValorReferencia = $(this).data('id-valor-referencia');

            if (idValorReferencia) {
                valoresReferenciaActualizados.push({ idValorReferencia, valorMin, valorMax, edadMin, edadMax, sexo, embarazada });
            } else {
                nuevosValoresReferencia.push({ valorMin, valorMax, edadMin, edadMax, sexo, embarazada });
            }
        });

        const params = new URLSearchParams();
        params.append('idDeterminante', idDeterminanteSeleccionado);
        params.append('nuevosValoresReferencia', JSON.stringify(nuevosValoresReferencia));
        params.append('valoresReferenciaActualizados', JSON.stringify(valoresReferenciaActualizados));

        console.log('Datos a enviar:', params.toString()); // Verificar los datos antes de enviarlos

        fetch('/agregarValoresReferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        })
            .then(response => response.json())
            .then(data => {
                alert('Valores de referencia agregados/actualizados exitosamente');
                $('#modalValoresReferencia').modal('hide');
            })
            .catch(error => {
                console.error('Error al agregar/actualizar valores de referencia:', error);
                alert('Error al agregar/actualizar valores de referencia');
            });
    });

});