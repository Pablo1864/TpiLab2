const btnRegistroPaciente=document.querySelector('#btn_registroPaciente');
const iconosEliminar=document.getElementsByClassName('borrarPaciente');

//parametros por url 
btnRegistroPaciente.addEventListener('click', function(){

    const nombre=document.querySelector('#nombre');
    const apellido=document.querySelector('#apellido');
    let dni=document.querySelector('#dni');
    let telefono=document.querySelector('#telefono');
    const fechaNac=document.querySelector('#fechaNac');
    const email=document.querySelector('#email');
    const provincia=document.querySelector('#provincia');
    const localidad=document.querySelector('#localidad');
    const domicilio=document.querySelector('#domicilio');
    const obraSocial=document.querySelector('#obraSocial');
    let numeroAfiliado=document.querySelector('#numeroAfiliado');
    const select = document.getElementById('sexo');
    const sexo = select.options[select.selectedIndex].value;
    dni=parseInt(dni.value);
    telefono=parseInt(telefono.value);
    numeroAfiliado=parseInt(numeroAfiliado.value);

    window.location.href=`/registrarPaciente/${nombre.value}/${apellido.value}/${dni}/${telefono}/${sexo}/${fechaNac.value}/${email.value}/${provincia.value}/${localidad.value}/${domicilio.value}/${obraSocial.value}/${numeroAfiliado}`

})

for(let i of iconosEliminar ){

    i.addEventListener('click',function(){
        let id=this.getAttribute('id')
        window.location.href=`delete/${id}`}
    )
}
