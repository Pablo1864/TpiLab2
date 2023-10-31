
document.getElementById('pacienteID').addEventListener('input', (event) => {
    const input = event.target;

    if (verificar(input) == 'error') {
        //missing some stuff happening here... probably
    };
})

let tablePacientes;

let dataT;
let dataTe;
$(document).ready(function () {
    tablePacientes = $('#table_patients').DataTable({ //esto no tiene mucho sentido porque mas abajo me la paso inicializando la table y destruyendola xd (working on it(mas abajo hay otra version que me gusto mas para #table_agregados))
        select: true,
        //columns
    })
    //dataT = $('#table_patients').DataTable({
     //   select: true,
    //})
    //dataTe = $('#table_examenes').DataTable({
      //  select: true,
    //})
})


async function buscarPaciente() {

    const input = document.getElementById('pacienteID');
    //retiro button registrarPaciente y button confirmar si existen

    const btn = document.getElementById('btn_registrarP');
    const p = document.getElementById('p_registrarP');
    const btnConfirmar = document.getElementById('confirmar');
    if (btn) {
        btn.parentNode.removeChild(btn);
        p.parentNode.removeChild(p);
    } else if (btnConfirmar) {
        btnConfirmar.parentNode.removeChild(btnConfirmar);
    }

    //fetch the patients by the type of data in the input(mail, lastname or dni);
    switch (verificar(input)) {

        case 'mail': //busca por mail

            try {
                const res = await fetch(`/ordenes/buscarPorMail/${input.value}`);
                if (!res.ok) {
                    throw new Error('Network response was not ok... :c');
                }
                const data = await res.json();
                llenarData(data);
            } catch (err) {
                console.error('Error:', err);
            }

            break;
        case 'number': //busca por dni

            try {
                const res = await fetch(`/ordenes/buscarPorDni/${input.value}`);
                if (!res.ok) {
                    throw new Error('Network response was not ok... :c');
                }
                const data = await res.json();
                llenarData(data);
            } catch (err) {
                console.error('Error:', err);
            }

            break;
        case 'string': //busca por apellido

            try {
                const res = await fetch(`/ordenes/buscarPorApe/${input.value}`);
                if (!res.ok) {
                    throw new Error('Network response was not ok... :c');
                }
                const data = await res.json();
                llenarData(data);
            } catch (err) {
                console.error('Error:', err);
            }

            break;
        default:
            break;
    }

}

const llenarData = (pacientes) => {

    if (pacientes.length > 0) {
        /* data = [pacientes[0].nombre + ' ' + pacientes[0].apellido, pacientes[0].sexo, pacientes[0].fechaNacimiento, pacientes[0].provincia + ', ' + pacientes[0].localidad, pacientes[0].domicilio, pacientes[0].telefono, pacientes[0].email, pacientes[0].obraSocial, pacientes[0].nroAfiliado]
        for (let i = 0; i < 9; i++) {
            const p = document.getElementById('p_' + i);
            p.innerHTML = data[i]
        } */
        /* let pacientesArr = [];
        pacientes.forEach(p => {
            pacientesArr.push({
                id:p.idPaciente,
                nombreYApellido: p.nombre + ', ' + p.apellido,
                sexo: p.sexo,
                fechaNacimiento: p.fechaNacimiento,
                provinciaLocalidad: p.provincia + ', ' + p.localidad,
                domicilio: p.domicilio,
                telefono: p.telefono,
                email: p.email,
                obraSocial: p.obraSocial,
                nroAfiliado: p.nroAfiliado
            });
        });
        console.log(dataT);
        console.log(pacientesArr);
        console.log(pacientes);
        dataT.clear();
        dataT.rows.add(pacientesArr).draw();
        dataT.column(0).visible(false); */

        /*const tableb = document.querySelector('#table_patients tbody');
        tableb.innerHTML = '';

         pacientes.forEach(paciente => {
            const row = tableb.insertRow();
            row.insertCell().textContent = paciente.idPaciente;
            row.insertCell().textContent = paciente.nombre + ', ' + paciente.apellido;
            row.insertCell().textContent = paciente.sexo;
            row.insertCell().textContent = paciente.fechaNacimiento;
            row.insertCell().textContent = paciente.provincia + ', ' + paciente.localidad;
            row.insertCell().textContent = paciente.domicilio;
            row.insertCell().textContent = paciente.telefono;
            row.insertCell().textContent = paciente.email;
            row.insertCell().textContent = paciente.obraSocial;
            row.insertCell().textContent = paciente.nroAfiliado;
            
        }); */

        if ($.fn.DataTable.isDataTable('#table_patients')) {
            $('#table_patients').DataTable().destroy();
        }

        const table = $('#table_patients').DataTable({
            select: true,
            data: pacientes,
            columns: [
                { data: 'idPaciente', visible: false },
                {
                    data: null,
                    render: function (data, type, row) {
                        return data.nombre + ', ' + data.apellido;
                    }
                },
                { data: 'sexo' },
                { data: 'fechaNacimiento' },
                {
                    data: null, render: function (data, type, row) {
                        return data.provincia + ', ' + data.localidad;
                    }
                },
                { data: 'domicilio' },
                { data: 'telefono' },
                { data: 'email' },
                { data: 'obraSocial' },
                { data: 'nroAfiliado' },
            ]
        });

        /* let btn = document.createElement('button');
        btn.classList = 'btn btn-success';
        btn.id = 'confirmar'
        //btn.disabled = true;
        btn.innerHTML = 'Confirmar'
        btn.type = 'button';
        document.getElementById('form_examenes').appendChild(btn);
        $('#confirmar').on('click', function () {

            const selectedRow = table.rows('.selected').data();
            if (selectedRow.length > 0) {
                const idPaciente = selectedRow[0].idPaciente;
                //console.log(selectedRow[0].idPaciente);
                confirmarOrden(idPaciente);
            } else {
                console.log('Tenes que seleccionar un paciente, ameo');
            }

        }); */


    } else {

        let btn = document.createElement('button');
        btn.classList.add('btn');
        btn.classList.add('btn-warning');
        btn.id = 'btn_registrarP';
        btn.innerHTML = 'Registrar paciente nuevo';
        let p = document.createElement('p');
        p.id = 'p_registrarP'
        p.innerHTML = '¡No se encontro ningun paciente!'
        document.getElementById('search').appendChild(btn);
        document.getElementById('search').appendChild(p);
    }


}


