// Almacena el token en sessionStorage
function storeToken(token) {
  console.log('en storeToken ' + token)
  if (token) {
    sessionStorage.setItem('token', token);
    console.log('token.js -> Token almacenado en sessionStorage:', token);
  } else {
    console.error('no hay token');
  }
}