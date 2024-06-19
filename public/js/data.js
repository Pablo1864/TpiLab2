let dataTable;
let dataTableIsInitialized = false;
let idExamenAEliminar = null;

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
        { data: "idExamenes", title: "Codigo del examen" },
        { data: "nombre", title: "Nombre" },
        { data: "requerimiento", title: "Requerimiento" },
        { data: "horaDemora", title: "Horas demora" },
        { data: "tipoAnalisis", title: "Tipo de analisis" },
        {
            defaultContent: `
                <button type='button' class='editar btn btn-primary'>
                    <i class='bi bi-pencil-fill'></i>
                </button>
                <button type='button' class='eliminar btn btn-danger' data-bs-toggle='modal' data-bs-target='#modalEliminar'>
                    <i class='bi bi-trash-fill text-light'></i>
                </button>`
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

    $(document).ready(function () {
        $('#datatable_exams tbody').on('click', 'button.editar', function () {
            const data = dataTable.row($(this).parents('tr')).data();
            console.log('Data obtenida para edición:', data); // Verifica que los campos requerimiento y tipoAnalisis están presentes

            // Asigna los valores a los campos del modal
            $('#idExamen').val(data.idExamenes);
            $('#nombre').val(data.nombre);
            $('#requerimiento').val(data.requerimiento || "");  // Asegúrate de manejar valores nulos o indefinidos
            $('#horaDemora').val(data.horaDemora);
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


    });

    dataTableIsInitialized = true;
};

const listExams = async () => {
    try {
        const response = await fetch("/buscarexamen");
        const exams = await response.json();
        console.log(exams);  // Agrega esto para verificar los datos
        dataTable.rows.add(exams).draw();
    } catch (ex) {
        console.log(ex);
    }
};

window.addEventListener("load", async () => {
    await initDataTable();
});

// envío del formulario de creación de examen
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