//devuelve 'mail' si el input contiene patron de mail
//devuelve 'string' si el input contiene solo letras
//devuelve 'number' si el input contiene solo numeros
//devuelve 'error' si esta vacio o contiene un valor invalido(no es mail, ni solo letras, ni solo numeros)
//Agrega las clases correspondientes de error y correct para un poco de css
const verificar = (input) => {
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
            input.classList.remove('correct');
            input.classList.add('error');
        }
    } else {
        input.classList.remove('correct');
        input.classList.add('error');

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

async function buscarExamenes() {
    const input = document.getElementById('idExamen');
    //console.log(input.value);
    if (verificar(input) === 'number') { //busca por ID
        try {
            const res = await fetch(`/ordenes/examenes/buscarPorId/${input.value}`);
            if (!res.ok) {
                throw new Error('Network response was not ok... :c');
            }
            const examenes = await res.json();

            llenarTableExamenes(examenes)
        } catch (err) {
            console.error('Error:', err);
        }
    } else if (verificar(input) === 'string') { //busca por nombre
        try {
            const res = await fetch(`/ordenes/examenes/buscarPorNombre/${input.value}`);
            if (!res.ok) {
                throw new Error('Network response was not ok... :c');
            }
            const examenes = await res.json();
            llenarTableExamenes(examenes)
        } catch (err) {
            console.error('Error:', err);
        }
    }
}

function llenarTableExamenes(examenes) {
    if (examenes.length > 0) { 
        if ($.fn.DataTable.isDataTable('#table_examenes')) { //si existe una instancia inicializada de datatable la destruyo para inicializarla de nuevo mas adelante
            $('#table_examenes').DataTable().destroy();
        }

        let examenesHabilitados = [];

        //console.log(examenes);
        examenes.forEach(e => {
            if (e.habilitado === 1) {
                examenesHabilitados.push({
                    idExamenes: e.idExamenes,
                    nombre: e.nombre,
                    requerimientos: e.requerimiento,
                    diasDemora: e.diasDemora + ' hs',
                    tipoAnalisis: e.tipoAnalisis
                });
            }

        });

        const table = $('#table_examenes').DataTable({ //estoy inicializando la table y mas arriba destruyendola, ya que solo se pueden inicializar una sola vez... :c
            select: true,
            data: examenesHabilitados,
            columns: [
                { data: 'idExamenes', visible: false },
                { data: 'nombre' },
                { data: 'requerimientos' },
                { data: 'diasDemora' },
                { data: 'tipoAnalisis' },
            ]
        });


        let btn = document.createElement('button');
        btn.classList = 'btn btn-secondary';
        btn.id = 'agregarExamen'
        //btn.disabled = true;
        btn.innerHTML = 'Agregar examen'
        btn.type = 'button';
        document.getElementById('form_examenes').appendChild(btn);
        $('#agregarExamen').on('click', function () { //recupero mi btn y le agrego la funcion onclick

            const selectedRow = table.rows('.selected').data(); //devuelve la fila que este seleccionada y el data() es para decirle que me de los datos
            if (selectedRow.length > 0) { //si es mayor a cero quiere decir que hay algo seleccionado
                console.log(selectedRow); //muestra varias cositas
                console.log(selectedRow[0]); //muestra lo que se alceno de datos dentro de cada columna de esa fila
                agregarExamen(selectedRow[0]); 
                //data() devuelve varias cosas por lo que le pido que me de lo que esta en [0] que es donde se almacena un obj de los datos
            } else {
                console.log('Tenes que seleccionar un examen a agregar, ameo');
            }
        })

    } else {
        console.log('No se encontraron examenes');
    }
}

//!!! EPA ATENCION ACA!! esta es la manera que creo que es mas correcta de crear la table; la creo una sola vez de manera global en tableAgregados
//en vez de crearla dentro de una funcion local y que luego no pueda accederla desde otras
//y de paso no la estoy destruyendo cada vez que la tengo que llenar para poder inicializar una nueva que la reemplaze
//(de seguro hay otras maneras, aun estoy viendo bien como es...)
let tableAgregados;
$(document).ready(function () { //en cuanto la pagina esta lista se inicializa la datatable seleccionando mi table de id table_agregados
    tableAgregados = $('#table_agregados').DataTable({
        //select: true, //opcion por si quieres que las filas sean seleccionables (false por default)
        columns: [ //inicializo las columnas
            { title: '', data: 'idExamenes', visible:false}, //columna oculta, no se puede ver ni inspeccionando la pagina(esta buena para los IDs)
            { title: 'Nombres:', data: 'nombre' }, 
            { title: 'Requerimientos:', data: 'requerimientos' }, 
            { title: 'Tipo de muestra:', data: 'tipoAnalisis' }, 
            { title: 'Hs. demora aprox.:', data: 'diasDemora' }, 

            //IMPORTANTE: el objecto que vayas a introducir luego en cada fila debera
            //tener propiedades que coincidan con los data para que se acomoden solas con la columna de data correspondiente
            //por ejemplo: paciente {nombre: 'Valentina', tipoAnalisis: 'Sangre', etc} 
            //los valores de nombre y el tipoAnalisis se acomodaran solas con su columnas correspondiente sin importar el orden 
            //cuando hagas un tableAgregados.row.add(paciente).draw();

             /* { title: 'Eliminar', data: null, render: function (data, type, row) {
                return data.eliminar; 
            }}  */]
    })
})

function agregarExamen(row) {
    try {
        console.log(row);
        console.log(row.idExamenes);
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = 'Eliminar';
        
        /* dataAgregar = {
            'Nombres:': row.data()[0].nombre,
            'Requerimientos:': row.data()[0].requerimientos,
            'Tipo de muestra:': row.data()[0].tipoAnalisis,
            'Hs. demora aprox.:': row.data()[0].diasDemora
        };*/
        /* dataAgregar.eliminar = btn.outerHTML;
        //dataAgregar.ButtonElement = btn; */
        const index = 0;
        const idEnTable = tableAgregados.column(index).data().toArray(); //para convertir en array los datos que esten en la columna index(en este caso index = 0 ya que ahi guarde los ID (columna invisible)) 
        //console.log(idEnTable);
        if (!idEnTable.includes(row.idExamenes)){ //si el ID de la row seleccionada esta incluida dentro del array de IDs quiere decir que ya esta dentro de la lista (niego con !)
            tableAgregados.row.add(row).draw(); //si no esta incluida dentro de la lista, la agrego (supuestamente .rows agregaria de a varios, en este caso .row solo porque le paso un solo obj, en vez de un arr de obj)
        } else {
            console.log('El examen ya esta agregado, como vas a querer agregar dos veces el mismo examen?!');
        }
        
        
    } catch (err) {
        console.error(err);
    }
}

crearOrden = () =>{
    let examenes = tableAgregados.rows().data().toArray();
    console.log(examenes);

}