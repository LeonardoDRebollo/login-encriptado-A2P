const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { loadKeys, encrypt, decrypt } = require('./encriptador');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const xmlFilePath = path.join(__dirname, 'users.xml');
const { publicKey, privateKey } = loadKeys();

function readUsers(callback) {
  fs.readFile(xmlFilePath, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      xml2js.parseString(data, (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result.users.user || []);
        }
      });
    }
  });
}

function writeUsers(users, callback) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ users: { user: users } });
  fs.writeFile(xmlFilePath, xml, callback);
}

app.get('/publicKey.pem', (req, res) => {
  res.sendFile(path.join(__dirname, 'keys', 'publicKey.pem'));
});

app.post('/register', (req, res) => {
  const encryptedData = req.body.data;
  const decryptedData = JSON.parse(decrypt(encryptedData, privateKey));
  
  const secret = speakeasy.generateSecret();
  
  const newUser = {
    nombres: encrypt(decryptedData.nombres, publicKey),
    usuario: encrypt(decryptedData.usuaario, publicKey),
    email: encrypt(decryptedData.email, publicKey),
    password: encrypt(decryptedData.password, publicKey),
    twoFactorSecret: secret.base32
  };

  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error del servidor');
    }

    users.push(newUser);

    writeUsers(users, (err) => {
      if (err) {
        return res.status(500).send('Error del servidor');
      }

      qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) {
          return res.status(500).send('Error al generar el QR');
        }
        res.json({ qrCodeUrl: data_url });
      });
    });
  });
});

app.post('/login', (req, res) => {
  const encryptedData = req.body.data;
  const decryptedData = JSON.parse(decrypt(encryptedData, privateKey));
  const { email, password } = decryptedData;

  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error del servidor');
    }

    const user = users.find(u => decrypt(u.email[0], privateKey) === email && decrypt(u.password[0], privateKey) === password);

    if (user) {
      res.send('Acceso correcto');
    } else {
      res.status(401).send('El correo o la contraseña son incorrectos');
    }
  });
});

app.get('/generate-qr', (req, res) => {
  const { email } = req.query;

  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error del servidor');
    }

    const user = users.find(u => decrypt(u.email[0], privateKey) === email);

    if (user) {
      const secret = user.twoFactorSecret;
      const otpauthUrl = speakeasy.otpauthURL({
        secret,
        label: email,
        issuer: 'YourApp'
      });

      qrcode.toDataURL(otpauthUrl, (err, data_url) => {
        if (err) {
          return res.status(500).send('Error al generar el QR');
        }
        res.json({ qrCodeUrl: data_url });
      });
    } else {
      res.status(404).send('Useruario no encontrado');
    }
  });
});

app.post('/validate-code', (req, res) => {
  const { code } = req.body;
  const { email } = req.query;
  console.log('enviado:', code);
  console.log('email:', email);
  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error del servidor');
    }

    const user = users.find(u => decrypt(u.email[0], privateKey) === email);

    if (user) {
      try {
        var secret = user.twoFactorSecret.toString();
        console.log('Secret:', secret);
        var verified = speakeasy.totp.verify({ 
          secret: secret.base32,
          encoding: 'base32',
          token: code });
        

          if (verified) {
            res.json({ isValid: true });
          } else {
            res.json({ isValid: false });
          }
      } catch (error) {
        console.error('Error de codigo:', error.message);
        res.status(500).send('Error del servidor');
      }
    } else {
      res.status(404).send('Error del servidor');
    }
  });
});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
