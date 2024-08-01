import { redirigirAdministracion, updateOrderFun,irAEditarOrden, Toast, checkNumeric, llenarTableConData, compareArrayId, llenarTableMuestras, agregarRow, initBtnEditar, disablePatientsAndMedics, disableDiagnosisAndExams, disableMuestras  } from './common.js'

function selectRowById(table, id) {
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        let tableData = table.row(rowIdx).data();
        if (tableData.idPaciente == id || tableData.idMedico == id) {
            table.row(rowIdx).select();
            $(this.node()).addClass('highlight-row');
        }
    });
}

$(document).ready(async function () {

    $('#form_ordenes').submit(function (event) {
        event.preventDefault();
        //updateOrden(oldData);
    })
    
    if (editMode && oldOrden[0].nroOrden>0){
        console.log("MODO EDITAR DE ADMINISTRADORES", editMode);
        let msg = '';
        const estado = oldOrden[0].estado.toLowerCase();
        switch (estado) {
            case 'analitica' || 'analítica':
                msg = 'La edición de los examenes y muestras de la orden pueden causar errores inesperados.';
                break;
            case 'pre-analitica' || 'esperando toma de muestras':
                msg = 'La edición de los examenes puede causar perdida de datos de muestras existentes de la orden.';
                break;
            case 'ingresada':
                break;
            default:
                break;
        }
        swal.fire({
            title: '¡Cuidado!',
            text: `La orden se encuentra en estado ${estado}. ${msg}`,// 'La orden se encuentra en estado ' + oldOrden[0].estado + '. La edición completa de esta orden es solo para administradores.',
            icon: 'warning',
        });
    } else if (oldOrden[0].nroOrden>0){
        console.log("MODO EDITAR DE USUARIOS, MODO: NO ADMIN", editMode);
        try {
            if (!oldOrden || !oldOrden[0] || !oldOrden[0].nroOrden || !oldOrden[0].estado) {
                throw Error("No se encontro la orden!");
            } else if (!oldOrden[0].paciente.idPaciente && !oldOrden[0].medico.idMedico) {
                throw Error("No se encontro el paciente o el medico!");
            } else if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras' && (!oldOrden[0].muestras || oldOrden[0].muestras.length <= 0)) {
                throw Error("No se encontraron muestras!");
            } else if ((oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'pre-analitica') && (!oldOrden[0].muestras || oldOrden[0].muestras.length <= 0) && (!oldOrden[0].diagnosticos || oldOrden[0].diagnosticos.length <= 0) && (!oldOrden[0].examenes || oldOrden[0].examenes.length <= 0)) {
                throw Error("No se encontraron diagnosticos ni examenes!");
            }
        } catch (err) {
            console.log(err);
            const res = await swal.fire({
                title: 'Error',
                text: 'Hubo un error al cargar los datos. Por favor, utilize el formulario de edición de administradores. ' + err.message || '',
                icon: 'error',
                confirmButtonText: 'Editar como administrador',
                cancelButtonText: 'Intentar traer la orden nuevamente',
                showCancelButton: true
            })
            if (res.isConfirmed) {
                console.log("Editando como administrador");
                if (oldOrden[0].nroOrden > 0 && checkNumeric(oldOrden[0].nroOrden)) {
                    try {
                        const fetchRes = await fetch('/ordenes/editar/admin/' + oldOrden[0].nroOrden, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        const data = await fetchRes.json();
                        if (fetchRes.ok && data.success) {
                            window.location.href = '/ordenes/editar/admin/' + oldOrden[0].nroOrden;
                        } else {
                            throw new Error(data.error || 'Error al redirigir a la edición como administrador');
                        }
                    } catch (err) {
                       throw new Error(err.message || 'Error al redirigir a la edición como administrador');
                    }
                }
            } else if (res.isCancelled){
                console.log("Intentar traer la orden nuevamente");
                await irAEditarOrden(oldOrden[0].nroOrden);
                disablePatientsAndMedics();
                disableDiagnosisAndExams();
                disableMuestras();
                $('#table-muestras').dataTable().destroy();
                return;            
            } else {
                await irAEditarOrden(oldOrden[0].nroOrden);
                disablePatientsAndMedics();
                disableDiagnosisAndExams();
                disableMuestras();
                $('#table-muestras').dataTable().destroy();
                return;
            }
            
        }
    } else {
        swal.fire({
            title: 'Error fatal',
            text: 'No se encontro la orden. Por favor, contactese con un administrador.',
            icon: 'error',
        })
        disablePatientsAndMedics();
        disableDiagnosisAndExams();
        disableMuestras();
        $('#table-muestras').dataTable().destroy();
        return;
    }
    
    if (oldOrden[0].muestras && oldOrden[0].muestras.length > 0 && oldOrden[0].muestras.every( x => x.estado != 0)) {
        $('#i5').removeClass().addClass('bi bi-check-circle ms-2 text-success');
    } else if (oldOrden[0].muestras && oldOrden[0].muestras.length > 0) {
        $('#i5').removeClass().addClass('bi bi-x-circle ms-2 text-danger');
    }

    if (oldOrden && oldOrden[0] && oldOrden[0].paciente && oldOrden[0].medico) {
        
        console.log("Data:", oldOrden);

        $('#table_patients').DataTable().on('draw.dt', function () {
            selectRowById($('#table_patients').DataTable(), oldOrden[0].paciente.idPaciente);
        });

        $('#table_medics').DataTable().on('draw.dt', function () {
            selectRowById($('#table_medics').DataTable(), oldOrden[0].medico.idMedico);
        });

        const paciente = {
            idPaciente: oldOrden[0].paciente.idPaciente,
            nombre: oldOrden[0].paciente.nombre,
            apellido: oldOrden[0].paciente.apellido,
            email: oldOrden[0].paciente.email,
            dni: oldOrden[0].paciente.dni,
            sexo: oldOrden[0].paciente.sexo,
            fechaNacimiento: oldOrden[0].paciente.fechaNacimiento,
            obraSocial: oldOrden[0].paciente.obraSocial,
            nroAfiliado: oldOrden[0].paciente.nroAfiliado,
            domicilio: oldOrden[0].paciente.domicilio,
            localidad: oldOrden[0].paciente.localidad,
            provincia: oldOrden[0].paciente.provincia,
            telefono: oldOrden[0].paciente.telefono
        }
        const medico = {
            idMedico: oldOrden[0].medico.idMedico,
            nombre: oldOrden[0].medico.nombre,
            apellido: oldOrden[0].medico.apellido,
            email: oldOrden[0].medico.email,
            matricula: oldOrden[0].medico.matricula
        }
        function llenarTableDiagnosticosExamenes() {
            try {
                if (oldOrden[0].diagnosticos && oldOrden[0].diagnosticos.length > 0) {
                    oldOrden[0].diagnosticos.forEach(diagnostico => {
                        if (agregarRow(diagnostico, $('#table_diagnosticos_agregados').DataTable(), 'idDiagnostico')) {
                            $('#i3').removeClass().addClass('bi bi-check-circle ms-2 text-success');
                        };
                    })
                    $('#table_diagnosticos_agregados').DataTable().responsive.recalc().draw();
                } else {
                    $('#i3').removeClass().addClass('bi bi-x-circle ms-2 text-danger');
                }
                if (oldOrden[0].examenes && oldOrden[0].examenes.length > 0) {
                    oldOrden[0].examenes.forEach(examen => {
                        if (agregarRow(examen, $('#table_agregados').DataTable(), 'idExamenes')) {
                            $('#i4').removeClass().addClass('bi bi-check-circle ms-2 text-success');
                        };
                    })
                    $('#table_agregados').DataTable().responsive.recalc().draw();
                } else {
                    $('#i4').removeClass().addClass('bi bi-x-circle ms-2 text-danger');
                }

            }
            catch (error) {
                Toast.fire({
                    icon: 'error',
                    title: '¡Algo salio mal!',
                    text: 'Error al cargar los diagnosticos de la orden. Por favor, vuelva a intentar más tarde.'
                })
            }
        }

        llenarTableConData($('#table_patients').DataTable(), [paciente]);
        llenarTableConData($('#table_medics').DataTable(), [medico]);
        
        if (editMode){ // EDIT MODE ADMIN
            $('#editarOrden').prop('disabled', false);
            $('#editarOrden').on('click', async () => {

                const paciente = $('#table_patients').DataTable().row({ selected: true }).data();
                const idPaciente = paciente?paciente.idPaciente:0;
                const medico = $('#table_medics').DataTable().row({ selected: true }).data()
                const idMedico = medico?medico.idMedico:0;
                const diagnosticosArray = $('#table_diagnosticos_agregados').DataTable().rows().data().toArray();
                const idDiagnosticosArray = diagnosticosArray.length>0? diagnosticosArray.map(row => row.idDiagnostico) : [];
                const examenesArray = $('#table_agregados').DataTable().rows().data().toArray();
                const idExamenesArray = examenesArray.length>0? examenesArray.map(row => row.idExamenes): [];
                
                console.log("order: ", idPaciente, ", ", idMedico, ", ", idDiagnosticosArray, ", ", idExamenesArray);
                if (oldOrden[0].paciente.idPaciente == idPaciente && oldOrden[0].medico.idMedico == idMedico && oldOrden[0].diagnosticos.length>0 && oldOrden[0].examenes.length>0 && compareArrayId(oldOrden[0].diagnosticos.map(d => d.idDiagnostico), idDiagnosticosArray) && compareArrayId(oldOrden[0].examenes.map(e => e.idExamenes), idExamenesArray)) {
                    console.log("no hay cambios");
                    if (idPaciente == 0 || idMedico == 0) {
                        await swal.fire({
                            title: 'Error',
                            text: 'Debes seleccionar un paciente y un medico para continuar.',
                            icon: 'error'
                        })
                    } else {
                        const resSwal = await swal.fire({
                            title: 'No hay cambios',
                            text: `No hay cambios que actualizar. ${oldOrden[0].muestras.length > 0 ? '¿Desea actualizar de todas formas?' : ''}`,
                            icon: 'info',
                            showCancelButton: true,
                            cancelButtonText: 'Cancelar',
                            confirmButtonText: 'Actualizar de todas formas',
                        })
                        if (resSwal.isConfirmed) {
                            await updateOrder(oldOrden[0], paciente, medico, diagnosticosArray, examenesArray);
                        }
                    }
                    
                } else {
                    console.log("hay cambios");
                    if (idPaciente == 0 || idMedico == 0) {
                        await swal.fire({
                            title: 'Error',
                            text: 'Debes seleccionar un paciente y un medico para continuar.',
                            icon: 'error'
                        })
                    } else {
                        await updateOrder(oldOrden[0], paciente, medico, diagnosticosArray, examenesArray);
                    }
                }
            });

            llenarTableDiagnosticosExamenes();

            if (oldOrden[0].muestras.length>0 && oldOrden[0].examenes.length>0 && oldOrden[0].nroOrden && (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras' || oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'pre-analitica')) {
                llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
                $('#nav-muestras-tab').removeClass('d-none');
                if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras') {
                    $('#nav-muestras-tab').click();
                } else if (oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'analítica') {
                    disableDiagnosisAndExams();
                    disableMuestras();
                }
                //show hovering message above tab: "Please, modify the order to add or delete samples"
                console.log("se lleno la tab muestras");
            }
            
        } else { //modo editar normal

            const estado = oldOrden[0].estado.toLowerCase();
            disablePatientsAndMedics();
            if (oldOrden[0].muestras.length > 0 && oldOrden[0].examenes.length > 0) {
                llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
            } else {
                disableMuestras();
            }
            $('#nav-muestras-tab').removeClass('d-none');
            $('#nav-muestras-tab').click();
            llenarTableDiagnosticosExamenes();

            if (estado != 'analitica' && estado != 'analítica') {
                console.log("estado: ", estado);
                initBtnEditar(oldOrden[0]);
                $('#editarOrden').on('click', () => {
                    updateOrden(oldOrden[0]);
                });
            } else {
                disableDiagnosisAndExams();
                disableMuestras();
                $('#editarOrden').addClass('d-none');
            }
            //OLD CODE V
            /*if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras') { //solo editable para add/delete muestras
                console.log("esperando toma de muestras");
                disablePatientsAndMedics();
                llenarTableDiagnosticosExamenes();
                $('#nav-muestras-tab').removeClass('d-none');
                $('#nav-muestras-tab').click();
                disableDiagnosisAndExams();
                console.log("muestras:", oldOrden[0].muestras);
                llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
                $('#editarOrden').addClass('d-none');

            } else if (oldOrden[0].estado.toLowerCase() == 'ingresada') { //diagnosticos y examenes agregables.
                console.log("ingresada");
                disablePatientsAndMedics();
                llenarTableDiagnosticosExamenes();
                initBtnEditar(oldOrden[0]);

            } else if (oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'analítica' || oldOrden[0].estado.toLowerCase() == 'pre-analitica') { //solo editable administradores
                console.log("analitica || pre-analitica");
                disablePatientsAndMedics();
                llenarTableDiagnosticosExamenes();
                llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
                initBtnEditar(oldOrden[0]);
                disableDiagnosisAndExams();
                if (oldOrden[0].estado.toLowerCase() != 'pre-analitica') {
                    disableMuestras();
                }
                
                $('#editarOrden').addClass('d-none');
                $('#nav-muestras-tab').removeClass('d-none');
                $('#nav-muestras-tab').click();
            }*/
        }


    } else if (oldOrden[0].nroOrden) {
        const res = swal.fire({
            title: 'Error al cargar la orden ' + oldOrden[0].nroOrden,
            text: 'No se encontro la orden. Por favor, vuelva a intentar mas tarde o contacte con el administrador.',
            type: 'error',
            confirmButtonText: 'Editar como administrador',
            cancelButtonText: 'Crear una nueva orden',
        })

        if (res.value) {
            if (res.isConfirmed) {
                if (oldOrden[0].nroOrden > 0 && checkNumeric(oldOrden[0].nroOrden)) {
                    try {
                        const fetchRes = await fetch('/ordenes/editar/admin/' + oldOrden[0].nroOrden, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        const data = await fetchRes.json();
                        if (fetchRes.ok && data.success) {
                            window.location.href = '/ordenes/editar/admin/' + oldOrden[0].nroOrden;
                        } else {
                            throw new Error(data.error || 'Error al redirigir a la edición como administrador');
                        }
                    } catch (err) {
                       swal.fire({ icon: 'error', title: 'Hubo un error al redirigir. ', text: 'Ocurrio un error. ' + err.message || '' });
                    }
                }
            } else if (res.isCancelled) {
                window.location.href = "/ordenes/create";
            }
        }

    }

});

async function updateOrder(oldOrden, paciente, medico, diagnosticosArray, examenesArray) {
    if (editMode){
        const resSwal = await swal.fire({
            title: '¿Desea realizar la siguiente actualización?',
            html: generateHtml(oldOrden, paciente, medico, diagnosticosArray, examenesArray),
            showCancelButton: true,
            cancelButtonText: 'No, cancelar',
            confirmButtonText: 'Sí, actualizar',
        })
        if (resSwal.isConfirmed) {
            try {
                const cargandoModal = swal.fire({
                    title: 'Editando orden...',
                    onOpen: () => {
                        swal.showLoading();
                    },
                    allowOutsideClick: false
                });
                const res = await updateOrderFun(oldOrden.nroOrden, paciente.idPaciente, medico.idMedico, diagnosticosArray.map(d => d.idDiagnostico), examenesArray.map(e => e.idExamenes));
                cargandoModal.close();
                if (res) {
                    const title = (res.res.anychanges == true ? 'Orden actualizada con éxito' : 'No se realizaron cambios');
                    const resSwal2 = await swal.fire({
                        icon: 'success',
                        title: title,
                        text: 'Redirigiendo a la lista de ordenes...',
                        showCancelButton: true,
                        confirmButtonText: 'Ir a la lista de ordenes',
                        cancelButtonText: 'Ver orden',
                        timer: 4000,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    })
    
                    if (resSwal2.isConfirmed) {
                        try {
                            await redirigirAdministracion();
                        } catch (err) {
                            console.log(err);
                            Toast.fire({ icon: 'error', title: 'Error al redirigir a la administración', text: err });
                        }
                    } else {
                        try {
                            await irAEditarOrden(oldOrden.nroOrden);
                        } catch (err) {
                            console.log(err);
                            Toast.fire({ icon: 'error', title: 'Error al redirigir a la orden', text: err });
                        }
                    }
                }
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Ocurrio un error al actualizar la orden',
                    text: err
                });
            }
        }
    }
    
}

