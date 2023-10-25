
const btnRegistroPaciente=document.querySelector('#btn_registroPaciente');
const iconosEliminar=document.getElementsByClassName('borrarPaciente');

//parametros por url 
btnRegistroPaciente.addEventListener('click', function(){

    const nombre=document.querySelector('#nombre');
    const apellido=document.querySelector('#apellido');
    const dni=document.querySelector('#dni');
    const telefono=document.querySelector('#telefono');
    const fechaNac=document.querySelector('#fechaNac');
    const email=document.querySelector('#email');
    const provincia=document.querySelector('#provincia');
    const localidad=document.querySelector('#localidad');
    const domicilio=document.querySelector('#domicilio');
    const obraSocial=document.querySelector('#obraSocial');
    const numeroAfiliado=document.querySelector('#numeroAfiliado');
    console.log(fechaNac.value);
   
    const select = document.getElementById('sexo');
    const sexo = select.options[select.selectedIndex].value;
    window.location.href=`agregar/${nombre.value}/${apellido.value}/${dni.value}/${telefono.value}/${sexo}/${fechaNac.value}/${email.value}/${provincia.value}/${localidad.value}/${domicilio.value}/${obraSocial.value}/${numeroAfiliado.value}`
   
})

for(let i of iconosEliminar ){

    i.addEventListener('click',function(){
        let id=this.getAttribute('id')
        window.location.href=`delete/${id}`}
    )
}
