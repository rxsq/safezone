const express = require('express');
const path = require('path');
const fs = require('fs');
const { LIMIT_LENGTH } = require('sqlite3');
const { read } = require('pdfkit');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/ncr_form.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

function paginatedResults(model){
    return (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page -1) * limit;
        const endIndex = page * limit;

        const results = {}

        if(endIndex < model.length){
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if(startIndex > 0){
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        results.results = model.slice(startIndex, endIndex);

        res.paginatedResults = results;
        next();
    }
}

// GET all NCR forms
router.get('/', (req, res, next) => {
    try {
        const data = readJsonFile(filename); 

        if (Object.keys(req.query).length === 0) {
            return res.json({
                status: 'success',
                totalRecords: data.length,
                totalPages: Math.ceil(data.length / 10),
                currentPage: 1, 
                items: data,
            });
        }

        res.locals.data = data; 
        paginatedResults(data)(req, res, next);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
}, (req, res) => {
    const data = res.locals.data; 
    const totalRecords = data.length;
    const limit = parseInt(req.query.limit) || 10; 
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = parseInt(req.query.page) || 1;

    res.json({
        status: 'success',
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage,
        items: res.paginatedResults.results,
        next: res.paginatedResults.next,
        previous: res.paginatedResults.previous
    });
});

// GET a specific NCR form by ncrFormID
router.get('/:ncrFormID', (req, res) => {
    const ncrFormID = parseInt(req.params.ncrFormID, 10); // Get ncrFormID from the route parameters

    try {
        const existingData = readJsonFile(filename);
        const ncrForm = existingData.find(item => item.ncrFormID === ncrFormID);

        if (!ncrForm) {
            // If the NCR form does not exist, return 404
            return res.status(404).json({ status: 'error', message: 'NCR form not found' });
        }

        res.json(ncrForm); // Return the specific NCR form as JSON
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST to create a new NCR form
router.post('/', (req, res) => {
    const newNCRForm = req.body;

    // Read existing data
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading data file' });

        const ncrForms = JSON.parse(data);

        // Generate ncrFormID based on the length of the current data
        const newNcrFormID = ncrForms.length > 0 ? ncrForms[ncrForms.length - 1].ncrFormID + 1 : 1;
        newNCRForm.ncrFormID = newNcrFormID; // Assign the new ID

        // Add new form to the array
        ncrForms.push(newNCRForm);

        // Write updated data back to file
        fs.writeFile(filename, JSON.stringify(ncrForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });
            res.status(201).json({
                message: 'NCR form created successfully',
                ncrForm: newNCRForm, // Return the newly created form as part of the response
            });
        });
    });
});

// PUT (Update) an NCR form by ncrFormID
router.put('/:ncrFormID', (req, res) => {
    const ncrFormID = parseInt(req.params.ncrFormID, 10); // Get ncrFormID from the route parameters
    const updatedData = req.body; // Get the updated data from the request body

    // Validation: Ensure the required fields exist in the updatedData
    if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ status: 'error', message: 'No data provided to update' });
    }

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.ncrFormID === ncrFormID);

        if (index === -1) {
            // If the NCR form does not exist, return 404
            return res.status(404).json({ status: 'error', message: 'NCR form not found' });
        }

        // Update the existing record with new data
        existingData[index] = { ...existingData[index], ...updatedData };

        // Ensure that data is written back to the file
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'NCR form updated successfully' });

    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});


// Export the router
module.exports = router;