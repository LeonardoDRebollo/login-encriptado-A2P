document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  fetch('../Keys/publicKey.pem')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(publicKeyPem => {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const formData = new FormData(registerForm);
          const data = Object.fromEntries(formData.entries());

          const encryptedData = encrypt(JSON.stringify(data), publicKey);

          fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: encryptedData })
          })
            .then(response => {window.location.href = 'login.html';})
            .then(message => alert('Registro exitoso, logeate para acceder'))
            .catch(error => console.error('Error:', error));
        });
      }

      if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const formData = new FormData(loginForm);
          const data = Object.fromEntries(formData.entries());

          const encryptedData = encrypt(JSON.stringify(data), publicKey);

          fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: encryptedData })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('El correo o la contraseña son incorrectos');
              }
              var email = document.getElementsByName('email')[0].value;
              var encodedEmail = encodeURIComponent(email);
              window.location.href = 'auth.html?email=' + encodedEmail;
              return response.text();
            })
            .then(message => alert(message))
            .catch(error => alert(error.message));
        });
      }
    })
    .catch(error => console.error('Error:', error));

  function encrypt(data, publicKey) {
    return forge.util.encode64(publicKey.encrypt(forge.util.encodeUtf8(data)));
  }
});
