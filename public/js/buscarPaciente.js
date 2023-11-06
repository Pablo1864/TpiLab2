document.getElementById('pacienteID').addEventListener('input', (event) => {
  const input = event.target;
  const div = document.getElementById('divPacienteError');
  if (verificar(input) == 'error') {
      if (!div.querySelector('p')){
          const p = document.createElement('p');
          p.classList.add('form-text');
          p.classList.add('text-danger');
          p.innerHTML = 'Debe ingresar solo numeros para buscar por DNI, solo letras para apellido o un formato valido de email (nombreEmail@email.com).';
          div.appendChild(p);
      }
      
  } else {
      div.innerHTML = '';
  };
})
$(document).ready(function () {
  //inicializacion de datatable
  const tablePacientes = $('#table_patients').DataTable({ 
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-AR.json',
  },
      select: true,
      responsive: {
          responsive: true,
          breakpoints: [
              {name: 'xxl', width: Infinity},
              {name: 'xl', width: 1400},
              {name: 'lg', width: 1200},
              {name: 'md', width: 768},
              {name: 'sm', width: 576},
          ],
          details: {
              type: 'column',
              target: 'tr'
          }
      },
      columns: [
          { title:'', data: 'idPaciente', visible: false },
          { title: 'Nombre',
              data: null,
              render: function (data, type, row) {
                  return data.nombre + ', ' + data.apellido;
              },
              priority: 2,
          },
          { title: 'Dni', data: 'dni', priority: 2},
          { title: 'Sexo', data: 'sexo', priority: 1},
          { title: 'Fecha de nac.', data: 'fechaNacimiento' },
          { title: 'Provincia, localidad', 
              data: null, render: function (data, type, row) {
                  return data.provincia + ', ' + data.localidad;
              }, priority: 0
          },
          { title: 'Domicilio', data: 'domicilio', priority: 0 },
          { title: 'Telefono', data: 'telefono', priority: 0 },
          { title: 'Email', data: 'email', priority: 0 },
          { title: 'Obra social', data: 'obraSocial', priority: 0 },
          { title: 'Nro. Afiliado', data: 'nroAfiliado', priority: 0 },
          {"defaultContent": "<button type='button' class='editar btn btn-primary'><i class='bi bi-pencil-fill'></i></button>	<button type='button' class='eliminar btn btn-danger' data-toggle='modal' data-target='#modalEliminar' ><i class='bi bi-trash3-fill'></i></button>"},
      ]
  })

  const buttonBuscarPaciente = document.getElementById('buscarPaciente');
  buttonBuscarPaciente.addEventListener('click', () => {
      buscarPaciente(tablePacientes);
  });

  
  obtener_data_editar("#table_patients tbody", tablePacientes)
})

const obtener_data_editar= function(tbody,table){
  $(tbody).on("click","button.editar", function(){
    let data=table.row($(this).parents("tr")).data();
    console.log(data)
  })
}


//Hace los fetch correspondiente al value del input de pacientes y envia los pacientes encontrados a la table
async function buscarPaciente(table) {
  const input = document.getElementById('pacienteID');
  switch (verificar(input)) {
      case 'mail': //busca por mail
          manejarFetch(`/paciente/buscarPorMail/${input.value}`, table, llenarData)
          break;
      case 'number': //busca por dni
          manejarFetch(`/paciente/buscarPorDni/${input.value}`, table, llenarData)
          break;
      case 'string': //busca por apellido
          manejarFetch(`/paciente/buscarPorApe/${input.value}`, table, llenarData)
          break;
      case 'vacio': //si no se ingresa nada, trae todos los pacientes en db
          manejarFetch(`/paciente/buscarTodos`, table, llenarData)
          break;
      default:
          break;
  }
}

async function manejarFetch(route, table, fun){
  try {
      const res = await fetch(route);
      if (!res.ok) {
          throw new Error('Network response was not ok... :c');
      }
      const data = await res.json();
      fun(table, data);
  } catch (err) {
      console.error('Error:', err);
  }
}

const llenarData = (table, data) => {
  const btn = document.getElementById('btn_registrar');
  const p = document.getElementById('p_registrarP');
  if (btn) {
      if (p) {
          p.parentNode.removeChild(p);
      }
      btn.parentNode.removeChild(btn);
  }
  if (data.length > 0) {
      llenarTableConData(table, data);
  } else {  
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('btn');
      btn.classList.add('btn-warning');
      btn.id = 'btn_registrar';
      btn.innerHTML = 'Registrar paciente nuevo';
      let p = document.createElement('p');
      p.id = 'p_registrarP';
      p.innerHTML = '¡No se encontro ningun paciente!';
      document.getElementById('search').appendChild(btn);
      document.getElementById('search').appendChild(p);
      return false
  }
}

const verificar = (input) => {
  if (input.value.trim() != '') {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const regexNumber = /^[0-9]+$/;
      const regexLetters = /^[a-zA-Z]+$/;

      if (regexEmail.test(input.value)) {
          input.classList.remove('error');
          input.classList.add('correct');
          return 'mail';
      } else if (regexLetters.test(input.value)) {
          input.classList.remove('error');
          input.classList.add('correct');
          return 'string';
      } else if (regexNumber.test(input.value)) {
          input.classList.remove('error');
          input.classList.add('correct');
          return 'number';
      } else {
          input.classList.remove('correct');
          input.classList.add('error');
      }
  } else {
      input.classList.remove('error');
      input.classList.add('correct');
      return 'vacio';
  }
  return 'error';
}

const llenarTableConData = (table, data) =>{
  table.clear();
  table.rows.add(data).draw();
}
