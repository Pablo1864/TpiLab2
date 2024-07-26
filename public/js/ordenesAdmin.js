import { manejarFetch2, agruparMuestrasArr, Toast, fetchModificarMuestras,  config, checkAlpha, checkNumeric,formatDateTime, llenarTableConData, printMuestra } from './ordenes/common.js';

$(document).ready(function () {

    const tableOrdenes = $('#table_ordenes').DataTable({
        language: config('orden', 'ordenes'),
        responsive: true,
        order : [],
        rowId: 'nroOrden',
        columns: [
            { title: 'Orden', data: 'nroOrden', responsivePriority: 1 },
            { title: 'Estado', data: 'estado', responsivePriority: 3 },
            {
                title: 'Paciente', data: null,
                render: function (data) {
                    return data.apellidoPaciente + ', ' + data.nombrePaciente;
                },
                responsivePriority: 1,
            },
            { title: 'Dni pac.', data: 'dni', responsivePriority: 2 },
            {
                title: 'Medico',
                data: null, render: function (data) {
                    return data.apellidoMedico + ', ' + data.nombreMedico;
                },
                responsivePriority: 5
            },
            {
                title: 'fecha de creacion', data: null, responsivePriority: 8, render: function (data) {
                    return formatDateTime(data.fechaCreacion);
                }
            },
            /*{ title: 'fecha de resultados aprox:', data: null, responsivePriority: 8, render: function (data) {
                    return formatDateTime(data.fechaAprox);
                }
            }, */
            {
                title: 'Acciones', data: null, responsivePriority: 1, orderable: false, searchable: false, render: function (data) {
                    let estado = data.estado.toLowerCase();
                    let muestrasEditable = estado == 'esperando toma de muestras';
                    return `<div class="d-flex flex-row justify-content-evenly">
                            <button type="button" class="btn btn-sm btn-primary edit-button" data-id="${data.nroOrden}"><i class="bi bi-pencil-fill" aria-hidden="true"></i><span class="d-none d-lg-inline ms-1">Editar</span></button>
                            <button type="button" class="btn btn-sm btn-secondary details-button" data-id="${data.nroOrden}"><i class="bi bi-eye-fill" aria-hidden="true"></i><span class="d-none d-lg-inline ms-1">Ver más</span></button>
                            <button type="button" class="btn btn-sm btn-danger delete-button" data-id="${data.nroOrden}"><i class="bi bi-trash" aria-hidden="true"></i><span class="d-none d-lg-inline ms-1">Eliminar</span></button><div>`;

                }
            },
        ]
    });

    async function deleteOrder(id) {
        console.log("deleteOrder: ", id);
        //const container = $(`#orden-${id}`);
        if (checkNumeric(id) && id>0) {
            const { value: razon } = await Swal.fire({
                icon: 'warning',
                title: '¿Esta seguro que desea cancelar la orden nro ' + id + '?',
                input: 'textarea',
                text: 'Ingrese la razon por que desea cancelar la orden',
                inputPlaceholder: 'razon por la que se desea cancelar la orden',
                inputAttributes: {
                    maxlength: "300", autocapitalize: "off"
                },
                showCancelButton: true,
                confirmButtonText: 'Si, cancelar!',
                cancelButtonText: 'No!',
                focusConfirm: false,
                inputValidator: (value) => {
                    if (!(value.trim().length > 0 && value)) {
                        return 'Debe ingresar una razon por la que desea cancelar la orden!'
                    }
                }
            });
            
            if (razon) {
                let loading = swal.fire({
                    title: 'Cancelando orden...',
                    onOpen: () => {
                        swal.showLoading();
                    },
                    allowOutsideClick: false
                })
                try {
                    const res = await fetch(`/ordenes/desactivar/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ razon: razon }),
                    });
                    const data = await res.json();
                    console.log('deleteOrder: ', data);
                    if (res.ok && data.affectedRows) {
                        loading.close();
                        Swal.fire({
                            icon: 'success',
                            title: `Orden n.&deg ${id} cancelada con exito.`,
                        });
                        return true;
                        //container.remove();
                    } else {
                        throw new Error(data.error || 'Error al cancelar la orden');
                    }
                } catch (err) {
                    console.log(err);
                    loading.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err
                    });
                    return false;
                }    
            }
        }
    }

    async function editOrder(id) {
        if (checkNumeric(id) && id>0) {
            try {
                const res = await fetch(`/ordenes/editar/${id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                const data = await res.json();
                console.log("editOrder: ", data);
                if (res.ok && data.success) {
                    window.location.href = `/ordenes/editar/${id}`;
                } else {
                    throw new Error(data.error);
                }
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err
                });
            }
        }
    }

    function getMuestrasHtml(muestras, estado, nroOrden) {
        let html = '';
        let muestrasHtml = '';
        if (muestras && muestras.length > 0) {
            html += `<div id='container-label' class='.row-12'></div><table class="table table-sm table-striped table-responsive nowrap caption-top" id="table_muestras"><caption>Lista de muestras</caption>
            <tr>
            <th>Tipo de muestra</th>
            <th>Muestra</th>
            <th>Examenes</th>
            <th>Presentada</th>
            <th>Acciones</th>
            </tr>
            {{muestras}}
            </table>`;

            const arr = agruparMuestrasArr(muestras);
            muestrasHtml = arr.map(muestra => {
                let buttons = '';
                if (muestra.presentada && (estado.toLowerCase() == 'analitica' || estado.toLowerCase() == 'analítica')) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipoAnalisis}'>Imprimir</button>`;
                } else if (muestra.presentada) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipoAnalisis}'>Imprimir</button><button type="button" class="btn btn-sm btn-danger delete-muestra-button" data-id="${muestra.idMuestras}")">Eliminar</button>`; 
                } else {
                    buttons = `<button type="button" class="btn btn-sm btn-primary add-muestra-button" data-id="${muestra.idMuestras}")">agregar</button>`;
                }
                return `<tr>
                <td>${muestra.tipoAnalisis}</td>
                <td>${muestra.idMuestras.join(', ')}</td>
                <td>${muestra.idExamenes.join(', ')}</td>
                <td>${muestra.presentada ? 'Si' : 'No'}</td>
                <td>
                ${buttons}
                </td>
                </tr>
                `;
            }).join('');
            console.log("muestras: ",muestras, estado, nroOrden);
        }
        return html.replace("{{muestras}}", muestrasHtml);
    }

    function generateTable(data) {
        let html = '';
        let htmlDiagnosticos = '';
        let htmlExamenes = '';
        let htmlMuestras = '';
        html = `<div class='row p-0 m-0'> 
                    <div class='col-12'>
                        <p>Estado: {{estado}}</p>
                        <p>Fecha de creación: {{date}}</p>
                        <p>Última fecha de modif.: {{dateModif}}</p>
                    </div>    
                    <div class='col-6'>
                        <p>Pac.: {{paciente}}</p>
                        <p>Cód. pac.: <a>{{idPaciente}}</a></p>
                        <p>DNI: {{dni}}.</p>
                    </div>
                    <div class='col-6'>     
                        <p>Medico: {{medico}}</p>
                        <p>Cod. medico: <a>{{idMedico}}</a></p>
                        <p>Matricula: {{matricula}}</p>
                    </div>
                    
                    <div class='col-12'>
                        {{diagnosticosTable}}
                    </div>
                    <div class='col-12'>
                        {{examenesTable}}
                    </div>
                    <div class='col-12'>
                        {{muestrasTable}}
                    </div>
                </div>`;
        if (data.diagnosticos && data.diagnosticos.length > 0) {
            htmlDiagnosticos = '<table class="table table-striped"><tr><th>Diagnostico</th><th>Otros terminos</th></tr>';

            data.diagnosticos.forEach(diagnostico => {
                htmlDiagnosticos += `<tr><td>${diagnostico.nombre}</td><td>${diagnostico.otrosTerminos}</>`;
            });
            htmlDiagnosticos += '</table>';

            html = html.replace('{{diagnosticosTable}}', htmlDiagnosticos);
        }
        if (data.examenes && data.examenes.length > 0) {
            htmlExamenes = '<table class="table table-striped"><tr><th>Examen</th><th>tipo de analisis</th></tr>';
            data.examenes.forEach(examen => {
                htmlExamenes += `<tr><td>${examen.nombre}</td><td>${examen.tipoAnalisis}</td>`;
            });
            htmlExamenes += '</table>';
        }
        if (data.muestras && data.muestras.length > 0 && data.examenes && data.examenes.length > 0) {
            htmlMuestras = getMuestrasHtml(data.muestras, data.estado, data.nroOrden);
        }
        return html
            .replace('{{examenesTable}}', htmlExamenes)
            .replace('{{muestrasTable}}', htmlMuestras)
            .replace('{{diagnosticosTable}}', htmlDiagnosticos)
            .replace('{{paciente}}', data.paciente.apellido + ', ' + data.paciente.nombre)
            .replace('{{idPaciente}}', data.paciente.idPaciente)
            .replace('{{dni}}', data.paciente.dni)
            .replace('{{date}}', formatDateTime(data.fechaCreacion))
            .replace('{{dateModif}}', formatDateTime(data.fechaModif))
            .replace('{{medico}}', data.medico.apellido + ', ' + data.medico.nombre)
            .replace('{{idMedico}}', data.medico.idMedico)
            .replace('{{matricula}}', data.medico.matricula)
            .replace('{{estado}}', data.estado);
    }

    async function detailsOrder(id) {
        if (checkNumeric(id) && id>0) {
            let loading = swal.fire({
                title: 'Cargando detalles...',
                onOpen: () => {
                    swal.showLoading();
                },
                allowOutsideClick: false
            })
            try {
                const res = await fetch(`/ordenes/detalle/${id}`);
                const data = await res.json();
                if (res.ok && data) {
                    if (data.length > 0) {
                        swal.fire({
                            title: 'Detalles de la orden n &deg;'+id,
                            html: generateTable(data[0]),
                            width: '80%',
                            padding: '2em',
                            onOpen: () => {
                                if (data[0].muestras && data[0].muestras.length > 0) {
                                    $('#table_muestras').on('click', 'button', async function () {
                                    console.log("enter");
                                    if ($(this).hasClass('add-muestra-button')) {
                                        console.log("add muestra");
                                        const idMues = $(this).data('id');
                                        let arrayidMuestras;
                                        if (Array.isArray(idMues)){
                                            arrayidMuestras = idMues;
                                        } else {
                                            arrayidMuestras = [idMues];
                                        }
                                        const dataMuestra = await fetchModificarMuestras(id, arrayidMuestras, true);
                                        if (dataMuestra) {
                                            swal.fire({
                                                title: 'Muestra agregada',
                                                icon: 'success',
                                                allowOutsideClick: false
                                            })
                                        }
                                    } else if ($(this).hasClass('imprimir-muestra-button')) {
                                        console.log("imprimir muestra");
                                        const tipoMuestra = $(this).data('tipo');
                                        const labels = await printMuestra(tipoMuestra, id);
                                        $("#container-label").html(labels);
                                        window.print();
                                    } else if ($(this).hasClass('delete-muestra-button')) {
                                        console.log("delete muestra");
                                        const idMues = $(this).data('id');
                                        let arrayidMuestras;
                                        if (Array.isArray(idMues)){
                                            arrayidMuestras = idMues;
                                        } else {
                                            arrayidMuestras = [idMues];
                                        }
                                        const dataMuestra = await fetchModificarMuestras(id, arrayidMuestras, false);
                                        if (dataMuestra) {
                                            swal.fire({
                                                title: 'Muestra eliminada',
                                                icon: 'success',
                                                allowOutsideClick: false
                                            })
                                            if (data[0].muestras && data[0].muestras.length > 0) {
                                                //handle changing order status on table
                                            }
                                            
                                        }
                                    }
                                });}
                            }
                        })
                        
                    }
                } else {
                    throw new Error(data.error);
                }
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Sucedio un error inesperado'
                });
            } finally {
                loading.close();
            }
        }
    }

    $('#table_ordenes tbody').on('click', 'button', async function () {
        if ($(this).hasClass('delete-button')) {
            const id = $(this).data('id');
            if (await deleteOrder(id)){
                $('#table_ordenes').DataTable().row($(this).parents('tr')).remove().draw();
            }
        } else if ($(this).hasClass('edit-button')) {
            const id = $(this).data('id');
            await editOrder(id);
        } else if ($(this).hasClass('details-button')) {
            const id = $(this).data('id');
            await detailsOrder(id);
        }
    });

    const searchingConfig = {
        ordenes: {
            url: '/ordenes/administracion/search',
            params: {
                apellidoPaciente: 'apellidoPaciente',
                apellidoMedico: 'apellidoMedico',
                nroOrden: 'nroOrden',

                filterEstado: {
                    todas: 'todas',
                    ingresada: 'ingresada',
                    esperando: 'esperando toma de muestras',
                    analitica : 'analitica',
                    canceladas: 'canceladas',
                },
                orden:{
                    asc: 'asc', //ascendente(i.e. fecha de creacion más vieja primero)
                    des: 'des', //descendente(i.e. fecha de creacion más reciente primero)
                }
            }
        }
    } 
    const search = async (filter, filterEstado, input) => {
        const confg = searchingConfig.ordenes;
        const url = `/ordenes/administracion/search?estado=${confg.params.filterEstado[filterEstado]}&${confg.params[filter]}=${encodeURIComponent(input.val())}`
        console.log(url);
        const data = await manejarFetch2(url);
        if (data){
            llenarTableConData($('#table_ordenes').DataTable(), data);
        }
    };

    $('#ordenBtn').on('click', async function (event) {
        search($('#ordenesFilter').val(),  $('#ordenesFilterEstado').val(), $('#ordenBuscador'));
    });

    if (tableOrdenes && ordenes) {
        try { 
            llenarTableConData($('#table_ordenes').DataTable(), ordenes) 
        } catch (err) {
            swal.fire({
                icon: 'error',
                title: 'Sucedio un error al cargar las ordenes',
                text: err.message || err
            })
        } 
    }

});
