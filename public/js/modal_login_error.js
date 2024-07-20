swal({
    title: "Usuario y/o contraseña incorrecta!",
    text: "Redirecting in 5 seconds.",
    type: "error",
    timer: 5000,
    showConfirmButton: true
   }, function(){
       window.location.href = "usuario/login";
  
  })