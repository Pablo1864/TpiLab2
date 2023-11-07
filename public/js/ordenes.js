
const crearValidacionObj = () => {

    return {
        pacienteSeleccionado: false,
        medicoSeleccionado: false,
        diagnosticosAdded: false,
        examenesAdded: false,
        setPacienteSeleccionado(value) {
            this.pacienteSeleccionado = value;
            this.changeBtn();
        },
        setMedicoSeleccionado(value) {
            this.medicoSeleccionado = value;
            this.changeBtn();
        },
        setDiagnosticosAdded(value) {
            this.diagnosticosAdded = value;
            this.changeBtn();
        },
        setExamenesAdded(value) {
            this.examenesAdded = value;
            this.changeBtn();
        },
        getCrearOrden() {
            return this.pacienteSeleccionado && this.medicoSeleccionado && this.diagnosticosAdded && this.examenesAdded;
        },
        getCrearOrdenParcial() {
            return this.pacienteSeleccionado && this.medicoSeleccionado;
        },
        changeBtn() {
            console.log(this.getCrearOrden() + ' ' + this.getCrearOrdenParcial());
            if (this.getCrearOrden()) {
                this.turnBtnCrearOrden();
            } else if (this.getCrearOrdenParcial()) {
                this.turnBtnParcial();
            } else {
                document.getElementById('crearOrden').disabled = true;
            }
        },
        turnBtnParcial() {
            btn = document.getElementById('crearOrden');
            btn.disabled = false;

            btn.innerText = 'Crear orden y seguir más tarde';
        },
        turnBtnCrearOrden() {
            btn = document.getElementById('crearOrden');
            btn.disabled = false;
            btn.innerText = 'Crear orden';
        }
    }
};
//escucha escritura en input de busqueda de pacientes -valida formato-
document.getElementById('pacienteID').addEventListener('input', (event) => {
    const input = event.target;
    const div = document.getElementById('divPacienteError');
    if (verificar(input) == 'error') {
        if (!div.querySelector('p')) {
            const p = document.createElement('p');
            p.classList.add('form-text');
            p.classList.add('text-danger');
            p.innerHTML = 'Debe ingresar solo numeros para buscar por DNI, solo letras para apellido o un formato valido de email (nombreEmail@email.com).';
            div.appendChild(p);
        }
    } else {
        div.innerHTML = '';
    };
})
//escucha escritura en input de busqueda de examenes -valida formato-
document.getElementById('idExamen').addEventListener('input', (event) => {
    const input = event.target;
    const div = document.getElementById('divExamenesError');
    if (verificar(input) == 'error') {
        if (!div.querySelector('p')) {
            const p = document.createElement('p');
            p.classList.add('form-text');
            p.classList.add('text-danger');
            p.innerHTML = 'Debe ingresar solo numeros para buscar por ID o solo letras para buscar por nombres.';
            div.appendChild(p);
        }

    } else {
        div.innerHTML = '';
    };
})
//para configurar las datatables languague
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
$(document).ready(function () {

    const validacion = crearValidacionObj();

    //inicializacion de datatables
    const tablePacientes = $('#table_patients').DataTable({
        language: config('paciente', 'pacientes'),
        select: 'single',
        responsive: true,
        columns: [
            { title: '', data: 'idPaciente', visible: false },
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
            { title: '', data: 'idMedico', visible: false },
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
                title: '', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function () {
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
            { title: '', data: 'idExamenes', visible: false },
            { title: 'Nombres:', data: 'nombre', responsivePriority: 1 },
            { title: 'Requerimientos:', data: 'requerimiento', responsivePriority: 2 },
            { title: 'Muestra requerida:', data: 'tipoAnalisis', responsivePriority: 3 },
            { title: 'Hs.demora:', data: 'diasDemora', responsivePriority: 4 },
            { title: 'Otros terminos:', data: 'otrosNombres', responsivePriority: 5, className: 'none' },
            {
                title: '', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-danger m-2 px-3 d-flex flex-row mx-auto delete-agregados-button"> <i class="bi bi-x-circle me-2" aria-hidden="true"></i> Eliminar </button>';
                }
            }]
    });
    const tableDiagnosticos = $('#table_diagnosticos').DataTable({
        language: config('diagnostico', 'diagnosticos'),
        responsive: true,
        columns: [
            { title: '', data: 'idDiagnostico', visible: false },
            { title: 'Diagnostico', data: 'nombre', responsivePriority: 1 },
            { title: 'Otros terminos', data: 'otrosTerminos', responsivePriority: 3 },
            {
                title: '', data: null, responsivePriority: 2, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-primary m-2 px-3 d-flex flex-row mx-auto add-diagnostico-button"> <i class="bi bi-plus-circle me-2" aria-hidden="true"></i> Agregar </button>';
                }
            },
        ]
    });
    const tableDiagnosticosAgregados = $('#table_diagnosticos_agregados').DataTable({
        language: config('diagnostico', 'diagnosticos'),
        responsive: true,
        columns: [
            { title: '', data: 'idDiagnostico', visible: false },
            { title: 'Diagnostico', data: 'nombre', responsivePriority: 1 },
            { title: 'Otros terminos', data: 'otrosTerminos', responsivePriority: 3 },
            {
                title: '', data: null, responsivePriority: 2, orderable: false, searchable: false, render: function () {
                    return '<button type="button" class="btn btn-danger m-2 px-3 d-flex flex-row mx-auto delete-agregados-button"> <i class="bi bi-trash me-1" aria-hidden="true"></i> Eliminar </button>';
                }
            },
        ]
    });

    //cambia el iconito que se muestra en los tabs
    const changeIcon = (estadoSelect, table, idIcon, newClass, value, metodoSetValidacion) => {
        table.on(estadoSelect, function (e, dt, type, indexs) {
            if (type === 'row') {
                document.getElementById(idIcon).classList = newClass;
                metodoSetValidacion.call(this, value);
            }
        })
    }

    changeIcon('select', tablePacientes, 'i1', 'bi bi-check-circle ms-2 text-success', true, function (value) {
        validacion.setPacienteSeleccionado(value);
        //console.log(tablePacientes.row({ selected: true }).data())
    });
    changeIcon('deselect', tablePacientes, 'i1', 'bi bi-x-circle ms-2 text-danger', false, function (value) {
        validacion.setPacienteSeleccionado(value);
    });
    changeIcon('select', tableMedicos, 'i2', 'bi bi-check-circle ms-2 text-success', true, function (value) {
        validacion.setMedicoSeleccionado(value);
    });
    changeIcon('deselect', tableMedicos, 'i2', 'bi bi-x-circle ms-2 text-danger', false, function (value) {
        validacion.setMedicoSeleccionado(value);
    });

    //adding events on buttons
    $('#table_diagnosticos tbody').on('click', '.add-diagnostico-button', function () {
        const row = tableDiagnosticos.row($(this).parents('tr'));
        if (agregarRow(row.data(), tableDiagnosticosAgregados, 'idDiagnostico')) {
            document.getElementById('i3').classList = 'bi bi-check-circle ms-2 text-success';
            validacion.setDiagnosticosAdded(true);
        } else {
            //no se agrego(ya estaba en la tabla)
        }
    })
    $('#table_diagnosticos_agregados tbody').on('click', '.delete-agregados-button', function () {
        tableDiagnosticosAgregados.row($(this).parents('tr')).remove().draw();
        if (!tableDiagnosticosAgregados.data().any()) {
            document.getElementById('i3').classList = 'bi bi-x-circle ms-2 text-danger';
            validacion.setDiagnosticosAdded(false);
        };
    })
    $('#table_examenes tbody').on('click', '.add-button', function () {
        const row = tableExamenes.row($(this).parents('tr'));
        if (agregarRow(row.data(), tableAgregados, 'idExamenes')) {
            document.getElementById('i4').classList = 'bi bi-check-circle ms-2 text-success';
            validacion.setExamenesAdded(true);

        } else {
            //no se agrego porque ya estaba en la lista
        }
    })
    $('#table_agregados tbody').on('click', '.delete-agregados-button', function () {
        tableAgregados.row($(this).parents('tr')).remove().draw();
        if (!tableAgregados.data().any()) {
            document.getElementById('i4').classList = 'bi bi-x-circle ms-2 text-danger';
            validacion.setExamenesAdded(false);
        }
    })

    let pExam = document.createElement('p');
    pExam.classList = 'form-text text-danger';
    pExam.innerText = 'No se encontraron examenes, pruebe con otro ID, nombre o término.';
    document.getElementById('buscarExamenes').addEventListener('click', () => {
        buscarExamenes(tableExamenes, 'idExamen', pExam, 'divExamenesError');
    })

    let div = document.createElement('div');
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn');
    btn.classList.add('btn-warning');
    btn.id = 'btn_registrar';
    btn.innerHTML = 'Registrar paciente nuevo';
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

    //preventDefault del submit
    $('#form_ordenes').submit(function (event) {
        event.preventDefault();
    })

    document.getElementById('crearOrden').addEventListener('click', () => {
        crearUpdateOrden(validacion, tablePacientes, tableMedicos, tableAgregados, tableDiagnosticosAgregados);
    });

})

