const config = (dataSingular, dataPlural) => {
    return {
        lengthMenu: `Mostrar _MENU_ ${dataPlural} por página`,
        zeroRecords: `Ningún ${dataSingular} agregado`,
        info: `Mostrando de _START_ a _END_ de _TOTAL_ ${dataPlural}`,
        infoEmpty: `Ningún ${dataSingular} agregado`,
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar:",
        loadingRecords: "Cargando...",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
        }
    }
}

document.getElementById('ordenesInput').addEventListener('input', (event) => {
    const input = event.target;
    const div = document.getElementById('divOrdenesError');
    if (verificar(input) == 'error' || verificar(input) == 'email') {
        if (!div.querySelector('p')) {
            const p = document.createElement('p');
            p.classList.add('form-text');
            p.classList.add('text-danger');
            p.innerHTML = 'Debe ingresar solo numeros para buscar por ID, solo letras para apellido de paciente, o dejar el campo vacio para una busqueda general.';
            div.appendChild(p);
        }
    } else {
        div.innerHTML = '';
    };
})

$(document).ready(function () {

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        //add class for better styling
    })

    function formatDateT(stringDate) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const dateFormateada = new Date(stringDate).toLocaleString(undefined, options);
        return dateFormateada.replace(', ', ' ').replace(/\//g, '-').replace(/,/, '');
    }

    const tableOrdenes = $('#table_ordenes').DataTable({
        language: config('orden', 'ordenes'),
        select: false,
        responsive: true,
        columns: [
            { title: 'Orden', data: 'nroOrden', responsivePriority: 1 },
            {
                title: 'Paciente:',
                data: null,
                render: function (data, type, row) {
                    return data.nombrePaciente + ', ' + data.apellidoPaciente;
                },
                responsivePriority: 1,
            },
            { title: 'Dni del paciente:', data: 'dni', responsivePriority: 2 },
            { title: 'estado de la orden:', data: 'estado', responsivePriority: 3 },
            {
                title: 'Medico',
                data: null, render: function (data, type, row) {
                    return data.nombreMedico + ', ' + data.apellidoMedico;
                }, responsivePriority: 5
            },
            {
                title: 'muestras en espera:', data: null, responsivePriority: 9, render: function (data, type, row) {
                    return data.muestrasEnEspera === 1 ? 'si' : 'no';
                }
            },
            {
                title: 'fecha de creacion:', data: null, responsivePriority: 8, render: function (data, type, row) {
                    return formatDateT(data.fechaCreacion);
                }
            },
            /* {
                title: 'fecha de resultados aprox:', data: null, responsivePriority: 8, render: function (data, type, row) {
                    return formatDateT(data.fechaAprox);
                }
            }, */
            {
                title: 'Acciones', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function (data) {
                    let dataLower = data.estado.toLowerCase();
                    let editable = dataLower == 'ingresada' || dataLower == 'esperando toma de muestra' || dataLower == 'analitica' ? '' : 'disabled';
                    return '<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto edit-button"' + editable + '> <i class="bi bi-pencil-square me-2" aria-hidden="true"></i> Editar </button><button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto add-samples-button"> <i class="bi bi-plus-circle me-2" aria-hidden="true"></i> añadir Muestras </button><button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto delete-button"> <i class="bi bi-x-circle me-2" aria-hidden="true"></i> Eliminar </button>';
                }
            }
        ]
    });

    $('#table_ordenes tbody').on('click', '.delete-button', async function () {
        const ordenId = tableOrdenes.row($(this).parents('tr')).data().nroOrden;
        const { value: razon } = await Swal.fire({
            title: '¿Esta seguro que desea cancelar la orden nro ' + ordenId + '?',
            input: 'textarea',
            //inputLabel: "Razon por la que desea cancelar:",
            text: 'Ingrese la razon por que desea cancelar la orden',
            inputPlaceholder: 'razon por la que se desea cancelar la orden',
            inputAttributes: {
                maxlength: "300", autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: 'Si, cancelar!',
            cancelButtonText: 'No!',
            focusConfirm: false,
            inputValidator: (value) => {
                if (!(value.trim().length > 0 && value)) {
                    return 'Debe ingresar una razon por la que desea cancelar la orden!'
                }
            }
        });
        let data = '';

        if (razon) {
            try {
                const eliminar = await fetch(`/cancelarOrden/${ordenId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ razon: razon }),
                });
                data = await eliminar.json();
                console.log(data);
            } catch (err) {
                Swal.fire('No se cancelo la orden');
            }
            if (data != '') {
                if (data.affectedRows > 0) {
                    Swal.fire('La orden fue cancelada con éxito!');
                    tableOrdenes.row($(this).parents('tr')).remove().draw();
                }

            }

        }
    })

    $('#table_ordenes tbody').on('click', '.add-samples-button', async function () {
        const ordenId = tableOrdenes.row($(this).parents('tr')).data().nroOrden;
        let data = [];
        let arrayCheckboxes;
        let errArr = [];
        try {
            const res = await fetch(`/buscarMuestraNecesariasPorOrden/${ordenId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            data = await res.json();
            console.log(data);
        } catch (err) {
            errArr.push(err);
            await Toast.fire({ //to test
                icon: 'error',
                title: 'Error al buscar las muestras!',
                text: errArr.join(', ')
            });
        }
        if (data.length > 0) {
            try {
                console.log(data);
                const arrayCheckboxes = data.map(ex => ex.tipoAnalisis);
                const checkboxesHtml = arrayCheckboxes.map(op=> 
                    `<input class="form-check-input" type="checkbox" id="${op}" name="${op}">
                    <label class="form-check-label" for="${op}">${op}</label><br>`
                ).join('');
                console.log(arrayCheckboxes);
                console.log(checkboxesHtml);
                const { value: muestracheck } = await Swal.fire({
                    title: 'Muestras requeridas para la orden nro ' + ordenId,
                    html: `<div class="form-check text-start"><p>Marque las muestras que desea ingresar: </p>${checkboxesHtml}<div>`,
                    //inputPlaceholder: 'Seleccione las muestras:',
                    focusConfirm: false,
                    preConfirm:()=>{
                        const selectedCheckboxes=[];
                        arrayCheckboxes.forEach((op)=>{
                            if(document.getElementById(op).checked){
                                selectedCheckboxes.push(op);
                            }
                        });
                        return selectedCheckboxes;
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Imprimir las muestras ingresadas',
                    cancelButtonText: 'Cancelar',
                });

                if (muestracheck) {
                    await Toast.fire({
                        icon: 'success',
                        title: 'Muestras seleccionadas: ',
                        text: muestracheck.join(', ')
                    });
                    //await Swal.fire({
                     //   title: 'Muestras seleccionadas: ',
                       // text: muestracheck.join(', '),
                        //icon: 'success'
                    //});

                };
            } catch (err) {
                console.error(err);
            }
        };
    });
    let pExam = document.createElement('p');
    pExam.classList = 'form-text text-danger';
    pExam.innerText = 'No se encontraron ordenes, pruebe con otro id, apellido de paciente, o busque todos dejando la caja vacia y filtre desde allí.';
    document.getElementById('buscarOrdenes').addEventListener('click', () => {
        buscarOrdenes(tableOrdenes, 'ordenesInput', pExam, 'divOrdenesError');
    })

})

async function manejarFetch(route, table, fun, element, containerIdError) {
    try {
        const res = await fetch(route);
        if (!res.ok) {
            throw new Error('Network response was not ok... :c');
        }
        const data = await res.json();
        fun(table, data, element, containerIdError);
    } catch (err) {
        console.error('Error:', err);
    }
}

const llenarTableYagregarErrores = (table, data, element, containerIdError) => {
    const container = document.getElementById(containerIdError);
    container.innerHTML = '';
    if (data.length > 0) {
        llenarTableConData(table, data);
        console.log('lleno tabla');
    } else {
        container.appendChild(element);
    }
}
const llenarTableConData = (table, data) => {

    try {
        table.clear();
        table.rows.add(data).draw();
        table.columns.adjust().draw();
        table.responsive.recalc().draw();
    } catch (err) {
        console.log(err);
    }

}

const verificar = (input) => {
    input.classList.remove('error');
    input.classList.remove('correct');
    if (input.value.trim() != '') {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexNumber = /^[0-9]+$/;
        const regexLetters = /^[a-zA-Z]+$/;
        if (regexEmail.test(input.value)) {
            input.classList.add('correct');
            return 'mail';
        } else if (regexLetters.test(input.value)) {
            input.classList.add('correct');
            return 'string';
        } else if (regexNumber.test(input.value)) {
            input.classList.add('correct');
            return 'number';
        } else {
            input.classList.add('error');
        }
    } else {
        input.classList.add('correct');
        return 'vacio';
    }
    return 'error';
}

async function buscarOrdenes(table, inputId, element, containerIdError) {
    const input = document.getElementById(inputId);
    switch (verificar(input)) {
        case 'number': //busca por id
            manejarFetch(`/ordenes/buscarOrdenesPorId/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
            break;
        case 'string': //busca por nombre o termino
            manejarFetch(`/ordenes/buscarOrdenesPorApellido/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
            break;
        case 'vacio': //trae todo
            manejarFetch(`/Ordenes/buscarOrdenesTodas`, table, llenarTableYagregarErrores, element, containerIdError);
            break;
        default: //si se ingresa un valor invalido, mi input listener lo mostrara desde antes
            break;
    }
}