const iniciar = () => {

    document.querySelector('#buscarOrder').addEventListener('click', function () {
        const orderId = document.getElementById('orderIn');
        if (orderId.value != '') {
            //window.location.href = `/resultados/buscar/${orderId.value}`;
            fetch(`/resultados/buscar/${orderId.value}`, {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json'
                }
            })
        } else {
            console.log('debe ingresar un id');
        }
    })

    document.getElementById('tbodyData').addEventListener('change', (event) => {
        const target = event.target;
        if (target.type === 'checkbox' && target.classList.contains('checkboxes')) {

            const label = document.getElementsByClassName(target.id + '');
            let data;
            if (target.checked) {
                label[0].innerHTML = 'si';
                data = {
                    estado: 1
                }
            } else {
                label[0].innerHTML = 'no';
                data = {
                    estado: 0
                }
            }
            if (data.estado) {
                fetch(`/resultados/muestra/${sDataMuestras[target.id - 1].idMuestra}`, {
                    method: 'PUT',
                    Headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.JSON())
                    .then(data => {
                        console.log(data);
                    }).catch(err => {
                        console.log(err);
                    })
            } else {
                console.log('algo paso, wey...')
            }


        }
    });

}