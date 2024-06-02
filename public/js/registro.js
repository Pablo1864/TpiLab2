// Obtén el input por su ID
const inputEmail = document.getElementById("email");
const inputPass = document.getElementById("pass");
const inputPass2 = document.getElementById("pass2");

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
            if(valor==='email'){
            labels[i].textContent = "Email";
            break; }
            if(valor==='pass'){
            labels[i].textContent = "Contraseña";
            break; 
            }
            if(valor==='pass2'){
            labels[i].textContent = "Repetir Contraseña";
             break; 
            }
        }
      }

  }
}



document.getElementById('form-register').addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log(e)
})


  