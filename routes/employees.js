const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/employees.json');

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
    return(req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page -1) * limit;
        const endIndex = page * limit;

        const results = {};

        if(endIndex < model.lengt){
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if(startIndex > 0){
            results.previous = {
                page: page -1,
                limit: limit
            }
        }

        results.results = model.slice(startIndex, endIndex);

        res.paginatedResults = results;
        next();
    }
}

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

// GET an employee by empID
router.get('/:empID', (req, res) => {
    const value = Number(req.params.empID); 

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Employee ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const employee = existingData.find(item => item.empID === value); // Compare as a number

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new employee
router.post('/', (req, res) => {
    const newData = req.body;
    try {
        const existingData = readJsonFile(filename);

        // Determine the next empID
        const nextEmpID = existingData.length > 0 ? Math.max(...existingData.map(emp => emp.empID)) + 1 : 1;

        // Create new employee object with empID
        const newEmployee = {
            empID: nextEmpID,
            empFirst: newData.empFirst,
            empLast: newData.empLast,
            empEmail: newData.empEmail,
            empPhone: newData.empPhone,
            empUsername: newData.empUsername,
            empPassword: newData.empPassword,
            posID: Number(newData.posID) 
        };

        existingData.push(newEmployee);
        writeJsonFile(filename, existingData);
        res.status(201).json({ status: 'success', message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// PUT (update) an employee by empID
router.put('/:empID', (req, res) => {
    const empID = Number(req.params.empID); 
    const updatedData = req.body;

    if (isNaN(empID)) {
        return res.status(400).json({ status: 'error', message: 'Employee ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const employeeIndex = existingData.findIndex(item => item.empID === empID);

        if (employeeIndex === -1) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        existingData[employeeIndex] = {
            empID, 
            empFirst: updatedData.empFirst || existingData[employeeIndex].empFirst,
            empLast: updatedData.empLast || existingData[employeeIndex].empLast,
            empEmail: updatedData.empEmail || existingData[employeeIndex].empEmail,
            empPhone: updatedData.empPhone || existingData[employeeIndex].empPhone,
            empUsername: updatedData.empUsername || existingData[employeeIndex].empUsername,
            empPassword: updatedData.empPassword || existingData[employeeIndex].empPassword,
            posID: Number(updatedData.posID) || existingData[employeeIndex].posID,
        };

        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Employee updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE an employee by empID
router.delete('/:empID', (req, res) => {
    const value = req.params.empID;

    if (!value) {
        return res.status(400).json({ status: 'error', message: 'Employee ID not provided' });
    }

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.empID !== Number(value)); 
        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// Export the router
module.exports = router;