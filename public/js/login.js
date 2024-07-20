// Obtén el input por su ID
const usuario = document.getElementById("usuario");
const pass = document.getElementById("pass");
const formLogin=document.getElementById("form-login")

const iconNoVerPass = document.getElementById('iconNoVer');
const iconVerPass = document.getElementById('iconVer');

//onclick ver pass
document.addEventListener('DOMContentLoaded', function() {
  // Agregar evento onclick al span
  iconVerPass.addEventListener('click', function() {
      // Mostrar el valor del input
      pass.type = 'text'; // Cambiar el tipo de input a texto para mostrar el valor
      pass.value = pass.value; // Actualizar el valor para asegurar que se muestre
      iconVerPass.style.display = 'none'; // Ocultar el span después de mostrar el valor
      iconNoVerPass.style.display = 'inline-block';
  });
});

//onclick ocultar pass
document.addEventListener('DOMContentLoaded', function() {
  iconNoVerPass.addEventListener('click', function() {
      // Mostrar el valor del input
      pass.type = 'password'; // Cambiar el tipo de input a texto para mostrar el valor
      pass.value = pass.value; // Actualizar el valor para asegurar que se muestre
      iconVerPass.style.display = 'inline-block'; // Ocultar el span después de mostrar el valor
      iconNoVerPass.style.display = 'none';
  });
});


// Define la función que quieres asociar al input
function escuchaInput(valor) {
    let inputValue = document.getElementById(`${valor}`).value;
    let labels = document.getElementsByTagName("label");

    //si escriben en input borra value label
   if(inputValue.length > 0 ){ 
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].htmlFor === valor) {
          labels[i].textContent = "";
        break; // Terminamos el bucle ya que hemos encontrado la etiqueta asociada al input
      }
    }
  }
  //Si borran todo del input restablece valores del label
   if(inputValue.length === 0 ){
    for (var i = 0; i < labels.length; i++) {
        if (labels[i].htmlFor === valor) {
            if(valor==='usuario'){
            labels[i].textContent = "Usuario *";
            break; }
            if(valor==='pass'){
            labels[i].textContent = "Contraseña *";
            break; 
            }
        }
      }

  }
}



formLogin.addEventListener("submit",(e)=>{
  console.log(e.
    target.elements.usuario.value);
  console.log(e.
      target.elements.pass.value);
    if(pass.value !='' && usuario.value !='' ){
   //   console.log(inputPass.value +' ' + inputUsuario.value);
      e.preventDefault();
			formLogin.submit();
    }
	// } else {
  //       e.preventDefault();
	// }

   
})