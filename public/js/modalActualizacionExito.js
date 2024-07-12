// function success(){  
swal({
    title: "La actualización del registro fue exitosa!",
    text: "Redirecting in 5 seconds.",
    type: "success",
    timer: 4000,
    showConfirmButton: true
   }, function(){
       window.location.href = "buscar";
  })
  