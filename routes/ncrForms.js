const express = require('express');
const path = require('path');
const fs = require('fs');
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

// GET all NCR forms
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
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

        let ncrForms = JSON.parse(data);
        ncrForms.push(newNCRForm); // Add new form to array

        // Write updated data back to file
        fs.writeFile(filename, JSON.stringify(ncrForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });
            res.status(201).json({ message: 'NCR form created successfully' });
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