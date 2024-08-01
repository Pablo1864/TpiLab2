import { manejarFetch2, agruparMuestrasArr, Toast, fetchModificarMuestras,  config, checkAlpha, checkNumeric,formatDateTime, llenarTableConData, printMuestra } from './ordenes/common.js';

$(document).ready(function () {

    const tableOrdenes = $('#table_ordenes').DataTable({
        language: config('orden', 'ordenes'),
        responsive: true,
        order : [],
        rowId: 'nroOrden',
        columns: [
            { title: 'Orden', data: 'nroOrden', responsivePriority: 1 },
            { title: 'Estado', data:null, responsivePriority: 3, render: function (data, type, row, meta) {
                if (data.estado.toLowerCase() == 'analitica' || data.estado.toLowerCase() == 'analítica') {
                    return `<span class="text-success-emphasis">${data.estado}</span>`;
                } else if (data.estado.toLowerCase() == 'pre-analitica' || data.estado.toLowerCase() == 'pre-analítica') {
                    return `<span class="bg-warning-subtle rounded text-warning-emphasis"><strong>${data.estado}</strong></span>`;
                } else {
                    return `<span class="text-danger-emphasis">${data.estado}</span>`;
                }
            }},
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
                    return `<div class="d-flex flex-row justify-content-evenly">
                            <button type="button" class="btn btn-sm btn-primary edit-button" data-id="${data.nroOrden}"><i class="bi bi-pencil-fill" innert></i><span class="d-none d-lg-inline ms-1">Editar</span></button>
                            <button type="button" class="btn btn-sm btn-secondary details-button" data-id="${data.nroOrden}"><i class="bi bi-eye-fill" innert></i><span class="d-none d-lg-inline ms-1">Ver más</span></button>
                            <button type="button" class="btn btn-sm btn-danger delete-button" data-id="${data.nroOrden}"><i class="bi bi-trash" innert></i><span class="d-none d-lg-inline ms-1">Eliminar</span></button><div>`;

                }
            },
        ]
    });

    
    async function actualizarRow(nroOrden){
        try {
            let dataRow = '';
            const table = $('#table_ordenes').DataTable();
            let row = table.row(function (idx, data, node) {
                return data.nroOrden == nroOrden
            });
            dataRow = row.data();
            console.log(dataRow);
            if (!dataRow) {
                return;
            }
            const newData = await fetch(`/ordenes/detalle/${nroOrden}`);
            const data = await newData.json();
            console.log(data);
            if (newData.ok) {
                if (data.length > 0){
                    row.data({
                        estado: data[0].estado,
                        nroOrden: data[0].nroOrden,
                        apellidoPaciente: data[0].paciente.apellido,
                        nombrePaciente: data[0].paciente.nombre,
                        dni: data[0].paciente.dni,
                        apellidoMedico: data[0].medico.apellido,
                        nombreMedico: data[0].medico.nombre,
                        fechaCreacion: data[0].fechaCreacion,
                    }).draw();
                } else {
                    throw new Error('No se encontro la orden');
                }
            } else {
                console.log(data.error);
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: 'Error al actualizar la orden en la vista con sus detalles!',
                text: error.message || 'Error inesperado, por favor intentelo de nuevo'
            });
        }
    }

    
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
            html += `<div id='container-label' class='.row-12 text-start'></div><table class="table table-sm table-striped table-responsive nowrap caption-top" id="table_muestras"><caption>Lista de muestras</caption>
            <tr>
            <th>Tipo de muestra</th>
            <th>Muestra</th>
            <th>Examenes</th>
            <th>Presentada</th>
            <th>Acciones</th>
            </tr>
            {{muestras}}
            </table>`;

            //let muestrasHtml = '';
            const arr = agruparMuestrasArr(muestras);
            console.log("arr: ", arr);
            arr.forEach(muestra => {
                let buttons = '';
                if (muestra.presentada && (estado.toLowerCase() == 'analitica' || estado.toLowerCase() == 'analítica')) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipo}'>Imprimir</button>`;
                } else if (muestra.presentada) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipo}'>Imprimir</button><button type="button" class="btn btn-sm btn-danger delete-muestra-button" data-id="${muestra.idMuestra}">Eliminar</button>`; 
                } else {
                    buttons = `<button type="button" class="btn btn-sm btn-primary add-muestra-button" data-id="${muestra.idMuestra}">agregar</button>`;
                }
                muestrasHtml += `<tr>
                <td>${muestra.tipo}</td>
                <td>${muestra.idMuestra}</td>
                <td>${muestra.idExamenes}</td>
                <td>${muestra.presentada ? 'Si' : 'No'}</td>
                <td>
                ${buttons}
                </td>
                </tr>
                `
            });
            /*muestrasHtml = arr.map(muestra => {
                let buttons = '';
                if (muestra.presentada && (estado.toLowerCase() == 'analitica' || estado.toLowerCase() == 'analítica')) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipoAnalisis}'>Imprimir</button>`;
                } else if (muestra.presentada) {
                    buttons = `<button type="button" class='btn btn-sm btn-primary imprimir-muestra-button' data-tipo='${muestra.tipoAnalisis}'>Imprimir</button><button type="button" class="btn btn-sm btn-danger delete-muestra-button" data-id="${muestra.idMuestras}">Eliminar</button>`; 
                } else {
                    buttons = `<button type="button" class="btn btn-sm btn-primary add-muestra-button" data-id="${muestra.idMuestras}">agregar</button>`;
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
            }).join('');*/
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
                        let preAnalitica = data[0].estado.toLowerCase() == 'pre-analitica' || data[0].estado.toLowerCase() == 'pre-analítica';

                        const resModal = await swal.fire({
                            title: 'Detalles de la orden n &deg;'+id,
                            html: generateTable(data[0]),
                            width: '80%',
                            padding: '2em',
                            showDenyButton: preAnalitica, //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! terminar esto
                            denyButtonText:'Cambiar orden a analítica!',
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
                                            if (typeof idMues === 'string' && idMues.includes(',')) {
                                                arrayidMuestras = idMues.split(',');
                                            } else {
                                                arrayidMuestras = [idMues];
                                            }
                                        }
                                        try {
                                            const dataMuestra = await fetchModificarMuestras(id, arrayidMuestras, true);
                                            if (dataMuestra) {
                                                swal.fire({
                                                    title: 'Muestra agregada',
                                                    icon: 'success',
                                                    allowOutsideClick: false
                                                })
                                                console.log(dataMuestra);
                                                await actualizarRow(id);
                                            }
                                        } catch (error) {
                                            console.log(error);
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
                                        console.log(typeof idMues);
                                        if (Array.isArray(idMues)){
                                            console.log("Array");
                                            arrayidMuestras = idMues;
                                        } else {
                                            if (typeof idMues === 'string' && idMues.includes(',')) {
                                                arrayidMuestras = idMues.split(',');
                                            } else {
                                                arrayidMuestras = [idMues];
                                            }
                                        }
                                        try {
                                            console.log(arrayidMuestras); //unexpected: ['236,237'] with an array of a string instead of an array of numbers
                                            const dataMuestra = await fetchModificarMuestras(id, arrayidMuestras, false);
                                            if (dataMuestra) {
                                                swal.fire({
                                                    title: 'Muestra eliminada',
                                                    icon: 'success',
                                                    allowOutsideClick: false
                                                })
                                                console.log(dataMuestra);
                                                await actualizarRow(id);
                                            }
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }
                                });}
                            }
                        })
                        if (resModal.isConfirmed) {
                            console.log("Confirmed");
                        } else if (resModal.isDenied) {
                            console.log("Denied");
                            if (preAnalitica) {
                                const resChange = await swal.fire({
                                    title: '¿Desea cambiar el estado de la orden?',
                                    text: 'Se cambiara el estado de la orden a "analítica", pasando a ser procesada y analizada por un bioquimico. Esta operación no se puede deshacer',
                                    showCancelButton: true,
                                    confirmButtonText: 'Si, cambiar',
                                    cancelButtonText: 'No, mantener',
                                })
                                if (resChange.isConfirmed) {
                                    try {
                                        const cambiar = await fetch(`/ordenes/cambiarEstado/${id}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        })
                                        const cambiarData = await cambiar.json();
                                        if (cambiar.ok) {
                                            let title = 'Orden actualizada con exito';
                                            if (cambiarData.affectedRows > 0){
                                                actualizarRow(id);
                                            } else {
                                                title = 'No hubo cambios';
                                            }
                                            swal.fire({
                                                icon: 'success',
                                                title: 'Orden actualizada con exito',
                                                text: 'Se ha cambiado el estado de la orden a "Analítica". La orden sera procesada y analizada por un bioquimico, y los resultados estaran disponibles en ',//+cambiarData.orden.fechaAprox+' día(s).',// Los resultados estarán disponibles en '+cambiarData.orden.fechaAprox+' día(s).',
                                                allowOutsideClick: false
                                            })
                                            console.log("done:", cambiarData);
                                        } else if (!cambiar.ok) {
                                            if (cambiarData.error) {
                                                throw new Error(cambiarData.error);
                                            } else {
                                                throw new Error(cambiarData);
                                            }
                                        }
                                    } catch (err) {
                                        console.log(err);
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: err.message || 'Sucedio un error inesperado'
                                        });
                                    }
                                }
                            }
                        } else if (resModal.isDismissed) {
                            console.log("Dismissed");
                        }
                        
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
