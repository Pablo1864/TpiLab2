
import { config, Toast, agregarRow, checkAlpha, checkNumeric, llenarTableConData, manejarFetch2 } from './common.js'

$(document).ready(function () {

    //Aqui esta todo lo que tiene que ver con inicializar datatables y buscadores
    
    $('#form_ordenes').submit(function (event) {
        event.preventDefault();
    })
  
    const erroresMsj = {
        pacientes:{
            nonAlpha: 'Debe ingresar el apellido del paciente sin números o caracteres especiales.',
            dni_nonNumeric: 'Debe ingresar el dni del paciente sin letras, espacios o caracteres especiales.',
            id_nonNumeric: 'Debe ingresar un id valido sin letras, espacios o caracteres especiales.',
        },
        medicos:{
            nonAlpha: 'Debe ingresar el apellido del medico sin números o caracteres especiales.',
            matricula_nonNumeric: 'Debe ingresar el matricula del medico sin letras, espacios o caracteres especiales.',
            id_nonNumeric: 'Debe ingresar un id valido sin letras, espacios o caracteres especiales.',
        },
        diagnosticos:{
            nonAlpha: 'Debe ingresar un término del diagnostico sin números o caracteres especiales.',
            id_nonNumeric: 'Debe ingresar un id valido sin letras, espacios o caracteres especiales.',
        },
        examenes:{
            nonAlpha: 'Debe ingresar el nombre del examen sin números o caracteres especiales.',
            id_nonNumeric: 'Debe ingresar un id valido sin letras, espacios o caracteres especiales.',
        }

    }

    const inputPaciente = $('#pacienteBuscador');
    const filterPaciente = $('#pacienteFilter');
    const divErroresPaciente = $('#divPacientesErrores');
    const searchBtnPaciente = $('#pacienteBtn');

    const inputMedico = $('#medicoBuscador');
    const filterMedico = $('#medicoFilter');
    const divErroresMedico = $('#divMedicosErrores');
    const searchBtnMedico = $('#medicoBtn');

    const inputDiagnostico = $('#diagnosticoBuscador');
    const filterDiagnostico = $('#diagnosticoFilter');
    const divErroresDiagnostico = $('#divDiagnosticosErrores');
    const searchBtnDiagnostico = $('#diagnosticoBtn');

    const inputExamen = $('#examenBuscador');
    const filterExamen = $('#examenFilter');
    const divErroresExamen = $('#divExamenesErrores');
    const searchBtnExamen = $('#examenBtn');

    const searchConfig = {
        pacientes: {
            url: '/buscar/pacientes',
            params: {
                apellido: 'apellido',
                dni: 'dni',
                email: 'email',
                id: 'id'
            },
            table: 'table_patients',

        },
        medicos: {
            url: '/buscar/medicos',
            params: {
                apellido: 'apellido',
                matricula: 'matricula',
                email: 'email',
                id: 'id'
            }
            , table: 'table_medics',
        },
        diagnosticos: {
            url: '/buscar/diagnosticos',
            params: {
                termino: 'termino',
                id: 'id'
            }
            , table: 'table_diagnosticos',
        },
        examenes: {
            url: '/buscar/examenes',
            params: {
                termino: 'termino',
                id: 'id'
            }
            , table: 'table_examenes',
        }
    }

    function validar(input, divErrores, type, filter){
        let res = true;
        try {
            
            input.removeClass('is-invalid');
            divErrores.empty();
            const value = input.val();
            switch (filter) {
                case 'apellido':
                case 'termino':
                    if (!checkAlpha(value)) {
                        input.addClass('is-invalid');
                        divErrores.html(erroresMsj[type].nonAlpha);
                        res = false;
                    }
                    break;
                case 'dni':
                    if (!checkNumeric(value)) {
                        input.addClass('is-invalid');
                        divErrores.html(erroresMsj[type].dni_nonNumeric);
                        res = false;
                    }
                    break;
                case 'id':
                    if (!checkNumeric(value)) {
                        input.addClass('is-invalid');
                        divErrores.html(erroresMsj[type].id_nonNumeric);
                        res = false;
                    }
                    break;
                case 'matricula':
                    if (!checkNumeric(value)) {
                        input.addClass('is-invalid');
                        divErrores.html(erroresMsj[type].matricula_nonNumeric);
                        res = false;
                    }
                    break;
                case 'email':
                    res = true;
                    break;
                default:
                    res = false;
                    break;
            }
        } catch (error) {
            console.log(error);
            res = false;
        }

        return res;
        
    }

    inputPaciente.on('input', (event) => {
        const value = event.target.value;
        if (value.trim() != '') {
            validar(inputPaciente, divErroresPaciente, 'pacientes', filterPaciente.val().toLowerCase())
        } else {
            inputPaciente.removeClass('is-invalid');
        }
    }
    )
    inputMedico.on('input', (event) => {
        const value = event.target.value;
        if (value.trim() != '') {
            validar(inputMedico, divErroresMedico, 'medicos', filterMedico.val().toLowerCase())
        } else {
            inputMedico.removeClass('is-invalid');
        }

    })
    inputDiagnostico.on('input', (event) => {
        const value = event.target.value;
        if ( value.trim() != '') {
            validar(inputDiagnostico, divErroresDiagnostico, 'diagnosticos', filterDiagnostico.val().toLowerCase())
        } else {
            inputDiagnostico.removeClass('is-invalid');
        }
    })
    inputExamen.on('input', (event) => {
        const value = event.target.value;
        if (value.trim() != '') {
            validar(inputExamen, divErroresExamen, 'examenes', filterExamen.val().toLowerCase())
        } else {
            inputExamen.removeClass('is-invalid');
        }
    })

    searchBtnPaciente.on('click', (event) => {
        search(inputPaciente, divErroresPaciente , 'pacientes', filterPaciente.val().toLowerCase());
    })
    searchBtnMedico.on('click', (event) => {
        search(inputMedico, divErroresMedico, 'medicos', filterMedico.val().toLowerCase());
    })
    searchBtnDiagnostico.on('click', (event) => {
        search(inputDiagnostico, divErroresDiagnostico, 'diagnosticos', filterDiagnostico.val().toLowerCase());
    })
    searchBtnExamen.on('click', (event) => {
        search(inputExamen, divErroresExamen, 'examenes', filterExamen.val().toLowerCase());
    })

    async function search(input, divErrores, type, filter){
        divErroresPaciente.empty();
        divErroresMedico.empty();
        divErroresDiagnostico.empty();
        divErroresExamen.empty();
        $('#divBtnCrearPaciente').remove();
        //inputDiagnostico.class.remove('is-invalid');
        //limpiar errores(classlist de inputs) y deselect row
        const confg = searchConfig[type];

        if (!confg || !input || !filter || !type || !divErrores) {
            return
        }
        if (!input.val()) { //si el input esta vacio, fetchear todos
            const url = `/ordenes/buscar/${type}`;
            const respuesta = await manejarFetch2(url);
            if (respuesta){
                llenarTableConData($(`#${confg.table}`).DataTable(), respuesta);   
            }
            return
        };

        if (validar(input , divErrores, type, filter)) {
            const url = `/ordenes${confg.url}?${confg.params[filter]}=${encodeURIComponent(input.val())}`;
            const respuesta = await manejarFetch2(url);
            if (respuesta.length == 0 && filter == 'apellido' && type == 'pacientes') { //si no hay resultados, mostrar btn para crear paciente
                const divSearchPatient = $('#search');
                divSearchPatient.append( `<div id='divBtnCrearPaciente' class='col px-3'><h5 class="text-center">No se encontraron resultados para el apellido: <span class="text-primary">${input.val()}</span> </h5><div class="col text-center my-2"> <button class="btn btn-primary" id="crearPaciente">ir a Crear Paciente nuevo</button></div></div>`);
                $('#crearPaciente').on('click', (event) => {
                    
                    window.location.href = '/paciente/registro';
                    
                });
            } else if (respuesta) {
                llenarTableConData($(`#${confg.table}`).DataTable(), respuesta);
            }

        } else {
            console.log('error');
            Toast.fire({
                icon: 'error',
                title: 'Error al buscar!',
                text: 'Sucedio un error durante la busqueda!'
            })
            return;
        }
    }

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