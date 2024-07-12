// Obtén el input por su ID
const usuario = document.getElementById("usuario");
const pass = document.getElementById("pass");
const formLogin=document.getElementById("form-login")


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