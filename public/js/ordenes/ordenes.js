import { irAEditarOrden, Toast, disableTableSelection, llenarTableMuestras, initBtnCrear, checkNumeric } from './common.js'

$(document).ready(function () {

    initBtnCrear();

    document.getElementById('crearOrden').addEventListener('click', () => {
        crearOrden($('#table_patients').DataTable(), $('#table_medics').DataTable(), $('#table_agregados').DataTable(), $('#table_diagnosticos_agregados').DataTable());
    });
    
})

async function crearOrden(tablePacientes, tableMedicos, tableExamenesAgregados, tableDiagnosticosAgregados) {

    if (tablePacientes.row({ selected: true }).data() != null && tableMedicos.row({ selected: true }).data() != null) {
        const examenesArray = tableExamenesAgregados.rows().data().toArray();
        const idExamenesArr = examenesArray.map(e => e.idExamenes);
        const diagnosticosArray = tableDiagnosticosAgregados.rows().data().toArray();
        const idDiagnosticosArr = diagnosticosArray.map(d => d.idDiagnostico);
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

        let examenesArr = [];
        for (let i = 0; i < idExamenesArr.length; i++) {
            examenesArr.push({
                idExamen: idExamenesArr[i],
                tipo: examenesArray[i].tipoAnalisis,
            });
        }

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

            if (ordenResponse && res.ok && ordenResponse[0].nroOrden > 0 && ordenResponse[0].rowsAffectedDiagnosticos == idDiagnosticosArr.length && ordenResponse[0].rowsAffectedExamenes == idExamenesArr.length) {
                const html = getHtmlOrder(ordenResponse[0], pacienteData, medicoData, examenesArray, diagnosticosArray);
                $('#titleMuestra').html(`Muestras de la Orden &deg; ${ordenResponse[0].nroOrden}`);
                $('#crearOrden').prop('disabled', true);
                mostrarModalCreacionOrden(ordenResponse[0].nroOrden, html, (estado == 'Esperando toma de muestras'), examenesArray, ordenResponse[0].muestrasInsertadas);

            } else {
                console.log("No se pudo crear la orden");
                console.log(ordenResponse[0].rowsAffectedDiagnosticos);
                console.log(ordenResponse[0].rowsAffectedExamenes);
                console.log(idDiagnosticosArr.length);
                if (!res.ok){
                    throw new Error(ordenResponse.error);
                }   
                
            }
        } catch (error) {
            console.log(error);
            await Toast.fire({
                icon: 'error',
                title: '¡Error en el servidor!',
                text: 'Intentelo nuevamente más tarde. '+error
            });
        }

    } else {
        Toast.fire({
            icon: 'error',
            title: '¡Por favor, selecciona un paciente y un médico!'
        })
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

async function mostrarModalCreacionOrden(idOrden, html, hasMuestras, examenesArray, muestrasData) {

    const result = await Swal.fire({
        title: `Orden nro ${idOrden}&deg; creada con éxito!`,
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
    $('#medicoBtn').prop('disabled', true); //btn
    $('#medicoBuscador').prop('disabled', true); //input

    //$('#buscarPaciente').off('click'); //btn
    $('#pacienteBtn').prop('disabled', true); //btn
    $('#pacienteBuscador').prop('disabled', true); //input

    $('#diagnosticoBuscador').prop('disabled', true); //input
    $('#diagnosticoBtn').prop('disabled', true); //btn
    //$('#buscarDiagnosticos').off('click'); //btn

    $('#examenBuscador').prop('disabled', true); //input
    $('#examenBtn').prop('disabled', true); //btn
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

