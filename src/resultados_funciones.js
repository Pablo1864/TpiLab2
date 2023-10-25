const iniciar = () =>{

    document.querySelector('#buscarOrder').addEventListener('click', function(){
        const orderId = document.getElementById('orderIn');
        if (orderId.value!= '') {
            window.location.href=`/resultados/buscar/${orderId.value}`;  
        } else{
            console.log('debe ingresar un id');
        }   
    })

    document.getElementById('tbodyData').addEventListener('change', (event) =>{
        const target = event.target;
        if (target.type === 'checkbox' && target.classList.contains('checkboxes')){
            console.log(target.checked);
            console.log(target.id);
            const examenId = target.id;
            const nroOrden = target.id;
            const muestraData = {
                estado: target.checked,
            }
        }
    });

}