function generateHtml(oldData, paciente, medico, diagnosticosArray, examenesArray) {
    return `<div class="row">
        <h3>Orden n&deg; ${oldData.nroOrden}</h3>
        <div class="col-6">
        <h4 class="text-primary">Orden anterior</h4>
        <p>Paciente: ${oldData.paciente.apellido}, ${oldData.paciente.nombre}</p>
        <p>Medico: ${oldData.medico.nombre} ${oldData.medico.apellido}</p>
        <p>Diagnostico(s): ${oldData.diagnosticos.length>0 ? oldData.diagnosticos.map(d => d.nombre).join(', '):'sin diagnosticos'}</p>
        <p>Examen(es): ${oldData.examenes.length>0 ? oldData.examenes.map(e => e.nombre).join(', '): 'sin examenes'}</p>
        </div>
        <div class="col-6">
        <h4 class="text-primary-emphasis">Orden nueva</h4>
        <p>Paciente: ${paciente.apellido}, ${paciente.nombre}</p>
        <p>Medico: ${medico.nombre} ${medico.apellido}</p>
        <p>Diagnostico(s): ${diagnosticosArray.length>0 ? diagnosticosArray.map(d => d.nombre).join(', '):'sin diagnosticos'}</p>
        <p>Examen(es): ${examenesArray.length>0 ? examenesArray.map(e => e.nombre).join(', '): 'sin examenes'}</p>
        </div>
        </div>`;
}

