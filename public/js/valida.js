const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

const expresiones = {
	string: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
	email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
	telefono: /^\d{7,14}$/ // 7 a 14 numeros.
}

const campos = {
	nombre: false,
    apellido:false
}

const validarFormulario = (e) => {
    console.log(e.target);
	switch (e.target.name) {
		case "apellido":
			validarCampo(expresiones.string, e.target,"apellido");
		break;
		case "nombre":
			validarCampo(expresiones.string, e.target,"nombre");
		break;
	
	}
}

const validarCampo = (expresion,valorCampo,nombreCampo) => {
	if(expresion.test(valorCampo.value)){
        document.getElementById(`${nombreCampo}Error`).classList.remove('input-error-activo');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error');
		campos[nombreCampo] = true;
	} else {
		console.log('entro al else de la validacion');
        console.log(valorCampo.value)
		document.getElementById(`${nombreCampo}Error`).classList.remove('input-error');
		document.getElementById(`${nombreCampo}Error`).classList.add('input-error-activo');
		campos[nombreCampo] = false;
	}
}


inputs.forEach((input) => {
	input.addEventListener('keyup', validarFormulario);
	input.addEventListener('blur', validarFormulario);
});

formulario.addEventListener('submit', (e) => {
	e.preventDefault();


	if(campos.nombre && campos.apellido ){
		
	
	} else {
        e.preventDefault();
	}
});