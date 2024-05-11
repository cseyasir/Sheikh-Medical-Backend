
const http = require('http');
const fs = require('fs');
const cors = require('cors'); 
const port = 5000;

const server = http.createServer((req, res) => {
  cors()(req, res, () => {
  if (req.method === 'GET' && req.url === '/medicines') {
    // Read and send the list of all medicines
    fs.readFile('medicines.json', 'utf8', (err, data) => {
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
  }
  else if (req.method === 'GET' && req.url.startsWith('/medicines/search?')) {
    const query = req.url.split('?')[1]; // Extract query parameter
    const partialName = decodeURIComponent(query.split('=')[1]).toLowerCase();
  
  
    fs.readFile('medicines.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      } else {
        let medicines = JSON.parse(data);
        const matchingMedicines = medicines.filter((medicine) => {
          // Use string comparison to find medicines with similar names
          return medicine.name?.includes(partialName);
        });
  
        if (matchingMedicines.length > 0) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(matchingMedicines));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('No matching medicines found');
        }
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/medicines/')) {
    // Find a specific medicine by name
    const medicineId = decodeURIComponent(req.url.replace('/medicines/', ''));
    fs.readFile('medicines.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      } else {
        let medicines = JSON.parse(data);
        const medicine = medicines.find((m) => m.name === medicineId);
        if (medicine) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(medicine));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Medicine not found');
        }
      }
    });
  } else if (req.method === 'PUT' && req.url.startsWith('/medicines/')) {
    // Update a medicine
    const medicineId = decodeURIComponent(req.url.replace('/medicines/', ''));
    let updatedData = '';

    req.on('data', (chunk) => {
      updatedData += chunk;
    });

    req.on('end', () => {
      fs.readFile('medicines.json', 'utf8', (err, data) => {
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
            fs.writeFile('medicines.json', JSON.stringify(medicines), (err) => {
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

    fs.readFile('medicines.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      } else {
        let medicines = JSON.parse(data);
        const index = medicines.findIndex((medicine) => medicine.name === medicineId);

        if (index !== -1) {
          medicines.splice(index, 1);
          fs.writeFile('medicines.json', JSON.stringify(medicines), (err) => {
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
  } else if (req.method === 'POST' && req.url === '/medicines') {
    // Add a new medicine
    let newMedicineData = '';

    req.on('data', (chunk) => {
      newMedicineData += chunk;
    });

    req.on('end', () => {
      fs.readFile('medicines.json', 'utf8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Internal Server Error');
        } else {
          let medicines = JSON.parse(data);
          const newMedicine = JSON.parse(newMedicineData);
          medicines.push(newMedicine);
          fs.writeFile('medicines.json', JSON.stringify(medicines), (err) => {
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