export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    customClass: {
        popup: 'colored-toast',
        icon: 'colored-toast-icon',
    },
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    onOpen: (toast) => {
        let remainingTime = Swal.getTimerLeft();
        toast.addEventListener('mouseenter', () => {
            remainingTime = Swal.getTimerLeft();
            Swal.stopTimer();
        });
        toast.addEventListener('mouseleave', () => {
            Swal.resumeTimer(remainingTime);
        });
    }
})

export const config = (dataSingular, dataPlural) => {
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

export function checkAlpha(value) {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ-\s]+$/.test(value)) {
        return false;
    }
    return true;
}

export function checkNumeric(value) {
    if (!/^[0-9]+$/.test(value)) {
        return false;
    }
    return true;
}

export function disableTableSelection(table) {
    console.log('table disabled', table);
    table.select.style('api');
    table.off('select');
    table.off('deselect');
    //table.table().node().classList.add('disable-table');
}

export function llenarTableMuestras(muestrasData, examenesArr, idOrden) {
    console.log("llenando table muestras");
    let dataArray = [];
    let tipoMuestra = [];
    examenesArr.forEach(element => {
        if (!tipoMuestra.includes(element.tipoAnalisis)) {
            tipoMuestra.push(element.tipoAnalisis);
        }
    })
    tipoMuestra.forEach(element => {
        dataArray.push({
            idMuestra: muestrasData.filter(m => m.tipo == element).map(m => m.idMuestra),
            tipo: element,
            presentada: muestrasData.filter(m => m.tipo == element).map(m => m.estado)[0], //All values should technically be the same, thus I just take the first
            idExamenes: examenesArr.filter(e => e.tipoAnalisis == element).map(e => e.idExamenes), //idExamenes
        });
    })

    const table = $('#table_muestras').DataTable();

    $('#table_muestras tbody').on('click', '.add-muestra-button', async function () {
        const row = table.row($(this).parents('tr'));
        if (idOrden) {
            try {
                const res = await modificarMuestras(table, idOrden, row, true, examenesArr);//true = add
                if (res){
                    document.getElementById('i5').classList = 'bi bi-check-circle ms-2 text-success';
                } else {
                    document.getElementById('i5').classList = 'bi bi-x-circle ms-2 text-danger';
                }
            } catch (error) {
                Toast.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: error.message
                });
                console.log("Error", error);
            }
        }
    })

    $('#table_muestras tbody').on('click', '.delete-muestra-button', async function () {
        const row = table.row($(this).parents('tr'));
        if (row.data().idMuestra != 0 && idOrden) {
            try {
                const res = await modificarMuestras(table, idOrden, row, false, examenesArr);//false = delete
                if (res){
                    document.getElementById('i5').classList = 'bi bi-check-circle ms-2 text-success';
                } else {
                    document.getElementById('i5').classList = 'bi bi-x-circle ms-2 text-danger';
                }
            } catch (error) {
                Toast.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: error.message
                });
                console.log("Error", error);
            }
        }
    });
    
    $("#table_muestras tbody").on("click", ".print-button", async function () {
        const row = table.row($(this).parents("tr"));
        if (idOrden) {
            try {
                const labels = await printMuestra(row.data().tipo, idOrden);
                $("#container-label").html(labels);
                window.print();
            } catch (error) {
                Toast.fire({ icon: 'error', title: '¡Error al imprimir!', text: error.message });
                console.log(error);
            }
        }
    });

    table.clear();
    table.rows.add(dataArray).draw();
    table.columns.adjust().draw();
    table.responsive.recalc().draw();

}

export async function printMuestra(tipo, idOrden) {
    const res = await fetch('/ordenes/imprimir/datasample', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idOrden: idOrden,
            tipoMuestra: tipo
        }),
    });
    if (!res.ok) {
        const data = await res.json();
        console.log(data.error);
        throw new Error(data.error);
    } else {
        const data = await res.json();
        const labels = generateLabels(data);
        return labels;
    }
}

export async function manejarFetch2(url){
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        console.log(err);
        Toast.fire ({
            icon: 'error',
            title: 'Error durante la busqueda!',
            text: err.message || 'Error inesperado, por favor intentelo de nuevo'
        });
    }
    return [];
};

function generateLabels(data) {
    let label = `<div class="label-template">
    <p>Orden n.&deg {{idOrden}}</p>
    <p>Pac.: {{nombre}}</p>
    <p>Cód. pac.: {{idPaciente}}</p>	
    <p>DNI: {{dni}}.</p>
    <p class="fecha"> {{fecha}}</p>
    </div>`;
    const html = data.map(d => {
        return label.replace('{{idOrden}}', d.nroOrden)
            .replace('{{nombre}}', d.nombrePaciente + ' ' + d.apellido)
            .replace('{{idPaciente}}', d.idPaciente)
            .replace('{{dni}}', d.dni)
            .replace('{{fecha}}', formatDateTime(d.fechaModif));
    }).join('');
    return html;
}

export function formatDateTime(isoStrng) {
    const date = new Date(isoStrng);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedD = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
    return formattedD;
}

