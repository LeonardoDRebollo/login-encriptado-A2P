function ValidarPass() {
    var pass1 = document.getElementById('password').value;
    var pass2 = document.getElementById('password-repeat').value;
    var boton = document.getElementById('button-enviar');
    var aviso = document.getElementById('aviso');
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[_.\-!$@?%#&])[A-Za-z\d_.\-!$@?%#&]{8,}$/;

    if (pass1 !== pass2 || pass1 === '') {
        mostrarAviso(aviso, "Las contraseñas no coinciden.");
        deshabilitarBoton(boton);
    } else if (!regex.test(pass1)) {
        mostrarAviso(aviso, "La contraseña no cumple con los siguientes requisitos:");
        if (pass1.length < 8) {
            agregarRequisito(aviso, "- Debe tener al menos 8 caracteres.");
        } else {
            if (!/(?=.*[a-z])/.test(pass1)) {
                agregarRequisito(aviso, "- Debe contener al menos una letra minúscula.");
            } 
            if (!/(?=.*[A-Z])/.test(pass1)) {
                agregarRequisito(aviso, "- Debe contener al menos una letra mayúscula.");
            } 
            var secuencia = tieneSecuenciaDeNCaracteres(pass1);
            if (secuencia) {
                mostrarAviso(aviso, "No se permiten secuencias como '" + secuencia + "'.");
            }
            if (!/(?=.*[_.\-!$@?%#&])/.test(pass1)) {
                agregarRequisito(aviso, "- Debe contener al menos un carácter especial: ._-!$@?%#&");
            } 
        }
    } else {
        aviso.hidden = true;
        boton.disabled = false;
    }
}

function tieneSecuenciaDeNCaracteres(texto, N) {
    let max = N || 4,
        length = texto.length,
        consecutivos = 1,
        ultimoCaracter = texto.charCodeAt(0);

    for (let i = 1; i < length; i++) {
        let caracterActual = texto.charCodeAt(i);
        // Verificamos si el carácter actual es el siguiente carácter en la secuencia
        if (caracterActual === ultimoCaracter + 1) {
            consecutivos++;
            if (consecutivos >= max) {
                return texto.substr(i - max + 1, max);
            }
        } else {
            consecutivos = 1;
        }
        ultimoCaracter = caracterActual;
    }
    return false;
}

function mostrarAviso(aviso, mensaje) {
    aviso.textContent = mensaje;
    aviso.hidden = false;
}

function deshabilitarBoton(boton) {
    boton.disabled = true;
}

function agregarRequisito(aviso, requisito) {
    aviso.textContent += "\n" + requisito;
}
