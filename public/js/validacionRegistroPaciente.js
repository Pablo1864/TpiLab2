const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');
const select = document.querySelectorAll('#formulario select');
//const sele=document.getElementById('provincia');

const expresiones = {
	string: /^[a-zA-ZÀ-ÿ\s]{2,40}$/, // Letras y espacios, pueden llevar acentos.
	email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
	telefono: /^\d{6,14}$/,// 6 a 14 numeros.
	domicilio:/^[a-zA-ZÀ-ÿ-0-9\s]{2,100}/,
	dni:/^\d{7,9}$/,
	numeroAfiliado:/^\d{6,20}$/,// 6 a 14 numeros.
	fechaNac:/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
}

const campos = {
	nombre: false,
    apellido:false,
	dni:false,
	telefono:false,
	email:false,
	fechaNac:false,
	localidad:false,
	domicilio:false,
    numeroAfiliado:false,
	sexo:false,
	provincia:false,
	obraSocial:false
}

const validarFormulario = (e) => {
	switch (e.target.name) {
		case "apellido":
			validarCampo(expresiones.string, e.target,"apellido");
		break;
		case "nombre":
			validarCampo(expresiones.string, e.target,"nombre");
		break;
		case "telefono":
			validarCampo(expresiones.telefono, e.target,"telefono");
		break;
		case "email":
			validarCampo(expresiones.email, e.target,"email");
		break;
		case "dni":
			validarCampo(expresiones.dni, e.target,"dni");
		break;
		case "localidad":
			validarCampo(expresiones.domicilio, e.target,"localidad");
		break;
		case "domicilio":
			validarCampo(expresiones.domicilio, e.target,"domicilio");
		break;
		case "numeroAfiliado":
			validarCampo(expresiones.numeroAfiliado, e.target,"numeroAfiliado");
		break;
		case "fechaNac":
			validarCampo(expresiones.fechaNac, e.target,"fechaNac");
		break;
	}
}

const validarCampo = (expresion,valorCampo,nombreCampo) => {
	if(expresion.test(valorCampo.value)){
        document.getElementById(`${nombreCampo}Error`).classList.remove('input-error-activo');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error');
		campos[nombreCampo] = true;
	} else {
		//console.log('entro al else de la validacion');
        //console.log(valorCampo.value)
		document.getElementById(`${nombreCampo}Error`).classList.remove('input-error');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error-activo');
		campos[nombreCampo] = false;
	}
}

const validarInputsVacios=(id) =>{
      document.getElementById(`${id}Error`).classList.remove('input-error');
      document.getElementById(`${id}Error`).classList.add('input-error-activo');
	  campos[id] = false;
}

const validarSelectVacios=(id) => {
	valor= document.getElementById(`${id}`).value
	if(valor === ''){
		document.getElementById(`${id}Error`).classList.remove('input-error');
	    document.getElementById(`${id}Error`).classList.add('input-error-activo');
		campos[id] = false;
	}else{
		document.getElementById(`${id}Error`).classList.remove('input-error-activo');
	    document.getElementById(`${id}Error`).classList.add('input-error');
		campos[id] = true;
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
	if(campos.nombre && campos.apellido && campos.email && campos.telefono && campos.numeroAfiliado
		&& campos.dni && campos.fechaNac && campos.localidad && campos.domicilio && campos.sexo
		&& campos.provincia && campos.obraSocial ){
			formulario.submit();
		
	} else {
        e.preventDefault();
	}
});