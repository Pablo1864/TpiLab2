import { Toast, disableTableSelection, llenarTableMuestras, agregarRow, initBtnEditar } from './common.js'

$(document).ready(function () {

    $('#form_ordenes').submit(function (event) {
        event.preventDefault();
        //updateOrden(oldData);
    })
    
    function selectRowById(table, id) {
        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
            let tableData = table.row(rowIdx).data();

            if (tableData.idPaciente == id || tableData.idMedico == id) {
                table.row(rowIdx).select();
                $(this.node()).addClass('highlight-row');
            }
        });
    }
    function llenarTableConData(table, data) {
        table.clear();
        table.rows.add(data).draw();
        table.columns.adjust().draw();
        table.responsive.recalc().draw();
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
                } else {
                    $('#i3').removeClass().addClass('bi bi-x-circle ms-2 text-danger');
                }
                if (oldOrden[0].examenes && oldOrden[0].examenes.length > 0) {
                    oldOrden[0].examenes.forEach(examen => {
                        if (agregarRow(examen, $('#table_agregados').DataTable(), 'idExamenes')) {
                            $('#i4').removeClass().addClass('bi bi-check-circle ms-2 text-success');
                        };
                    })
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
        disableTableSelection($('#table_patients').DataTable());
        disableTableSelection($('#table_medics').DataTable());
        $('#divTablaPaciente').addClass('disable-table');
        $('#divTablaMedicos').addClass('disable-table');
        $('#buscarMedico').prop('disabled', true); //btn
            $('#medicoId').prop('disabled', true); //input
            $('#buscarPaciente').prop('disabled', true); //btn
            $('#pacienteID').prop('disabled', true); //input
        //&& usuario.rol.toLowerCase() == 'employee'?
        if (oldOrden[0].estado.toLowerCase() == 'esperando toma de muestras') { //solo editable para add/delete muestras
            console.log("esperando toma de muestras");
            //disableTableSelection($('#table_patients').DataTable());
            //disableTableSelection($('#table_medics').DataTable());
            llenarTableDiagnosticosExamenes();
            $('#nav-muestras-tab').removeClass('d-none');
            $('#nav-muestras-tab').click();
            //$('#buscarMedico').prop('disabled', true); //btn
            //$('#medicoId').prop('disabled', true); //input
            //$('#buscarPaciente').prop('disabled', true); //btn
            //$('#pacienteID').prop('disabled', true); //input
            $('#diagnosticoSearch').prop('disabled', true); //input
            $('#buscarDiagnosticos').prop('disabled', true); //btn
            $('#idExamen').prop('disabled', true); //input
            $('#buscarExamenes').prop('disabled', true); //btn
            $('#table_diagnosticos tbody').off('click');
            $('#table_diagnosticos_agregados tbody').off('click');

            $('#table_examenes tbody').off('click');
            $('#table_agregados tbody').off('click');
            //$('#divTablaPaciente').addClass('disable-table');
            //$('#divTablaMedicos').addClass('disable-table');
            $('#divTablasDiagnosticos').addClass('disable-table');
            $('#divTablasExamenes').addClass('disable-table');
            llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
            $('#editarOrden').addClass('d-none');
            //DONE
        } else if (oldOrden[0].estado.toLowerCase() == 'ingresada') {
            console.log("ingresada");
            
            llenarTableDiagnosticosExamenes();
            initBtnEditar(oldOrden[0]);

        } else if (oldOrden[0].estado.toLowerCase() == 'analitica' || oldOrden[0].estado.toLowerCase() == 'analítica') { //solo editable administradores
            console.log("analitica");

            llenarTableMuestras(oldOrden[0].muestras, oldOrden[0].examenes, oldOrden[0].nroOrden);
            initBtnEditar(oldOrden[0]);

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
            } else if (res.isCancelled) {
                console.log("Creando nueva orden, checkeando permisos");

            }
        }

    }

});

async function updateOrden(oldData){
    const tablePaciente = $('#table_patients').DataTable().rows({selected: true}).data().toArray().filter(x => x.idPaciente == oldData.paciente.idPaciente);
    const tableMedicos = $('#table_medics').DataTable().rows({selected: true}).data().toArray().filter(x => x.idMedico == oldData.medico.idMedico);
    const tableDiagnosticos = $('#table_diagnosticos_agregados').DataTable().rows().data().toArray();
    const tableExamenes = $('#table_agregados').DataTable().rows().data().toArray();
    console.log("tablePaciente: ", tablePaciente);
    console.log("tableMedicos: ", tableMedicos);
    console.log("tableDiagnosticos: ", tableDiagnosticos);
    console.log("tableExamenes: ", tableExamenes);
    if (tablePaciente.length > 0 && tableMedicos.length > 0) {
        let estado = 'ingresada';
        if (tableDiagnosticos.length > 0 && tableExamenes.length > 0) {
            estado = 'Esperando toma de muestras';
        }
        
        if (oldData.estado.toLowerCase() == 'ingresada') { //solo editable para examenes y diagnosticos
            try {
                const res = fetch(`/ordenes/editar/${oldData.nroOrden}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: estado,
                        idPaciente: tablePaciente[0].idPaciente,
                        idMedico: tableMedicos[0].idMedico,
                        idDiagnosticosArr: tableDiagnosticos.map(x => x.idDiagnostico),
                        idExamenesArr: tableExamenes.map(x => x.idExamenes)
                    })
                })
                if (res.ok) {
                    const jsonRes = await res.json();
                    console.log("Response: ", jsonRes);
                } else {
                    console.log("No se pudo editar la orden");
                    console.log(res);
                }
            } catch (error) {
                console.log(error);
            }

        }

    }

}