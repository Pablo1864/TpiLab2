
document.getElementById('pacienteID').addEventListener('input', (event) => {
    const input = event.target;
    const div = document.getElementById('divPacienteError');
    if (verificar(input) == 'error') {
        if (!div.querySelector('p')){
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

document.getElementById('idExamen').addEventListener('input', (event) => {
    const input = event.target;
    const div = document.getElementById('divExamenesError');
    if (verificar(input) == 'error') {
        if (!div.querySelector('p')){
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

let verificados = {
    pacienteSeleccionado: false,
    diagnosticoSeleccionado: false,
    medicoSeleccionado: false,
    examenesAgregados: false,
}

$(document).ready(function () {
    //inicializacion de datatables
    const tablePacientes = $('#table_patients').DataTable({ 
        select: true,
        responsive: {
            responsive: true,
            breakpoints: [
                {name: 'xxl', width: Infinity},
                {name: 'xl', width: 1400},
                {name: 'lg', width: 1200},
                {name: 'md', width: 768},
                {name: 'sm', width: 576},
            ],
            details: {
                type: 'column',
                target: 'tr'
            }
        },
        columns: [
            { title:'', data: 'idPaciente', visible: false },
            { title: 'Nombre:',
                data: null,
                render: function (data, type, row) {
                    return data.nombre + ', ' + data.apellido;
                },
                priority: 2,
            },
            { title: 'Dni:', data: 'dni', priority: 2},
            { title: 'Sexo:', data: 'sexo', priority: 1},
            { title: 'Fecha de nacimiento:', data: 'fechaNacimiento' },
            { title: 'Provincia, localidad', 
                data: null, render: function (data, type, row) {
                    return data.provincia + ', ' + data.localidad;
                }, priority: 0
            },
            { title: 'Domicilio:', data: 'domicilio', priority: 0 },
            { title: 'Telefono:', data: 'telefono', priority: 0 },
            { title: 'Email:', data: 'email', priority: 0 },
            { title: 'Obra social:', data: 'obraSocial', priority: 0 },
            { title: 'Nro. Afiliado:', data: 'nroAfiliado', priority: 0 },
        ]
    })
    const tableExamenes = $('#table_examenes').DataTable({
        select: true,
        responsive: {
            responsive: true,
            breakpoints: [
                {name: 'xxl', width: Infinity},
                {name: 'xl', width: 1400},
                {name: 'lg', width: 1200},
                {name: 'md', width: 768},
                {name: 'sm', width: 576},
            ],
            details: {
                type: 'column',
                target: 'tr'
            }
        },
        columns: [
            { title: '', data: 'idExamenes', visible: false },
            { title: 'Nombre:', data: 'nombre', priority: 4},
            { title: 'Requerimientos:', data: 'requerimiento', priority: 3, },
            { title: 'Muestra requerida:', data: 'tipoAnalisis', priority: 2 },
            { title: 'Hs.demora:', data: 'diasDemora', priority: 1 },
            { title: 'Otros terminos:', data: 'otrosNombres', priority: 1}
        ]
    })
    const tableAgregados = $('#table_agregados').DataTable({
        select: true,
        responsive: {
            responsive: true,
            breakpoints: [
                {name: 'xxl', width: Infinity},
                {name: 'xl', width: 1400},
                {name: 'lg', width: 1200},
                {name: 'md', width: 768},
                {name: 'sm', width: 576},
            ],
            details: {
                type: 'column',
                target: 'tr'
            }
        },
        columns: [
            { title: '', data: 'idExamenes', visible:false}, 
            { title: 'Nombres:', data: 'nombre', priority: 4 }, 
            { title: 'Requerimientos:', data: 'requerimiento', priority: 3 }, 
            { title: 'Muestra requerida:', data: 'tipoAnalisis', priority: 2 }, 
            { title: 'Hs.demora:', data: 'diasDemora', priority: 1 }, 
            { title: 'Otros terminos:', data: 'otrosNombres', priority: 1}]
    })

    const buttonExamenes = document.getElementById('buscarExamenes');
    buttonExamenes.addEventListener('click', () => {
        buscarExamenes(tableExamenes);
    })

    $('#agregarExamen').on('click', function () { 
        const selectedRow = tableExamenes.rows('.selected').data();
        if (selectedRow.length > 0) {
            agregarExamen(selectedRow[0], tableAgregados); 
        } else {
            console.log('Tenes que seleccionar un examen a agregar, ameo');
        }
    })

    const buttonBuscarPaciente = document.getElementById('buscarPaciente');
    buttonBuscarPaciente.addEventListener('click', () => {
        buscarPaciente(tablePacientes);
    });

    //preventDefault del submit
    $('#form_ordenes').submit(function(event){
        event.preventDefault();
    })

})

//Hace los fetch correspondiente al value del input de pacientes y envia los pacientes encontrados a la table
async function buscarPaciente(table) {
    const input = document.getElementById('pacienteID');
    switch (verificar(input)) {
        case 'mail': //busca por mail
            manejarFetch(`/ordenes/buscarPorMail/${input.value}`, table, llenarData)
            break;
        case 'number': //busca por dni
            manejarFetch(`/ordenes/buscarPorDni/${input.value}`, table, llenarData)
            break;
        case 'string': //busca por apellido
            manejarFetch(`/ordenes/buscarPorApe/${input.value}`, table, llenarData)
            break;
        case 'vacio': //si no se ingresa nada, trae todos los pacientes en db
            manejarFetch(`/ordenes/buscarTodos`, table, llenarData)
            break;
        default:
            break;
    }
}

//
//Recibe un string que contiene la ruta a la que se quiere hacer fetch
//recibe tambien la tabla a donde se desea ingresar el resultado
//mas la funcion que recibe la data del fetch y la table
async function manejarFetch(route, table, fun){
    try {
        const res = await fetch(route);
        if (!res.ok) {
            throw new Error('Network response was not ok... :c');
        }
        const data = await res.json();
        fun(table, data);
    } catch (err) {
        console.error('Error:', err);
    }
}

//
//Recibe la instancia de la dataTable a llenar(OJO! la instancia de la dataTable, no el elemento table del html)
//Recibe un arreglo de objectos a ingresar en la datatable (Las columnas deben haber sido inicializadas con el tipo de valor 
//correspondiente a los atributos de los objectos que se encuentran en el array data)
//Limpia la tabla antes de ingresar los objectos del array
//Devuelve true si logro ingresar algo en la table, si no false 
const llenarData = (table, data) => {
    const btn = document.getElementById('btn_registrar');
    const p = document.getElementById('p_registrarP');
    if (btn) {
        if (p) {
            p.parentNode.removeChild(p);
        }
        btn.parentNode.removeChild(btn);
    }
    if (data.length > 0) {
        llenarTableConData(table, data);
    } else {  
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('btn');
        btn.classList.add('btn-warning');
        btn.id = 'btn_registrar';
        btn.innerHTML = 'Registrar paciente nuevo';
        let p = document.createElement('p');
        p.id = 'p_registrarP';
        p.innerHTML = '¡No se encontro ningun paciente!';
        document.getElementById('search').appendChild(btn);
        document.getElementById('search').appendChild(p);
        return false
    }
}

//
//devuelve 'mail' si el input contiene patron de mail
//devuelve 'string' si el input contiene solo letras
//devuelve 'number' si el input contiene solo numeros
//devuelve 'vacio' si el input esta vacio
//devuelve 'error' si esta vacio o contiene un valor invalido(no es mail, ni solo letras, ni solo numeros)
//Agrega las clases correspondientes de error y correct para un poco de css
const verificar = (input) => {
    if (input.value.trim() != '') {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexNumber = /^[0-9]+$/;
        const regexLetters = /^[a-zA-Z]+$/;

        if (regexEmail.test(input.value)) {
            input.classList.remove('error');
            input.classList.add('correct');
            return 'mail';
        } else if (regexLetters.test(input.value)) {
            input.classList.remove('error');
            input.classList.add('correct');
            return 'string';
        } else if (regexNumber.test(input.value)) {
            input.classList.remove('error');
            input.classList.add('correct');
            return 'number';
        } else {
            input.classList.remove('correct');
            input.classList.add('error');
        }
    } else {
        input.classList.remove('error');
        input.classList.add('correct');
        return 'vacio';
    }
    return 'error';
}

async function confirmarOrden(idPaciente) {

    const diagno = document.getElementById('diagnosticoMedico');
    const nombre = document.getElementById('nombreMedico');
    const matricula = document.getElementById('matriculaMedico');
    
    if (diagno.value.trim() != '') {
        if (verificar(nombre) == 'string') {
            if (verificar(matricula) == 'number') {

                //CREAR ORDEN (should be fixed to happen after tests have been added to list)
                //Anteriormente creaba mi orden aqui, pero decidimos hacerlo al final, working on it!
                /* const data = {
                    diagnostico: diagno.value,
                    nombreMedico: nombre.value,
                    matricula: matricula.value
                }
                try {
                    const res = await fetch(`/ordenes/crearOrden/${idPaciente}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) {
                        throw new Error('Network response was not ok... :c');
                    }
                } catch (err) {
                    console.error('Error:', err);
                } */

            } else {
                matricula.classList.add('error');
                console.log('debe ingresar la matricula del medico solicitante');
            }
        } else {
            nombre.classList.add('error');
            console.log('debe ingresar el nombre del medico solicitante');
        }
    } else {
        diagno.classList.add('error');
        console.log('debe ingresar un diagnostico');
    }
}

//EXAMENES

async function buscarExamenes(table) {
    const input = document.getElementById('idExamen');
    
    switch (verificar(input)) {
        case 'number':
            manejarFetch(`/ordenes/examenes/buscarPorId/${input.value}`, table, llenarTableExamenes);
            break;
        case 'string':
            manejarFetch(`/ordenes/examenes/buscarPorNombre/${input.value}`, table, llenarTableExamenes);
            break;
        case 'vacio':  
            manejarFetch(`/ordenes/examenes/buscarTodos`, table, llenarTableExamenes);
            break;
        default:
            break;
    }
}

const llenarTableConData = (table, data) =>{
    table.clear();
    table.rows.add(data).draw();
}

const llenarTableExamenes = (table, data) =>{

    const container = document.getElementById('divExamenesError');
    container.innerHTML = '';
    if (data.length > 0){
        llenarTableConData(table, data);
    } else {
        
        if (!container.querySelector('p')){
            const p = document.createElement('p');
            p.classList.add('form-text');
            p.classList.add('text-danger');
            p.innerHTML = 'No se encontraron examenes, pruebe con otro ID, nombre o término';
            container.appendChild(p);
        }
    }
}

function agregarExamen(row, tableAgregados) {
    try {
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = 'Eliminar';       
        const idEnTable = tableAgregados.column(0).data().toArray(); //index 0 es mi columna de id (invisible)
        if (!idEnTable.includes(row.idExamenes)){ //si el ID de la row seleccionada esta incluida dentro del array de IDs quiere decir que ya esta dentro de la lista (niego con !)
            tableAgregados.row.add(row).draw(); //si no esta incluida dentro de la lista, la agrego (supuestamente .rows agregaria de a varios, en este caso .row solo porque le paso un solo obj, en vez de un arr de obj)
        } else {
            console.log('El examen ya esta agregado, como vas a querer agregar dos veces el mismo examen?!');
        }
    } catch (err) {
        console.error(err);
    }
}

async function crearOrden(){
    console.log('ORDEN:');

    paciente = tablePacientes.row('.selected').data();
    const diagno = document.getElementById('diagnosticoMedico').value;
    const medic = document.getElementById('nombreMedico').value;
    const matricula = document.getElementById('matriculaMedico').value;

    if (paciente){
        let examenes = tableAgregados.rows().data().toArray();
        if (examenes.length > 0){
            
            const idP = paciente.idPaciente;
            const idExs = [];
            examenes.forEach((e) =>{
                idExs.push(e.idExamenes);
            });

            try {

                const res = await fetch(`/ordenes/crearOrden`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idPaciente: idP,
                        idExamenes: idExs,
                        diagnostico: diagno,
                        nombreMedico: medic,
                        matricula: matricula
                    })
                });
                const orden = await res.json();
                console.log(orden);
            } catch (err) {
                console.error('Error:', err);
            }
        }
    } else {
        console.log('Debe seleccionar un paciente!');    
    }

}

mensajeOrden = (orden) =>{

//mostraria un mensajito que muestre la info de la orden de trabajo creada + la muestras faltantes

}
