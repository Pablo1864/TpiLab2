const btnBuscarPaciente=document.querySelector('#btnBuscarPaciente');

btnBuscarPaciente.addEventListener('click', function(){
    const pacienteBuscado =  document.querySelector('#pacienteBuscado');
    const datoPaciente=parseInt(pacienteBuscado.value);

    if(datoPaciente && datoPaciente !==''){
      window.location.href=`/buscarPaciente/${datoPaciente}`;
    }
else console.log('no se encuentra')
    })