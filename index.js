const express = require('express');
const path = require('path');
const app = express();

// JSON olarak gelen verileri işleyebilmek için middleware
app.use(express.json());

// Static dosyalar için
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa için
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

// POST API endpoint'i
app.post('/api', async (req, res) => {
  // Gelen isteğin gövdesini (body) değişkene atayın ve konsola yazdırın
  const requestBody = req.body;
  //console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  // İstek metodu kontrolü - Bu kontrol aslında gereksiz çünkü bu kod bloğu zaten sadece POST istekler için çalışıyor
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // İstek yapılan domain kontrolü (Origin kontrolü)
  const origin = req.headers.origin;  // `req.get('origin')` yerine `req.headers.origin` kullanılabilir
  //console.log('Request Origin:', origin);

  // Belirli bir domainden gelen istekleri kabul etme
  /*if (origin !== 'https://ode.mustafaozturk.dev') {
    return res.status(403).send('Forbidden: This origin is not allowed');
  }
  */
  const filePath = './functions.js';
  const functions = require(filePath);
  const fnc = requestBody.action;
    if (functions[fnc] && typeof functions[fnc] === 'function') {
        try {
            await functions[fnc](req, res); // Asenkron fonksiyonun sonucunu bekliyoruz
        } catch (error) {
            console.error("Hata:", error);
            res.send({"Error": "İşlem sırasında hata oluştu"});
        }
    } else {
        res.send({"Error": "Fonksiyon bulunamadı"});
    }
});

// Sunucuyu başlatın
const port = 3534; // Port'u belirtin
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
