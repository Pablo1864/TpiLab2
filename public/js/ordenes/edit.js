import { irAEditarOrden, Toast, checkNumeric, llenarTableConData, llenarTableMuestras, agregarRow, initBtnEditar, disablePatientsAndMedics, disableDiagnosisAndExams, disableMuestras  } from './common.js'
//const rol = 2;

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
        swal.fire({
            title: '¡Cuidado!',
            text: 'La orden se encuentra en estado ' + oldOrden[0].estado + '. La edición de esta orden es solo para administradores.',
            icon: 'warning',
        })
    } else if (oldOrden[0].nroOrden>0){
        console.log("MODO EDITAR DE USUARIOS, MODO: NO ADMIN", editMode);
        try {
            if (!oldOrden || !oldOrden[0] || !oldOrden[0].nroOrden || !oldOrden[0].estado) { //yet to test
                throw Error("No se encontro la orden!");
            } else if (!oldOrden[0].paciente.idPaciente && !oldOrden[0].medico.idMedico) {
                throw Error("No se encontro el paciente o el medico!");
            } else if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras' && (!oldOrden[0].muestras || oldOrden[0].muestras.length <= 0)) {
                throw Error("No se encontraron muestras!");
            } else if (oldOrden[0].estado.toLowerCase() == 'analitica' && (!oldOrden[0].muestras || oldOrden[0].muestras.length <= 0) && (!oldOrden[0].diagnosticos || oldOrden[0].diagnosticos.length <= 0) && (!oldOrden[0].examenes || oldOrden[0].examenes.length <= 0)) {
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
            } else {
                await irAEditarOrden(oldOrden[0].nroOrden);
                disablePatientsAndMedics();
                disableDiagnosisAndExams();
                disableMuestras();
                return;
            }
            
        }
    } else {
        swal.fire({
            title: 'Error fatal',
            text: 'No se encontro la orden. Por favor, contactese con un administrador.',
            icon: 'error',
        })
        return;
        /*await swal.fire({
            title: 'Hubo un error al redirigir a la edición como administrador.',
            text: 'Redirigiendo a la edición de la orden ' + oldOrden[0].nroOrden + ' nuevamente.',
            icon: 'error',
            timer: 4000,
            timerProgressBar: true,
        })
        await irAEditarOrden(oldOrden[0].nroOrden);
        disableDiagnosisAndExams();
        $('#table-muestras').dataTable().destroy();
        disableMuestras();
        disablePatientsAndMedics();
        return;*/
    }
    
    if (oldOrden[0].muestras && oldOrden[0].muestras.length > 0 && oldOrden[0].muestras.every( x => x.estado != 0)) {
        $('#i5').removeClass().addClass('bi bi-check-circle ms-2 text-success');
    } else if (oldOrden[0].muestras && oldOrden[0].muestras.length > 0) {
        $('#i5').removeClass().addClass('bi bi-x-circle ms-2 text-danger');
    }

    if (oldOrden && oldOrden[0] && oldOrden[0].paciente && oldOrden[0].medico) {
        
        $('#editarOrden').on('click', () => {
            updateOrden(oldOrden[0]);
        });
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
        disablePatientsAndMedics();
        //&& usuario.rol.toLowerCase() == 'employee'?

        if (editMode){
            
        } else if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras') { //solo editable para add/delete muestras
            console.log("esperando toma de muestras");
            llenarTableDiagnosticosExamenes();
            $('#nav-muestras-tab').removeClass('d-none');
            $('#nav-muestras-tab').click();
            disableDiagnosisAndExams();
            
            console.log("muestras:", oldOrden[0].muestras);

                llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
                $('#editarOrden').addClass('d-none');
            
            
            
        } else if (oldOrden[0].estado.toLowerCase() == 'ingresada') {
            console.log("ingresada");
            llenarTableDiagnosticosExamenes();
            initBtnEditar(oldOrden[0]);

        } else if (oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'analítica') { //solo editable administradores
            console.log("analitica");
            llenarTableDiagnosticosExamenes();
            llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
            initBtnEditar(oldOrden[0]);
            disableDiagnosisAndExams();
            disableMuestras();
            $('#editarOrden').addClass('d-none');
            $('#nav-muestras-tab').removeClass('d-none');
            $('#nav-muestras-tab').click();            
        }


    } else if (oldOrden[0].nroOrden) {
        const res = swal.fire({
            title: 'Error al cargar la orden ' + oldOrden[0].nroOrden,
            text: 'No se encontro la orden. Por favor, vuelva a intentar mas tarde o contacte con el administrador.',
            type: 'error',
            confirmButtonText: 'Editar de todos modos',
            cancelButtonText: 'Crear una nueva orden',
        })

        if (res.value) {
            if (res.isConfirmed) {
                console.log("Editando de todos modos, checkeando permisos");
                window.location.href = "/ordenes/edit/" + oldOrden[0].nroOrden;
            } else if (res.isCancelled) {
                
            }
        }

    }

});

