document.getElementById('registerBtn').addEventListener('click', async () => {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: 'user123' })
    });
    const data = await response.json();
    document.getElementById('qrCode').innerHTML = `<img src="${data.qrCodeUrl}">`;
  });

  document.getElementById('verifyBtn').addEventListener('click', async () => {
    const token = document.getElementById('token').value;
    const response = await fetch('http://localhost:3000/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: 'user123', token })
    });
    const data = await response.json();
    document.getElementById('result').textContent = data.verified ? 'Verified' : 'Not Verified';
  });