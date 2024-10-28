const express = require('express');
const path = require('path');
const fs = require('fs');
const ncrFormsRoutes = require('./routes/ncrForms'); // Assuming you have ncrForms.js
const productsRoutes = require('./routes/products');
const suppliersRoutes = require('./routes/suppliers');
const employeesRoutes = require('./routes/employees');
const positionsRoutes = require('./routes/positions');

// Add more routes as needed
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Use JSON middleware to parse JSON bodies
app.use(express.json());

// Use your routes
app.use('/api/ncrForms', ncrFormsRoutes); // Route for NCR Forms
app.use('/api/products', productsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/positions', positionsRoutes);

// Serve the HTML page for NCR Forms
app.get('/ncrForms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

// Dynamic route to render other HTML pages
app.get('*', (req, res) => {
    const requestedPath = req.path === '/' ? '/index' : req.path; // Default to index.html for root
    const sanitizedPath = requestedPath.replace('.html', '');
    const filePath = path.join(__dirname, 'public', 'views', `${sanitizedPath}.html`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('404 Not Found');
        }
        res.sendFile(filePath);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
