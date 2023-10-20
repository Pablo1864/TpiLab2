const nombre=document.querySelector('#nombre');
const apellido=document.querySelector('#apellido');
const telefono=document.querySelector('#telefono');
const dni=document.querySelector('#dni');
const btnRegistroPaciente=document.querySelector('#btn_registroPaciente')

//captura los parametros por url 
btnRegistroPaciente.addEventListener('click', function(){
    window.location.href=`agregar/${nombre.value}/${apellido.value}/${dni.value}/${telefono.value}`
    window.location.reload();
})

