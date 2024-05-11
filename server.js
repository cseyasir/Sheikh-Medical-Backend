const http = require('http');
const fs = require('fs');
const cors = require('cors'); 
const port = 5000;
const medicineFilePath = 'medicines.json';

// Ensure the medicines.json file exists and contains an empty array if it doesn't
if (!fs.existsSync(medicineFilePath)) {
  fs.writeFileSync(medicineFilePath, '[]', 'utf8');
}

const server = http.createServer((req, res) => {
  cors()(req, res, () => {
    if (req.method === 'GET' && req.url === '/medicines') {
      // Read and send the list of all medicines
      fs.readFile(medicineFilePath, 'utf8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Internal Server Error');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        }
      });
    } else if (req.method === 'POST' && req.url === '/medicines') {
      // Add a new medicine
      let newMedicineData = '';

      req.on('data', (chunk) => {
        newMedicineData += chunk;
      });

      req.on('end', () => {
        fs.readFile(medicineFilePath, 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
          } else {
            let medicines = JSON.parse(data);
            const newMedicine = JSON.parse(newMedicineData);
            medicines.push(newMedicine);
            fs.writeFile(medicineFilePath, JSON.stringify(medicines), (err) => {
              if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
              } else {
                res.statusCode = 201; // Created
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newMedicine));
              }
            });
          }
        });
      });
    } else if (req.method === 'PUT' && req.url.startsWith('/medicines/')) {
      // Update a medicine
      const medicineId = decodeURIComponent(req.url.replace('/medicines/', ''));
      let updatedData = '';

      req.on('data', (chunk) => {
        updatedData += chunk;
      });

      req.on('end', () => {
        fs.readFile(medicineFilePath, 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
          } else {
            let medicines = JSON.parse(data);
            const updatedMedicine = JSON.parse(updatedData);
            const index = medicines.findIndex((medicine) => medicine.name === medicineId);

            if (index !== -1) {
              medicines[index] = updatedMedicine;
              fs.writeFile(medicineFilePath, JSON.stringify(medicines), (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'text/plain');
                  res.end('Internal Server Error');
                } else {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(updatedMedicine));
                }
              });
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Medicine not found');
            }
          }
        });
      });
    } else if (req.method === 'DELETE' && req.url.startsWith('/medicines/')) {
      // Delete a medicine
      const medicineId = decodeURIComponent(req.url.replace('/medicines/', ''));

      fs.readFile(medicineFilePath, 'utf8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Internal Server Error');
        } else {
          let medicines = JSON.parse(data);
          const index = medicines.findIndex((medicine) => medicine.name === medicineId);

          if (index !== -1) {
            medicines.splice(index, 1);
            fs.writeFile(medicineFilePath, JSON.stringify(medicines), (err) => {
              if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
              } else {
                res.statusCode = 204; // No content
                res.end();
              }
            });
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Medicine not found');
          }
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
