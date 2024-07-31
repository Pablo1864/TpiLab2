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

        $.ajax({
            type: 'POST',
            url: `/editarExamen/${$('#idExamen').val()}`,
            data: formData,
            success: function (response) {
                alert('Cambios guardados exitosamente');
                $('#modalEditar').modal('hide');
                window.location.reload();
            },
            error: function (error) {
                console.error('Error al guardar cambios:', error);
                alert('Error al guardar cambios');
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

        $.ajax({
            type: 'POST',
            url: '/nuevo-examen',
            data: formData,
            success: function (response) {
                alert(response.message);
                $('#modalCrearExamen').modal('hide');
                window.location.reload();
            },
            error: function (error) {
                console.error('Error al crear el examen:', error);
                const errorMessage = error.responseJSON && error.responseJSON.message ? error.responseJSON.message : 'Error al crear el examen';
                alert(errorMessage);
            }
        });
    });


    // Manejo del clic en el botón de carga de determinantes
    $('#datatable_exams tbody').on('click', 'button.cargaDeterminante', function () {
        const data = dataTable.row($(this).parents('tr')).data();
        idExamenSeleccionado = data.idExamenes; // Obtener el ID del examen seleccionado

        // Limpiar el contenedor de determinantes antes de agregar los existentes
        const container = $('#determinantsContainer');
        container.empty(); // Limpiar el contenedor antes de añadir los determinantes existentes

        // Obtener los determinantes existentes y mostrarlos en el modal
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
                            <button class="btn btn-danger btnRemoveDeterminant" type="button">Quitar</button>
                        </div>
                    `;
                    container.append(determinantHtml);
                });

                $('#modalDeterminantes').modal('show');
            })
            .catch(error => {
                console.error('Error al cargar determinantes:', error);
            });
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
                <button class="btn btn-danger btnRemoveDeterminant" type="button">Quitar</button>
            </div>
        `;
        container.append(determinantHtml);
    });

    // Manejo del clic en el botón "Quitar" de un determinante
    $('#determinantsContainer').on('click', '.btnRemoveDeterminant', function () {
        determinantElement = $(this).closest('.determinant');
        $('#modalEliminarDeterminante').modal('show');
    });

    // Confirmación de eliminación de determinante
    $('#btnConfirmarEliminarDeterminante').on('click', function () {
        const idDeterminanteAEliminar = determinantElement.data('id-determinante');

        if (idDeterminanteAEliminar) {
            $.ajax({
                type: 'POST',
                url: `/eliminarDetermintes/${idDeterminanteAEliminar}`,
                success: function (response) {
                    $('#modalEliminarDeterminante').modal('hide');
                    determinantElement.remove();
                },
                error: function (error) {
                    console.log('Error al eliminar el determinantessss:', error);
                }
            });
        } else {
            determinantElement.remove();
            $('#modalEliminarDeterminante').modal('hide');
        }
    });

    // Cancelar eliminación
    $('#btnCancelarEliminar').on('click', function () {
        $('#modalEliminarDeterminante').modal('hide');
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

        fetch('/agregarDeterminantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        })
            .then(response => response.json())
            .then(data => {
                alert('Determinantes agregados/actualizados exitosamente');
                $('#modalDeterminantes').modal('hide');
                window.location.reload();
            })
            .catch(error => {
                console.error('Error al agregar/actualizar determinantes:', error);
                alert('Error al agregar/actualizar determinantes');
            });
    });
});
