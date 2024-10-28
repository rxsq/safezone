const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/ncr_forms.json');

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

// PUT (Update) an NCR form by ncrFormNo
router.put('/:ncrFormNo', (req, res) => {
    const ncrFormNo = req.params.ncrFormNo; // Get ncrFormNo from the route parameters
    const updatedData = req.body; // Get the updated data from the request body

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.ncrFormNo === ncrFormNo);

        if (index === -1) {
            // If the NCR form does not exist, return 404
            return res.status(404).json({ status: 'error', message: 'NCR form not found' });
        }

        // Update the existing record with new data
        existingData[index] = { ...existingData[index], ...updatedData };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'NCR form updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE an NCR form by ncrFormNo
router.delete('/:ncrFormNo', (req, res) => {
    const ncrFormNo = req.params.ncrFormNo; // Get ncrFormNo from the route parameters

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.ncrFormNo !== ncrFormNo);

        if (updatedData.length === existingData.length) {
            // No item was removed, so the specified ncrFormNo was not found
            return res.status(404).json({ status: 'error', message: 'NCR form not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'NCR form deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// Export the router
module.exports = router;