async function buscarMedico(table, inputId, element, containerIdError) {
    const input = document.getElementById(inputId);
    switch (verificar(input)) {
        case 'mail': //busca por mail
            manejarFetch(`/ordenes/buscarPorMail/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
            break;
        case 'number': //busca por dni
            manejarFetch(`/buscarMedicoPorApellido/${input.value}`, table, llenarTableYagregarErrores, element, containerIdError)
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
            throw new Error('Network response was not ok... :c');
        }
        const data = await res.json();
        fun(table, data, element, containerIdError);
    } catch (err) {
        console.error('Error:', err);
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

//devuelve 'mail' si el input contiene patron de mail
//devuelve 'string' si el input contiene solo letras
//devuelve 'number' si el input contiene solo numeros
//devuelve 'vacio' si el input esta vacio
//devuelve 'error' si contiene un valor invalido(no es mail, ni solo letras, ni solo numeros, ni vacio)
//Agrega las clases correspondientes de error y correct para un poco de css
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
//Vacia y llena la tabla con la data enviada y ajusta el width de las columnas
const llenarTableConData = (table, data) => {
    table.clear();
    table.rows.add(data).draw();
    table.columns.adjust().draw();
    table.responsive.recalc().draw();
}

//agrega la fila a la tabla
function agregarRow(row, tablaAddRow, id) {
    try {
        const idEnTable = tablaAddRow.column(0).data().toArray(); //index 0 es mi columna de id (invisible)
        if (!idEnTable.includes(row[id])) { //si el ID de la row seleccionada esta incluida dentro del array de IDs quiere decir que ya esta dentro de la lista (niego con !)
            tablaAddRow.row.add(row).draw(); //si no esta incluida dentro de la lista, la agrego (supuestamente .rows agregaria de a varios, en este caso .row solo porque le paso un solo obj, en vez de un arr de obj)
            tablaAddRow.columns.adjust().draw();
            tablaAddRow.responsive.recalc();
            return true; //logro agregar algo
        }
    } catch (err) {
        console.error(err);
    }
    return false; //ya esta en la lista
}

async function crearUpdateOrden(validacion, tablePacientes, tableMedicos, tableExamenesAgregados, tableDiagnosticosAgregados) {

    if (validacion.getCrearOrden() || validacion.getCrearOrdenParcial()) {
        //creando orden nueva
        const idExamenesArr = tableExamenesAgregados.column(0).data().toArray();
        const data = {
            idPaciente: tablePacientes.row({ selected: true }).data().idPaciente,
            idMedico: tableMedicos.row({ selected: true }).data().idMedico,
            arrayIdsDiagnosticos: tableDiagnosticosAgregados.column(0).data().toArray(),
            arrayIdsExamenes: idExamenesArr,
            estado: idExamenesArr.length > 0 ? 'Esperando toma de muestras' : 'ingresada',
        }

        const res = await fetch('/ordenes/crearOrden', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        const ordenResponse = await res.json();
        if (ordenResponse.orden.affectedRows > 0) {
            if (ordenResponse.examenes.length === 0 && ordenResponse.diagnostico.length === 0) {
                let html = '<div>';
                let div2 = '<div>';
                const nombreApellidoPaciente = tablePacientes.row({ selected: true }).data().apellido + ', ' + tablePacientes.row({ selected: true }).data().nombre;
                const dniPaciente = tablePacientes.row({ selected: true }).data().dni;
                let btnConfirm;
                let funConfirm;
                html += '<p> Paciente: ' + nombreApellidoPaciente + '</p>';
                html += '<p> Medico: ' + tableMedicos.row({ selected: true }).data().apellido + ', ' + tableMedicos.row({ selected: true }).data().nombre + '</p>';
                console.log(tableExamenesAgregados.rows().data().toArray());
                console.log(tableDiagnosticosAgregados.rows().data().toArray());

                if (data.arrayIdsDiagnosticos.length > 0) {
                    let arrData = tableDiagnosticosAgregados.rows().data().toArray();
                    html += '<p> Diagnosticos: ';
                    arrData.forEach((e, index) => {
                        if (index != data.arrayIdsDiagnosticos.length - 1) {
                            html += e.nombre + ', ';
                        } else {
                            html += e.nombre + '.';
                        }
                    });
                    html += '</p>';
                }
                if (data.arrayIdsExamenes.length > 0) {
                    let arrData = tableExamenesAgregados.rows().data().toArray();
                    let muestras = [];
                    html += '<p> Examenes: ';
                    arrData.forEach((e, index) => {
                        if (index != data.arrayIdsExamenes.length - 1) {
                            html += e.nombre + ', ';

                        } else {
                            html += e.nombre + '.';
                        }
                        if (!muestras.includes(e.tipoAnalisis)) {
                            muestras.push(e.tipoAnalisis);
                        }
                    });
                    html += '</p>';
                    html += '<p> Muestras necesarias: ';
                    muestras.forEach((m, i) => {
                        if (i != muestras.length - 1) {
                            html += m + ', ';
                        } else {
                            html += m + '.';
                        }
                    });
                    html += '</p>';
                    
                } else {

                }
                html += '</div>';
                funConfirm = volverAOrdenes;
                    btnConfirm = 'Volver a administracion de ordenes';
                crearModal('Orden nro.' + ordenResponse.orden.insertId + ' creada con éxito!', html, btnConfirm, 'Crear una nueva orden', 'success', ordenResponse.orden.insertId, funConfirm);
            }
        }
        console.log(ordenResponse);
    }
}

function showModal(title, html, textButtonOK, textButtonNotOk, icon) {
    return new Promise(async (resolve) => {
        const result = await Swal.fire({
            title: title,
            html: html,
            showConfirmButton: textButtonOK.trim() != '',
            confirmButtonText: textButtonOK,
            showCancelButton: textButtonNotOk.trim() != '',
            cancelButtonText: textButtonNotOk,
            icon: icon,
        })
        if (result.isConfirmed) {
            resolve(true);

        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resolve(false);
        }
    });
}

async function crearModal(title, html, textButtonOK, textButtonNotOk, icon, idOrden, funConfirm) {
    const result = await showModal(title, html, textButtonOK, textButtonNotOk, icon);
    if (result) { //button confirm
        funConfirm();
    } else { //button cancel
        window.location.href = '/ordenes';
    }
}

async function volverAOrdenes(){
    window.location.href = '/ordenesAdministracion';
}

async function editarOrden(idOrden) {
    console.log('Aqui pasarian mas weas...');
}