async function updateOrden(oldData){
    //const tablePaciente = $('#table_patients').DataTable().row({selected: true}).data()//.toArray().filter(x => x.idPaciente == oldData.paciente.idPaciente);
    //const tableMedicos = $('#table_medics').DataTable().row({selected: true}).data()//.toArray().filter(x => x.idMedico == oldData.medico.idMedico);
    const tablePaciente = $('#table_patients').DataTable().rows().data().toArray().filter(x => x.idPaciente == oldData.paciente.idPaciente);
    const tableMedicos = $('#table_medics').DataTable().rows().data().toArray().filter(x => x.idMedico == oldData.medico.idMedico);
    const tableDiagnosticos = $('#table_diagnosticos_agregados').DataTable().rows().data().toArray();
    const tableExamenes = $('#table_agregados').DataTable().rows().data().toArray();
    console.log("tablePaciente: ", tablePaciente);
    console.log("tableMedicos: ", tableMedicos);
    console.log("tableDiagnosticos: ", tableDiagnosticos);
    console.log("tableExamenes: ", tableExamenes);
    if (tablePaciente && tableMedicos) {
        
        if (oldData.estado.toLowerCase() != 'analitica' && oldData.estado.toLowerCase() != 'analítica') { 
            try {
                const cargandoModal = swal.fire({
                    title: 'Editando orden...',
                    onOpen: () => {
                        swal.showLoading();
                    },
                    allowOutsideClick: false
                });
                
                const res = await fetch(`/ordenes/editar/${oldData.nroOrden}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ordenNueva: {
                            diagnosticosIds: tableDiagnosticos.map(x => x.idDiagnostico) || [],
                            examenesIds: tableExamenes.map(x => x.idExamenes) || []
                        }
                    })
                })
                const jsonRes = await res.json();
                cargandoModal.close();
                if (res.ok) {
                    const resModal = await swal.fire({
                        icon: 'success',
                        title: 'Orden editada',
                        text: 'La orden se ha editado con exito. Redirigiendo...',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Ir a la lista de ordenes',
                        showConfirmButton: true,
                        showCancelButton: true,
                        cancelButtonText: 'Ver orden',                     
                    });
                    if (resModal.isConfirmed) {
                        await redirigirAdministracion();
                    } else{
                        await irAEditarOrden(oldData.nroOrden);
                        $('#editarOrden').prop('disabled', true);
                        $('#editarOrden').hide();
                    }
                } else {
                    throw new Error(jsonRes.error);
                }
            } catch (error) {
                console.log(error);
                swal.fire({ icon: 'error', title: 'La orden no se edito. ', text: 'Ocurrio un error. '+error.message || '' });
                $('#editarOrden').prop('disabled', true);
                $('#editarOrden').hide();
            }

        }

    }

}