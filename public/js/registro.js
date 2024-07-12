// Obtén el input por su ID
const usuario = document.getElementById("usuario");
const pass = document.getElementById("pass");
const pass2 = document.getElementById("pass2");
const rol = document.getElementById("rol");
const btnRegistrar= document.getElementById("btnRegistrar");

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
            labels[i].textContent = "* Usuario";
            break; }
            if(valor==='pass'){
            labels[i].textContent = "* Contraseña";
            break; 
            }
            if(valor==='pass2'){
            labels[i].textContent = "* Repetir Contraseña";
             break; 
            }
            if(valor==='rol'){
            labels[i].textContent = "* Rol";
            break; 
              }
        }
      }

  }
}


document.getElementById('form-register').addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log(e.
      target.elements.usuario.value);
    console.log(e.
        target.elements.pass.value);
    console.log(e.
          target.elements.pass2.value)    
})
const formulario = document.getElementById('form-register');
const inputs = document.querySelectorAll('#form-register input');
const select = document.querySelectorAll('#form-register select');

const expresiones = {
  // 8 caracteres al menos una mayuscula un caracter especial y un numero
	pass:/^(?=.*[A-Z])(?=.*[^A-Za-z\s])(?=.*\d).{8}$/,
  pass2: /^(?=.*[A-Z])(?=.*[^A-Za-z\s])(?=.*\d).{8}$/,
	usuario:/^.{6,}$/,// al menos 6 digitos
  rol:/^[0-9]$/
}

const campos = {
	pass: false,
  pass2:false,
  usuario:false,
	rol:false,
}

const validarVisibilidadBtnRegistro = () => {
if(campos.pass2 && campos.pass && campos.usuario && campos.rol){
  btnRegistrar.hidden=false
} 
else {
  btnRegistrar.hidden=true
}
}
validarVisibilidadBtnRegistro()

const validarFormulario = (e) => {
	switch (e.target.name) {
		case "pass":
			validarCampo(expresiones.pass, e.target,"pass");
		break;
    case "pass2":
			validarCampo(expresiones.pass2, e.target,"pass2");
		break;
		case "usuario":
			validarCampo(expresiones.usuario, e.target,"usuario");
		break;
		}
}

const validarCampo = (expresion,valorCampo,nombreCampo) => {
	if(expresion.test(valorCampo.value)){
    console.log(valorCampo.value,nombreCampo + 'Entro por el if ')

    document.getElementById(`${nombreCampo}Error`).classList.remove('input-error-activo');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error');
		campos[nombreCampo] = true;
    validarVisibilidadBtnRegistro()
	} else {
		//console.log('entro al else de la validacion');
    console.log(valorCampo.value + 'Entro por el else ')
		document.getElementById(`${nombreCampo}Error`).classList.remove('input-error');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error-activo');
		campos[nombreCampo] = false;
    validarVisibilidadBtnRegistro()
	}
}

const validarInputsVacios=(id) =>{
      document.getElementById(`${id}Error`).classList.remove('input-error');
      document.getElementById(`${id}Error`).classList.add('input-error-activo');
	  campos[id] = false;
    validarVisibilidadBtnRegistro()
}

const validarSelectVacios=(id) => {
	valor= document.getElementById(`${id}`).value
	if(valor === ''){
		document.getElementById(`${id}Error`).classList.remove('input-error');
	    document.getElementById(`${id}Error`).classList.add('input-error-activo');
		campos[id] = false;
    validarVisibilidadBtnRegistro()
	}else{
		document.getElementById(`${id}Error`).classList.remove('input-error-activo');
	    document.getElementById(`${id}Error`).classList.add('input-error');
		campos[id] = true;
    validarVisibilidadBtnRegistro()
	}
	
};

//valida mientras se escribe en el input
inputs.forEach((input) => {
	input.addEventListener('keyup', validarFormulario);
	input.addEventListener('blur', validarFormulario);
});

function handleChange(event,id){
    var selectedOption = event.target.options[event.target.selectedIndex];
	
    //console.log("Option selected: " + selectedOption.value +' '+ id);
    if(selectedOption.value === ''){
		document.getElementById(`${id}Error`).classList.remove('input-error');
	    document.getElementById(`${id}Error`).classList.add('input-error-activo');
		campos[id] = false;
	}else{
		document.getElementById(`${id}Error`).classList.remove('input-error-activo');
	    document.getElementById(`${id}Error`).classList.add('input-error');
		campos[id] = true;
	}

}


//submit
formulario.addEventListener('submit', (e) => {
	e.preventDefault();

 //validar inputs  vacios
	for (let i = 0; i < inputs.length; i++) {
		let elemento = inputs[i];
		let id = elemento.id;
		let name=elemento.name;
		let valor= document.getElementById(`${id}`).value;
		console.log(id + ' el value es ' + valor)
		if(valor === ''){
			//console.log(id + ' el value es vacio ')
			validarInputsVacios(id);
		}
		else campos[id] = true;	
	}

//validar select vacios
for (let i = 0; i < select.length; i++) {
	let elemento = select[i];
	let id = elemento.id;
	let valor= document.getElementById(`${id}`).value;

	console.log(id + ' el value es ' + valor)
	if(valor === ''){
		//console.log(id + ' el value es vacio ')
		validarSelectVacios(id);
	}	
	else campos[id] = true;	
}

// verifica que todos los campos esten correctos para poder enviar
	if(campos.pass && campos.usuario && campos.rol){
			formulario.submit();
		
	} else {
        e.preventDefault();
	}
});
const iconNoVerPass = document.getElementById('iconNoVer');
const iconVerPass = document.getElementById('iconVer');

const iconNoVerPass2 = document.getElementById('iconNoVer2');
const iconVerPass2 = document.getElementById('iconVer2');

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

//onclick ver pass2
document.addEventListener('DOMContentLoaded', function() {
  // Agregar evento onclick al span
  iconVerPass2.addEventListener('click', function() {
      // Mostrar el valor del input
      pass2.type = 'text'; // Cambiar el tipo de input a texto para mostrar el valor
      pass2.value = pass2.value; // Actualizar el valor para asegurar que se muestre
      iconVerPass2.style.display = 'none'; // Ocultar el span después de mostrar el valor
      iconNoVerPass2.style.display = 'inline-block';
  });
});

//onclick ocultar pass2
document.addEventListener('DOMContentLoaded', function() {
  iconNoVerPass2.addEventListener('click', function() {
      // Mostrar el valor del input
      pass2.type = 'password'; // Cambiar el tipo de input a texto para mostrar el valor
      pass2.value = pass2.value; // Actualizar el valor para asegurar que se muestre
      iconVerPass2.style.display = 'inline-block'; // Ocultar el span después de mostrar el valor
      iconNoVerPass2.style.display = 'none';
  });
});


  