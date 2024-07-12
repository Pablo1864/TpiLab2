import { Toast, agregarRow } from './common.js'

$(document).ready(function () {

    //Aqui esta todo lo que tiene que ver con inicializar datatables
    //Y inicializar los botones de fetchear data para cada table + llenar table con data
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
   
    function btnInit(inputId, erroresId, errorMessage, fun){
        $("#"+inputId).on('input', function (event) {
            const input = event.target;
            console.log(input.value);
            const div = $('#'+erroresId);
            div.empty();
            if (fun(input) === 'error') {
                if (!div.find('p').length) {
                    const p = $('<p>')
                        .addClass('form-text text-danger')
                        .html(errorMessage);
                    div.append(p);
                }
            }
        })
    }
    //Devuelve mail, string, number, vacio o error dependiendo del input
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

    btnInit('pacienteID', 'divPacienteError', 'Debe ingresar solo numeros para buscar por DNI, solo letras para apellido o un formato valido de email (nombreEmail@email.com).', verificar);
    //the medic one works funny: it won't add the error message, but will change border color
    btnInit('medicoID', 'divMedicoError', 'Debe ingresar solo numeros para buscar por DNI, solo letras para apellido o un formato valido de email (nombreEmail@email.com).', verificar);
    btnInit('diagnosticoSearch', 'divDiagnosticosError', 'Debe ingresar solo numeros para buscar por ID o solo letras para buscar por nombres o terminos.', verificar);
    btnInit('idExamen', 'divExamenesError', 'Debe ingresar solo numeros para buscar por ID o solo letras para buscar por nombres o terminos.', verificar);

    const tablePacientes = $('#table_patients').DataTable({
        language: config('paciente', 'pacientes'),
        select: 'single',
        responsive: true,
        columns: [
            { title: 'idPaciente', data: 'idPaciente', visible: false, name: 'idPaciente' },
            {
                title: 'Nombre:',
                data: null,
                render: function (data, type, row) {
                    return data.nombre + ', ' + data.apellido;
                },
                responsivePriority: 1,
            },
            { title: 'Dni:', data: 'dni', responsivePriority: 2 },
            { title: 'Sexo:', data: 'sexo', responsivePriority: 3 },
            { title: 'Fecha de nacimiento:', data: 'fechaNacimiento', responsivePriority: 4 },
            {
                title: 'Provincia, localidad',
                data: null, render: function (data, type, row) {
                    return data.provincia + ', ' + data.localidad;
                }, responsivePriority: 5
            },
            { title: 'Domicilio:', data: 'domicilio', responsivePriority: 9 },
            { title: 'Telefono:', data: 'telefono', responsivePriority: 8 },
            { title: 'Email:', data: 'email', responsivePriority: 10 },
            { title: 'Obra social:', data: 'obraSocial', responsivePriority: 6 },
            { title: 'Nro. Afiliado:', data: 'nroAfiliado', responsivePriority: 7 },
        ]
    });
    const tableMedicos = $('#table_medics').DataTable({
        language: config('medico', 'medicos'),
        select: 'single',
        responsive: true,
        columns: [
            { title: 'idMedico', data: 'idMedico', visible: false, name: 'idMedico' },
            {
                title: 'Nombre:',
                data: null,
                responsivePriority: 1,
                render: function (data, type, row) {
                    return data.nombre + ', ' + data.apellido;
                },
            },
            { title: 'Matricula:', data: 'matricula', responsivePriority: 2 },
            { title: 'email:', data: 'email', responsivePriority: 3 }
        ]
    });
    const tableExamenes = $('#table_examenes').DataTable({
        language: config('examen', 'examenes'),
        rowId: 'idExamenes',
        responsive: true,
        columns: [
            { title: '', data: 'idExamenes', visible: false },
            { title: 'Nombre:', data: 'nombre', responsivePriority: 1 },
            { title: 'Requerimientos:', data: 'requerimiento', responsivePriority: 2 },
            { title: 'Muestra requerida:', data: 'tipoAnalisis', responsivePriority: 3 },
            { title: 'Hs.demora:', data: 'diasDemora', responsivePriority: 4 },
            { title: 'Otros terminos:', data: 'otrosNombres', responsivePriority: 5, className: 'none' },
            {
                title: 'Acciones', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto add-button"> <i class="bi bi-plus-circle me-2" aria-hidden="true"></i> Agregar </button>';
                }
            }
        ]
    });
    const tableAgregados = $('#table_agregados').DataTable({
        language: config('examen', 'examenes'),
        responsive: true,
        rowId: 'idExamenes',
        columns: [
            { title: '', data: 'idExamenes', visible: false, responsivePriority: 1 },
            { title: 'Nombre:', data: 'nombre', responsivePriority: 1 },
            { title: 'Requerimientos:', data: 'requerimiento', responsivePriority: 2 },
            { title: 'Muestra requerida:', data: 'tipoAnalisis', responsivePriority: 3 },
            { title: 'Días de demora:', data: 'diasDemora', responsivePriority: 4 },
            { title: 'Otros terminos:', data: 'otrosNombres', responsivePriority: 5, className: 'none' },
            {
                title: 'Acciones', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-danger m-2 px-3 d-flex flex-row mx-auto delete-agregados-button"> <i class="bi bi-x-circle me-2" aria-hidden="true"></i> Eliminar </button>';
                }
            }]
    });
    const tableDiagnosticos = $('#table_diagnosticos').DataTable({
        language: config('diagnostico', 'diagnosticos'),
        responsive: true,
        rowId: 'idDiagnostico',
        columns: [
            { title: '', data: 'idDiagnostico', visible: false },
            { title: 'Diagnostico', data: 'nombre', responsivePriority: 1 },
            { title: 'Otros terminos', data: 'otrosTerminos', responsivePriority: 3 },
            {
                title: 'Acciones', data: null, responsivePriority: 2, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto add-diagnostico-button"> <i class="bi bi-plus-circle me-2" aria-hidden="true"></i> Agregar </button>';
                }
            },
        ]
    });
    const tableDiagnosticosAgregados = $('#table_diagnosticos_agregados').DataTable({
        language: config('diagnostico', 'diagnosticos'),
        responsive: true,
        rowId: 'idDiagnostico',
        columns: [
            { title: '', data: 'idDiagnostico', visible: false },
            { title: 'Diagnostico', data: 'nombre', responsivePriority: 1 },
            { title: 'Otros terminos', data: 'otrosTerminos', responsivePriority: 3 },
            {
                title: 'Acciones', data: null, responsivePriority: 2, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-danger m-2 px-3 d-flex flex-row mx-auto delete-agregados-button"> <i class="bi bi-trash me-1" aria-hidden="true"></i> Eliminar </button>';
                }
            },
        ]
    });
    const tableMuestras = $('#table_muestras').DataTable({ //format [{idMuestra:ing (array),nombre:string, idExamen:int(array), presentada:bool}]
        language: config('muestra', 'muestras'),
        responsive: true,
        //rowId: 'idMuestra',
        columns: [
            { title: '', data: 'idMuestra', visible: false, orderable: false, searchable: false, name: 'idMuestra', responsivePriority: 1 },
            { title: 'Muestra', data: 'tipo', responsivePriority: 1, name: 'tipoDeMuestra' },
            {
                title: 'Presentada', data: null, responsivePriority: 3, name: 'presentada', render: function (data) {
                    return data.presentada ? 'Si' : 'No';
                }
            },
            { title: 'idExamenes', data: 'idExamenes', responsivePriority: 2, orderable: false, searchable: false, name: 'idExamenes' },
            {
                title: 'Acciones', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function (data) {
                    const presentada = data.presentada;
                    let buttonPresentarCancelar;
                    if (presentada) {
                        buttonPresentarCancelar = `<button type="button" class="btn btn-danger m-2 px-3 d-flex flex-row mx-auto delete-muestra-button"> <i class="bi bi-x-circle me-2" aria-hidden="true"></i> Cancelar </button>`;
                    } else {
                        buttonPresentarCancelar = `<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto add-muestra-button"> <i class="bi bi-plus-circle me-2" aria-hidden="true"></i> Presentar </button>`;
                    }
                    const buttonImprimir = `<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto print-button" ${presentada ? '' : 'disabled'}> <i class="bi bi-printer me-2" aria-hidden="true"></i> Imprimir </button>`;

                    return buttonPresentarCancelar + buttonImprimir;
                }
            }
        ]
    });

    $('#form_ordenes').submit(function (event) {
        event.preventDefault();
    })

    async function buscarMedico(table, inputId, element, containerIdError) { //missing some route
        const input = document.getElementById(inputId);
        switch (verificar(input)) {
            case 'mail': //busca por mail
                manejarFetch(`/ordenes/buscarPorMail/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'number': //busca por dni
                manejarFetch(`/buscarMedicoPorDni/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'string': //busca por apellido
                manejarFetch(`/buscarMedicosPorApellido/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'vacio': //si no se ingresa nada, trae todos los pacientes en db
                manejarFetch(`/buscarTodosLosMedicos`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            default:
                break;
        }
    }
    //deriva en base al input a las diferentes rutas(por id, nombre o vacio para traer todo)
    async function buscarDiagnosticos(table, inputId, element, containerIdError) {
        const input = document.getElementById(inputId);
        switch (verificar(input)) {
            case "string":
                manejarFetch(`/ordenes/diagnosticos/buscarPorNombre/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            case "number":
                manejarFetch(`/ordenes/diagnosticos/buscarPorId/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            case "vacio":
                manejarFetch(`/ordenes/diagnosticos/buscarTodos`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            default:
                break;
        }
    }
    //deriva en base al input a las diferentes rutas(por dni, apellido, email o vacio para traer todo)
    async function buscarPaciente(table, inputId, element, containerIdError) {
        const input = document.getElementById(inputId);
        switch (verificar(input)) {
            case 'mail': //busca por mail
                manejarFetch(`/ordenes/buscarPorMail/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'number': //busca por dni
                manejarFetch(`/ordenes/buscarPorDni/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'string': //busca por apellido
                manejarFetch(`/ordenes/buscarPorApe/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            case 'vacio': //si no se ingresa nada, trae todos los pacientes en db
                manejarFetch(`/ordenes/buscarTodos`, table, llenarTableYagregarErrores, element, containerIdError)
                break;
            default:
                break;
        }
    }
    //deriva en base al input a las diferentes rutas(por id, nombre o vacio para traer todo)
    async function buscarExamenes(table, inputId, element, containerIdError) {
        const input = document.getElementById(inputId);
        switch (verificar(input)) {
            case 'number': //busca por id
                manejarFetch(`/ordenes/examenes/buscarPorId/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            case 'string': //busca por nombre o termino
                manejarFetch(`/ordenes/examenes/buscarPorNombre/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            case 'vacio': //trae todo
                manejarFetch(`/ordenes/examenes/buscarTodos`, table, llenarTableYagregarErrores, element, containerIdError);
                break;
            default: //si se ingresa un valor invalido, mi input listener lo mostrara desde antes
                break;
        }
    }
    //
    //Recibe un string que contiene la ruta a la que se quiere hacer fetch
    //recibe tambien la tabla a donde se desea ingresar el resultado
    //mas la funcion que recibe la data del fetch, el elemento html a agregar al contenedor que tenga el id containerIdError
    async function manejarFetch(route, table, fun, element, containerIdError) {
        try {
            const res = await fetch(route);
            if (!res.ok) {
                const data = await res.json();
                console.log(data);
                throw new Error(data.error);
            } else {
                const data = await res.json();
                fun(table, data, element, containerIdError);
            }
        } catch (err) {
            fun(table, [], element, containerIdError);
            await Toast.fire({
                icon: 'error',
                title: '¡Error!',
                text: err.message
            })
        }
    }
    //llena la tabla de examenes y agrega errores en caso de no haber encontrado ningun examen
    const llenarTableYagregarErrores = (table, data, element, containerIdError) => {
        const container = document.getElementById(containerIdError);
        container.innerHTML = '';
        if (data.length > 0) {
            llenarTableConData(table, data);
        } else {
            container.appendChild(element);
        }
    }

    const llenarTableConData = (table, data) => {
        table.clear();
        table.rows.add(data).draw();
        table.columns.adjust().draw();
        table.responsive.recalc().draw();
    }

    let pExam = document.createElement('p');
    pExam.classList = 'form-text text-danger';
    pExam.innerText = 'No se encontraron examenes, pruebe con otro ID, nombre o término.';
    document.getElementById('buscarExamenes').addEventListener('click', () => {
        buscarExamenes(tableExamenes, 'idExamen', pExam, 'divExamenesError');
    })

    let div = document.createElement('div');
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn', 'btn-warning', 'mb-2', 'py-2');
    btn.id = 'btn_registrar';
    btn.innerHTML = 'Registrar paciente nuevo!';
    btn.onclick = ''
    let p = document.createElement('p');
    p.id = 'p_registrarP';
    p.innerText = '¡No se encontro ningun paciente!';
    div.appendChild(p);
    div.appendChild(btn)
    document.getElementById('buscarPaciente').addEventListener('click', () => {
        buscarPaciente(tablePacientes, 'pacienteID', div, 'divPacienteError');
    });

    let divMedico = document.createElement('div');
    let pMedic = document.createElement('p');
    pMedic.classList = 'form-text text-danger';
    pMedic.innerText = 'No se encontraron medicos, pruebe con otra matricula o apellido.';
    divMedico.appendChild(pMedic);
    document.getElementById('buscarMedico').addEventListener('click', () => {
        buscarMedico(tableMedicos, 'medicoId', divMedico, 'divMedicoError');
    });

    let pDiagno = document.createElement('p');
    pDiagno.classList.add('form-text');
    pDiagno.classList.add('text-danger');
    pDiagno.innerText = 'No se encontraron diagnosticos, pruebe con otro ID, nombre o término.'
    document.getElementById('buscarDiagnosticos').addEventListener('click', () => {
        buscarDiagnosticos(tableDiagnosticos, 'diagnosticoSearch', pDiagno, 'divDiagnosticosError');
    });

    const changeIcon = (estadoSelect, table, idIcon, newClass) => {
        table.on(estadoSelect, function (e, dt, type, indexs) {
            if (type === 'row') {
                document.getElementById(idIcon).classList = newClass;            
            }
        })
    }

    changeIcon('select', tablePacientes, 'i1', 'bi bi-check-circle ms-2 text-success');
    changeIcon('deselect', tablePacientes, 'i1', 'bi bi-x-circle ms-2 text-danger');
    changeIcon('select', tableMedicos, 'i2', 'bi bi-check-circle ms-2 text-success');
    changeIcon('deselect', tableMedicos, 'i2', 'bi bi-x-circle ms-2 text-danger');

    //adding events on buttons
    $('#table_diagnosticos tbody').on('click', '.add-diagnostico-button', function () {
        const row = tableDiagnosticos.row($(this).parents('tr'));
        if (agregarRow(row.data(), tableDiagnosticosAgregados, 'idDiagnostico')) {
            document.getElementById('i3').classList = 'bi bi-check-circle ms-2 text-success';
                
        } else {
            /*tableDiagnosticosAgregados.rows().every(function (rowIdx, tableLoop, rowLoop) {
                if ( this.data().idDiagnostico === row.data().idDiagnostico ) {
                    const rowNode = this.node();
                    $(rowNode).addClass('highlight-existing-row');
                    setTimeout(function(){
                        $(rowNode).removeClass('highlight-existing-row');
                    }, 1000);
                    
                }
            })*/
        }
    })
    $('#table_diagnosticos_agregados tbody').on('click', '.delete-agregados-button', function () {
        tableDiagnosticosAgregados.row($(this).parents('tr')).remove().draw();
        if (!tableDiagnosticosAgregados.data().any()) {
            document.getElementById('i3').classList = 'bi bi-x-circle ms-2 text-danger';
        };
    })
    $('#table_examenes tbody').on('click', '.add-button', function () {
        const row = tableExamenes.row($(this).parents('tr'));
        if (agregarRow(row.data(), tableAgregados, 'idExamenes')) {
            document.getElementById('i4').classList = 'bi bi-check-circle ms-2 text-success';
        } else {
            //no se agrego porque ya estaba en la lista
        }
    })
    $('#table_agregados tbody').on('click', '.delete-agregados-button', function () {
        const row = tableAgregados.row($(this).parents('tr'));
        tableAgregados.row(row).remove().draw();
        if (!tableAgregados.data().any()) {
            document.getElementById('i4').classList = 'bi bi-x-circle ms-2 text-danger';
        }
    })


});