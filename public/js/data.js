let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    // scrollX: "2000px",
    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
    // columnDefs: [
    //     { className: "centered", targets: [0, 1, 2, 3, 4] },
    //     { orderable: false, targets: [4] },
    //     { searchable: false, targets: [1] },
    //     // { width: "50%", targets: [0] }
    // ],
    pageLength: 10, // Cambia 10 para mostrar 10 registros por página
    destroy: true,
    columns: [{ data: "detail", title: "descripcion" }, { data: "id", visible: false, title: " " }
        , { data: "status", title: "estado" }],
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún examen encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún examen encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar:",
        loadingRecords: "Cargando...",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
        },
    },
};

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }
    dataTable = $("#datatable_exams").DataTable(dataTableOptions);
    await listExams(); // Llama a la función listExams



    dataTableIsInitialized = true;
};

const listExams = async () => {
    try {
        // Realiza una solicitud para obtener los exámenes desde tu API o recurso de datos
        const response = await fetch("/buscarexamen"); // Ajusta la ruta de la API
        const exams = await response.json();

        dataTable.rows.add(exams).draw();





        // let content = ``;
        // exams.forEach((exam, index) => {
        //     content += `
        //         <tr>
        //             <td>${index + 1}</td>
        //             <td>${exam.nbu}</td>
        //             <td>${exam.detail}</td>
        //             <td>${exam.sample_type_name}</td>
        //             <td>${exam.status ? "Activo" : "Inactivo"}</td>
        //         </tr>`;
        // });
        // Agrega las filas generadas al cuerpo de la tabla en examen.pug
        //$('#datatable_exams tbody').html(content);
        //document.querySelector('#datatable_exams tbody').innerHTML = content;
    } catch (ex) {
        console.log(ex);
    }
};

window.addEventListener("load", async () => {
    await initDataTable();
});