async function updateOrden(oldData){
    const tablePaciente = $('#table_patients').DataTable().row({selected: true}).data()//.toArray().filter(x => x.idPaciente == oldData.paciente.idPaciente);
    const tableMedicos = $('#table_medics').DataTable().row({selected: true}).data()//.toArray().filter(x => x.idMedico == oldData.medico.idMedico);
    const tableDiagnosticos = $('#table_diagnosticos_agregados').DataTable().rows().data().toArray();
    const tableExamenes = $('#table_agregados').DataTable().rows().data().toArray();
    console.log("tablePaciente: ", tablePaciente);
    console.log("tableMedicos: ", tableMedicos);
    console.log("tableDiagnosticos: ", tableDiagnosticos);
    console.log("tableExamenes: ", tableExamenes);
    if (tablePaciente && tableMedicos) {
        let estado = 'Ingresada';
        if (tableDiagnosticos.length > 0 && tableExamenes.length > 0) {
            estado = 'Esperando toma de muestras';
        }
        
        if (oldData.estado.toLowerCase() == 'ingresada') { //solo editable para examenes y diagnosticos
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
                        ordenAnterior: {
                            nroOrden: oldData.nroOrden,
                            estado: oldData.estado,
                            idPaciente: oldData.paciente.idPaciente,
                            idMedico: oldData.medico.idMedico,
                            idDiagnosticosArr: oldData.diagnosticos.map(x => x.idDiagnostico),
                            idExamenesArr: oldData.examenes.map(x => x.idExamenes)
                        },
                        ordenNueva: {
                            estado: estado,
                            idPaciente: tablePaciente.idPaciente,
                            idMedico: tableMedicos.idMedico,
                            idDiagnosticosArr: tableDiagnosticos.map(x => x.idDiagnostico),
                            idExamenesArr: tableExamenes.map(x => x.idExamenes)
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
                        denyButtonText: 'Quedarse',
                        confirmButtonText: 'Ir a ordenes',
                        showDenyButton: true,
                        showConfirmButton: true,
                        showCancelButton: estado.toLowerCase() == 'ingresada' || estado.toLowerCase() == 'esperando toma de muestras',
                        cancelButtonText: 'Editar orden',
                        onClose: async () => {
                            await redirigirAdministracion();
                        }
                    });
                    if (resModal.isConfirmed) {
                        await redirigirAdministracion();
                    } else if (resModal.isCancelled){
                        if (estado.toLowerCase() == 'ingresada' || estado.toLowerCase() == 'esperando toma de muestras') {
                            await irAEditarOrden(oldData.nroOrden);
                        }
                    } else {
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

    async function redirigirAdministracion() {
        try {
            const res = await fetch(`/ordenes/administracion`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            const data = res.json();
            if (res.ok && data.success) {
                window.location.href = '/ordenes/administracion';
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            swal.fire({ icon: 'error', title: 'Hubo un error al redirigir. ', text: 'Ocurrio un error. '+error.message || '' });
        }
    }
}