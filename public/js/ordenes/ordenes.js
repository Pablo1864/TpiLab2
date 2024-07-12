
import { Toast, disableTableSelection, llenarTableMuestras, initBtnCrear } from './common.js'

//para configurar las datatables languague
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

$(document).ready(function () {

    const tablePacientes = $('#table_patients').DataTable();
    const tableMedicos = $('#table_medics').DataTable();
    const tableDiagnosticos = $('#table_diagnosticos').DataTable();
    const tableDiagnosticosAgregados = $('#table_diagnosticos_agregados').DataTable();
    const tableExamenes = $('#table_examenes').DataTable();
    const tableAgregados = $('#table_agregados').DataTable();
    const tableMuestras = $('#table_muestras').DataTable();

    initBtnCrear();

    document.getElementById('crearOrden').addEventListener('click', () => {

        if (tablePacientes.row({ selected: true }).data() != null && tableMedicos.row({ selected: true }).data() != null) {
            crearOrden(tablePacientes, tableMedicos, tableAgregados, tableDiagnosticosAgregados);
        } else {
            Toast.fire({
                icon: 'error',
                title: '¡Por favor, selecciona un paciente y un médico!'
            })
        }
    });
    
})




async function crearOrden(tablePacientes, tableMedicos, tableExamenesAgregados, tableDiagnosticosAgregados) {

    if (tablePacientes.row({ selected: true }).data() != null && tableMedicos.row({ selected: true }).data() != null) {
        const examenesArray = tableExamenesAgregados.rows().data().toArray();
        const idExamenesArr = examenesArray.map(e => e.idExamenes);
        const diagnosticosArray = tableDiagnosticosAgregados.rows().data().toArray();
        console.log("ExamenesArr: ", examenesArray);
        const idDiagnosticosArr = diagnosticosArray.map(d => d.idDiagnostico);
        console.log("idDiagnosticosArr: ", idDiagnosticosArr);
        const pacienteData = tablePacientes.row({ selected: true }).data();
        const medicoData = tableMedicos.row({ selected: true }).data();
        let estado = 'Ingresada';
        //i.e. 'Ingresada' = orden parcial solo con paciente y doctor como minimo, y examenes o diagnostico ingresado(aka. orden editable)
        //'Esperando toma de muestras' = orden con todo lo necesario, solo necesita muestras
        if (idExamenesArr.length > 0 && idDiagnosticosArr.length > 0) {
            /*estado = 'Analítica';
            for (let i = 0; i < idExamenesArr.length; i++) {
                if (!(examenesArray[i].requerimiento.trim() == '' || examenesArray[i].requerimiento == null || examenesArray[i].requerimiento.trim() == "nada")) {
                    estado = 'Esperando toma de muestras';
                    console.log("hay un examen minimo que requiere muestra");
                    break;
                }
            }*/
            estado = 'Esperando toma de muestras';
        }
        console.log("estado de la orden:", estado);
        let examenesArr = [];
        for (let i = 0; i < idExamenesArr.length; i++) {
            examenesArr.push({
                idExamen: idExamenesArr[i],
                tipo: examenesArray[i].tipoAnalisis,
            });
        }
        console.log("examenes: ", examenesArr);

        const data = {
            idPaciente: pacienteData.idPaciente,
            idMedico: medicoData.idMedico,
            idDiagnosticosArr: idDiagnosticosArr,
            examenesArr: examenesArr,
            estado: estado
        }

        try {

            const res = await fetch('/ordenes/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const ordenResponse = await res.json();
            console.log("Response: ", ordenResponse);

            if (ordenResponse && ordenResponse[0].nroOrden > 0 && ordenResponse[0].rowsAffectedDiagnosticos == idDiagnosticosArr.length && ordenResponse[0].rowsAffectedExamenes == idExamenesArr.length) {
                const html = getHtmlOrder(ordenResponse[0], pacienteData, medicoData, examenesArray, diagnosticosArray);
                $('#titleMuestra').text(`Muestras de la Orden &deg ${ordenResponse[0].nroOrden}`);
                mostrarModalCreacionOrden(ordenResponse[0].nroOrden, html, (estado == 'Esperando toma de muestras'), examenesArray, ordenResponse[0].muestrasInsertadas);

            } else {
                console.log("No se pudo crear la orden");
                console.log(ordenResponse[0].rowsAffectedDiagnosticos);
                console.log(ordenResponse[0].rowsAffectedExamenes);
                console.log(idDiagnosticosArr.length);
                await Toast.fire({
                    icon: 'error',
                    title: '¡Error al crear la orden!',
                    text: 'Intentelo nuevamente más tarde.'
                });
            }
            console.log("respuesta: ", ordenResponse);
        } catch (error) {
            console.log(error);
            await Toast.fire({
                icon: 'error',
                title: '¡Error en el servidor!',
                text: 'La orden no pudo ser creada. Intentelo nuevamente más tarde.'
            });
        }

    }
}
//construye el html de la orden para mostrar en el modal
function getHtmlOrder(ordenResponse, pacienteData, medicoData, examenesArray1, diagnosticosAgregadosArray) {
    const nombreApellidoPaciente = pacienteData.apellido + ', ' + pacienteData.nombre;
    const nombreApellidoMedico = medicoData.apellido + ', ' + medicoData.nombre;
    let listaDiagnosticos = "";
    let listaExamenes = "";
    let muestras = [];
    let listaMuestras = "";
    if (ordenResponse.rowsAffectedDiagnosticos > 0) {
        const diagnosticosArray = diagnosticosAgregadosArray;
        listaDiagnosticos = "<p>Diagnostico(s): ";
        diagnosticosArray.forEach((element, index) => {
            listaDiagnosticos += element.nombre;
            if (index == diagnosticosArray.length - 1) {
                listaDiagnosticos += '.</p>';
            } else {
                listaDiagnosticos += ', ';
            }
        })
    };
    if (ordenResponse.rowsAffectedExamenes > 0) {
        const examenesArray = examenesArray1;
        listaExamenes = "<p>Examen(es): ";
        examenesArray.forEach((element, index) => {
            listaExamenes += element.nombre;
            if (index == examenesArray.length - 1) {
                listaExamenes += '.</p>';
            } else {
                listaExamenes += ', ';
            }
            console.log(!muestras.includes(element.tipoAnalisis));
            if (!muestras.includes(element.tipoAnalisis)) {
                //if (!(element.requerimiento.trim() == '' || element.requerimiento == null || element.requerimiento == "nada")) {
                    muestras.push(element.tipoAnalisis);
                //}
            }
        })
    };
    muestras.forEach((element, index) => {
        console.log(element + " elemento en muestras");
        listaMuestras += element;
        if (index == muestras.length - 1) {
            listaMuestras += '.';
        } else {
            listaMuestras += ', ';
        }
    });

    const html = `<div>
                <p>Paciente: ${nombreApellidoPaciente}</p>
                <p>Medico: ${nombreApellidoMedico}</p>
                ${listaDiagnosticos}
                ${listaExamenes}
                ${muestras.length == 0 ? '' : `<p>Muestras necesarias: ${listaMuestras}</p>`}
                </div>`;
    return html;
}

async function mostrarModalCreacionOrden(idOrden, html, hasMuestras, examenesArray, muestrasData) { //TODO: re-do showModal and crearModal into one function, plus add button to show muestras tab and manage muestras

    const result = await Swal.fire({
        title: `Orden nro ${idOrden}° creada con éxito!`,
        html: html,
        showCancelButton: true,
        showDenyButton: true,
        showConfirmButton: hasMuestras ? true : false,
        cancelButtonText: 'Crear nueva orden',
        confirmButtonText: 'Agregar muestras',
        denyButtonText: 'Editar orden',
        icon: 'success'
    });

    if (result.isConfirmed) { //'Agregar muestras'
        console.log("agregar muestras");
        console.log("muestras data: ", muestrasData);
        mostrarTabMuestras(idOrden, examenesArray, muestrasData);
    } else if (result.isDenied) { //'editar orden'
        console.log("Editar orden");
        await irAEditarOrden(idOrden);
    } else { // cancelar o clickear fuera del modal, o esc: crear nueva orden'
        location.reload();
    }
    return
}

//shows tab muestras and disables other tables and buttons so they can't be clicked or iteracted with
function mostrarTabMuestras(idOrden, examenesArr, listaMuestras) {
    console.log("mostrar tab muestras");

    llenarTableMuestras(listaMuestras, examenesArr, idOrden);
    $('#nav-muestras-tab').removeClass('d-none');
    $('#nav-muestras-tab').click();
    $('#crearOrden').prop('disabled', true);
    $('#crearOrden').hide();

    disableTableSelection($('#table_patients').DataTable());
    disableTableSelection($('#table_medics').DataTable());

    //$('#buscarMedico').off('click'); //btn
    $('#buscarMedico').prop('disabled', true); //btn
    $('#medicoId').prop('disabled', true); //input

    //$('#buscarPaciente').off('click'); //btn
    $('#buscarPaciente').prop('disabled', true); //btn
    $('#pacienteID').prop('disabled', true); //input

    $('#diagnosticoSearch').prop('disabled', true); //input
    $('#buscarDiagnosticos').prop('disabled', true); //btn
    //$('#buscarDiagnosticos').off('click'); //btn

    $('#idExamen').prop('disabled', true); //input
    $('#buscarExamenes').prop('disabled', true); //btn
    //$('#buscarExamenes').off('click'); //btn

    $('#table_diagnosticos tbody').off('click');
    $('#table_diagnosticos_agregados tbody').off('click');

    $('#table_examenes tbody').off('click');
    $('#table_agregados tbody').off('click');

    $('#divTablaPaciente').addClass('disable-table');
    $('#divTablaMedicos').addClass('disable-table');
    $('#divTablasDiagnosticos').addClass('disable-table');
    $('#divTablasExamenes').addClass('disable-table');
}

async function irAEditarOrden(nroOrden) {
    console.log("ir a editar orden: ", nroOrden);
    try {
        if (nroOrden && nroOrden > 0) {
            console.log("nroOrden: ", nroOrden);
            const res = await fetch(`/ordenes/editar/${nroOrden}`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                }
            });
            if (!res.ok) {
                await Toast.fire({
                    icon: 'error',
                    title: '¡Error en el servidor!',
                    text: 'Error al redirigir a la lista de ordenes.'
                })
            } else {
                window.location.href = `/ordenes/editar/${nroOrden}`
            }
        }
    } catch (error) {
        Toast.fire({
            icon: 'error',
            title: '¡Error!',
            text: error.message
        });
        console.log(error);
    }
    
}