export async function irAEditarOrden(nroOrden) {
    console.log("ir a editar orden: ", nroOrden);
    try {
        if (!checkNumeric(nroOrden)) {
            throw new Error( 'El nro. de orden debe ser un valor numérico');
        };
        if (nroOrden && nroOrden > 0) {
            const res = await fetch(`/ordenes/editar/${nroOrden}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            } else if (res.ok && data.success){
                window.location.href = `/ordenes/editar/${nroOrden}`
            }
        }
    } catch (error) {
        const res = await Swal.fire({
            icon: 'error',
            title: '¡Error al redirigir a la edición de la orden '+nroOrden+'!',
            text: error.message || 'Error inesperado, por favor intentelo de nuevo en otro momento',
            confirmButtonText: 'Intentar de nuevo',
        });
        if (res.isConfirmed) {
            window.location.href = `/ordenes/editar/${nroOrden}`;
        }
        console.log(error);
    }
    
}

//throw new Error(data.error);
export async function fetchModificarMuestras(idOrden, idMuestra, agregar) {
    const res = await fetch('/ordenes/modificarMuestras', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idOrden: idOrden, //id de orden
            arrayidMuestras: idMuestra, //array de id de muestras
            estado: agregar ? 1 : 0 //new estado de muestra
        })
    })

    if (!res.ok) {
        throw new Error(await res.json().error);
    } else {
        return await res.json();
    }
}

async function modificarMuestras(tableMuestras, idOrden, row, estado, examenesArr) {
    try {
        const data = await fetchModificarMuestras(idOrden, row.data().idMuestras, estado);
        if (data) {
            Toast.fire({ icon: 'success', title: `Muestra ${estado? "agregada" : "eliminada"} con exito.` });
            
            console.log("Agregar muestra, response data: ", data);

            let updatedRow = row.data();
            updatedRow.presentada = estado;
            tableMuestras.row(row).data(updatedRow).draw();
            tableMuestras.columns.adjust().draw();
            tableMuestras.responsive.recalc();
            
            if (data.estadoOrden){
                let totalDays = 0; 
                examenesArr.map((row) => { if (row.diasDemora > totalDays) { totalDays = row.diasDemora } });
                await Swal.fire({
                    icon: 'success',
                    title: `Orden n.&deg ${idOrden} actualizada`,
                    text: `Todas las muestras han sido agregadas. Los resultados de la orden estarán disponibles en ${totalDays} días.`,
                })
            }
            
            return data.estadoOrden ? true : false; //estadoOrden es null si no hubo cambio de estado en la orden
        }
    } catch (error) {
        console.log(error);
        Toast.fire({ icon: 'error', title: 'Ocurrio un error al agregar la muestra!', text: error.message });
    }

}

export function initBtnCrear(){
    const tablePacientes = $('#table_patients').DataTable();
    const tableMedicos = $('#table_medics').DataTable();
    const tableDiagnosticosAgregados = $('#table_diagnosticos_agregados').DataTable();
    const tableAgregados = $('#table_agregados').DataTable();
    
    $('#table_patients, #table_medics').DataTable().on('select', function (e, dt, type, indexes) {
        if (tablePacientes.row({ selected: true }).data() != null && tableMedicos.row({ selected: true }).data() != null) {
            switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
                tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
                'crearOrden', 'Crear orden', 'Crear orden y seguir más tarde');
        }
    })

    $('#table_patients, #table_medics').DataTable().on('deselect', function (e, dt, type, indexes) {
        if (tablePacientes.row({ selected: true }).data() == null || tableMedicos.row({ selected: true }).data() == null) {
            switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
                tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
                'crearOrden', 'Crear orden', 'Crear orden y seguir más tarde');
        }
    })

    $('#table_agregados, #table_diagnosticos_agregados').DataTable().on('draw.dt', function () {
        switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
            tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
            'crearOrden', 'Crear orden', 'Crear orden y seguir más tarde');
    });
}

export function initBtnEditar(dataOld){
    const tablePacientes = $('#table_patients').DataTable();
    const tableMedicos = $('#table_medics').DataTable();
    const tableDiagnosticosAgregados = $('#table_diagnosticos_agregados').DataTable();
    const tableAgregados = $('#table_agregados').DataTable();

    $('#table_patients, #table_medics').DataTable().on('select', function (e, dt, type, indexes) {
        if (tablePacientes.row({ selected: true }).data() != null && tableMedicos.row({ selected: true }).data() != null && (dataOld.paciente.idPaciente != tablePacientes.row({ selected: true }).data().idPaciente || dataOld.medico.idMedico != tableMedicos.row({ selected: true }).data().idMedico)) {
            switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
                tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
                'editarOrden', 'Actualizar orden', 'Actualizar orden y seguir más tarde');
        }
    })

    $('#table_patients, #table_medics').DataTable().on('deselect', function (e, dt, type, indexes) {
        if (tablePacientes.row({ selected: true }).data() == null || tableMedicos.row({ selected: true }).data() == null) {
            tablePacientes.rows();
            switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
                tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
                'editarOrden', 'Actualizar orden', 'Actualizar orden y seguir más tarde');
        }
    })

    $('#table_agregados, #table_diagnosticos_agregados').DataTable().on('draw.dt', function () {
        if (!compareArrayId(tableDiagnosticosAgregados.rows().data().toArray().map(e => e.idDiagnostico), dataOld.diagnosticos.map(d => d.idDiagnostico)) || !compareArrayId(tableAgregados.rows().data().toArray().map(e => e.idExamenes), dataOld.examenes.map(d => d.idExamenes))) {
            switchBtn(tablePacientes.row({ selected: true }).data(), tableMedicos.row({ selected: true }).data(),
                tableDiagnosticosAgregados.rows().data().toArray(), tableAgregados.rows().data().toArray(),
                'editarOrden', 'Actualizar orden', 'Actualizar orden y seguir más tarde');
        } else {
            switchBtn(null, null,
                [], [],
                'editarOrden', 'Actualizar orden', 'Actualizar orden y seguir más tarde');
        }
            
    });
}

function compareArrayId(arrId1, arrId2) {
    if (arrId1.length != arrId2.length) {
        return false;
    }
    const set2 = new Set(arrId2);
    return arrId1.every((val) => set2.has(val));
}

function switchBtn(paciente, medico, examenes, diagnosticos, idBtn, btnTextAll, btnTextMinim){
    if(paciente != null && medico != null && diagnosticos.length > 0 && examenes.length > 0){
        $('#' + idBtn).prop('disabled', false);
        $('#' + idBtn).text(btnTextAll);
    } else if (paciente != null && medico != null) {
        $('#' + idBtn).prop('disabled', false);
        $('#' + idBtn).text(btnTextMinim);
    } else {
        if (idBtn == 'crearOrden') {
            $('#' + idBtn).prop('disabled', true);
            $('#' + idBtn).text('Por favor, seleccione un paciente y un medico');
        } else if (idBtn == 'editarOrden') {
            $('#' + idBtn).prop('disabled', true);
            $('#' + idBtn).text(btnTextMinim);
        }
    }
}

export function agruparMuestrasArr ( muestrasArr){
    const obj = muestrasArr.reduce((obj, item) => {
        if (!obj[item.tipo]) {
            obj[item.tipo] = {idMuestras:[], idExamenes:[], tipoAnalisis:item.tipo, presentada:true};
        }
        obj[item.tipo].idMuestras.push(item.idMuestra);
        obj[item.tipo].idExamenes.push(item.idExamenes);
        if (item.estado === 0) {
            obj[item.tipo].presentada = false
        }
        return obj
    }, {});
    return Object.values(obj);
}

export const llenarTableConData = (table, data) => {
    table.clear();
    table.rows.add(data).draw();
    table.columns.adjust().draw();
    table.responsive.recalc().draw();
}
//agrega la fila a la tabla
export function agregarRow(row, tablaAddRow, id) {
    try {
        const idEnTable = tablaAddRow.column(0).data().toArray(); //index 0 es mi columna de id (invisible)
        if (!idEnTable.includes(row[id])) { //si el ID de la row seleccionada esta incluida dentro del array de IDs quiere decir que ya esta dentro de la lista (niego con !)
            tablaAddRow.row.add(row).draw(); //si no esta incluida dentro de la lista, la agrego (supuestamente .rows agregaria de a varios, en este caso .row solo porque le paso un solo obj, en vez de un arr de obj)
            tablaAddRow.columns.adjust().draw();
            tablaAddRow.responsive.recalc();
            return true; //logro agregar algo
        }
    } catch (err) {
        console.log(err);
    }
    return false; //ya esta en la lista
}

export function disableInputsAndButtons(array, estado = true) {
    for (let i = 0; i < array.length; i++) {
        $(array[i]).prop('disabled', estado);
    }
}
export function disablePatientsAndMedics(){
    disableTableSelection($('#table_patients').DataTable());
    disableTableSelection($('#table_medics').DataTable());
    $('#divTablaPaciente').addClass('disable-table');
    $('#divTablaMedicos').addClass('disable-table');
    disableInputsAndButtons([$('#medicoBtn'), $('#pacienteBtn'), $('#medicoBuscador'), $('#pacienteBuscador'), $('#pacienteFilter'), $('#medicoFilter')]);
}

export function disableDiagnosisAndExams(){
    disableTableSelection($('#table_agregados').DataTable());
    disableTableSelection($('#table_examenes').DataTable());
    disableTableSelection($('#table_diagnosticos').DataTable());
    disableTableSelection($('#table_diagnosticos_agregados').DataTable());
    $('#divTablasDiagnosticos').addClass('disable-table');
    $('#divTablasExamenes').addClass('disable-table');
    disableInputsAndButtons([$('#diagnosticoSearch'), $('#diagnosticoBtn'), $('#examenBuscador'), $('#examenBtn'), $('#diagnosticoFilter'), $('#examenFilter')]);
}

export function disableMuestras(){
    disableTableSelection($('#table_muestras').DataTable());
    disableInputsAndButtons([$('.add-muestra-button'), $('.delete-muestra-button')]);
}