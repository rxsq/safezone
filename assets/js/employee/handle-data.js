document.addEventListener('DOMContentLoaded', function(){
    //localStorage.clear(); //Add to reset records
    const storedEmployeeData = localStorage.getItem('employees')
    const storedPositionData = localStorage.getItem('positions');

    if (!storedPositionData) {
        fetch('../assets/data/positions.json') 
            .then(response => response.json())
            .then(positionData => {
                localStorage.setItem('positions', JSON.stringify(positionData));
                loadEmployees(positionData);
            });
    } else {
        const positionData = JSON.parse(storedPositionData);
        loadEmployees(positionData);
    }

    function loadEmployees(positionData){
        if (storedEmployeeData) {
            const employeeData = JSON.parse(storedEmployeeData);
            populateEmployeeTable(employeeData, positionData);
        } else {
            fetch('../assets/data/employees.json') // Correct the path as needed
                .then(response => response.json())
                .then(employeeData => {
                    localStorage.setItem('employees', JSON.stringify(employeeData));
                    populateEmployeeTable(employeeData, positionData);
                });
        }
    }
});

function populateEmployeeTable(employeeData, positionData){
    const tableBody = document.getElementById('employee-list');

    //clear existing rows
    tableBody.innerHTML = "";

    function getPositionDescription(posID) {
        const position = positionData.find(position => position.posID === posID);
        console.log(position);
        return position ? position.posDescription : "Unknown";
    }

    employeeData.forEach(employee => {
        const row = document.createElement('tr');

        const empPosition = getPositionDescription(employee.posID);

        row.innerHTML = `
            <td>${employee.empID}</td>
            <td>${employee.empFirstName} ${employee.empLastName}</td>
            <td>${employee.empEmail}</td>
            <td>${employee.empAddress}</td>
            <td>${employee.empPhone}</td>
            <td>${empPosition}</td>
            <td class="action-buttons-td">
                <button class="view-btn" onclick="viewEmployee('${employee.empID}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editEmployee('${employee.empID}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteEmployee('${employee.empID}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    })
}

function viewEmployee(empID) {
    const storedData = localStorage.getItem('employees');
    if (storedData) {
        const employees = JSON.parse(storedData);
        const employeeToView = employees.find(emp => emp.empID == empID);

        // Populate modal fields with data 
        document.getElementById('viewEmpID').innerText = employeeToView.empID;
        document.getElementById('viewEmpFirstName').innerText = employeeToView.empFirstName;
        document.getElementById('viewEmpLastName').innerText = employeeToView.empLastName;
        document.getElementById('viewEmpEmail').innerText = employeeToView.empEmail;
        document.getElementById('viewEmpDateHired').innerText = new Date(employeeToView.empDateHired).toLocaleDateString();
        document.getElementById('viewEmpSalary').innerText = employeeToView.empSalary;
        document.getElementById('viewEmpPhone').innerText = employeeToView.empPhone;
        document.getElementById('viewEmpAddress').innerText = employeeToView.empAddress;
        document.getElementById('viewEmpActive').innerText = employeeToView.empActive === 'Y' ? 'Active' : 'Inactive';
        document.getElementById('viewEmpUsername').innerText = employeeToView.empUsername;

        console.log(employeeToView);

        // Display modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewEmployeeModal'));
        viewModal.show();
    }
}

// Function to handle editing selected employee
function editEmployee(empID) {
    const storedData = localStorage.getItem('employees');
    if (storedData) {
        const employees = JSON.parse(storedData);
        const employeeToEdit = employees.find(emp => emp.empID == empID);

        // Populate form fields with selected record's data
        document.getElementById('editEmpID').value = employeeToEdit.empID;
        document.getElementById('editEmpFirstName').value = employeeToEdit.empFirstName;
        document.getElementById('editEmpLastName').value = employeeToEdit.empLastName;
        document.getElementById('editEmpEmail').value = employeeToEdit.empEmail;
        document.getElementById('editEmpDateHired').value = employeeToEdit.empDateHired.substring(0, 10); // For date input
        document.getElementById('editEmpSalary').value = employeeToEdit.empSalary;
        document.getElementById('editEmpPhone').value = employeeToEdit.empPhone;
        document.getElementById('editEmpAddress').value = employeeToEdit.empAddress;
        document.getElementById('editEmpActive').value = employeeToEdit.empActive;
        document.getElementById('editEmpUsername').value = employeeToEdit.empUsername;
        document.getElementById('editEmpPassword').value = employeeToEdit.empPassword;
        document.getElementById('editEmpPosition').value = employeeToEdit.posID;
        
        // Display modal
        const editModal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
        editModal.show();

        document.getElementById('togglePassword').addEventListener('click', function () {
            const passwordInput = document.getElementById('editEmpPassword');
            const eyeIcon = document.getElementById('eyeIcon');
        
            // Toggle the type attribute
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('bi-eye');
                eyeIcon.classList.add('bi-eye-slash'); // Change to eye-slash icon
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('bi-eye-slash');
                eyeIcon.classList.add('bi-eye'); // Change back to eye icon
            }
        });

    }
}

// Save changes event listener attached to edit modal
document.getElementById('btnSaveEmployeeChanges').onclick = function() {
    const empID = document.getElementById('editEmpID').value;
    const updatedFirstName = document.getElementById('editEmpFirstName').value;
    const updatedLastName = document.getElementById('editEmpLastName').value;
    const updatedEmail = document.getElementById('editEmpEmail').value;
    const updatedDateHired = document.getElementById('editEmpDateHired').value;
    const updatedSalary = document.getElementById('editEmpSalary').value;
    const updatedPhone = document.getElementById('editEmpPhone').value;
    const updatedAddress = document.getElementById('editEmpAddress').value;
    const updatedActive = document.getElementById('editEmpActive').value;
    const updatedUsername = document.getElementById('editEmpUsername').value;
    const updatedPassword = document.getElementById('editEmpPassword').value;
    const updatedPosition = parseInt(document.getElementById('editEmpPosition').value);

    const storedData = localStorage.getItem('employees');
    if (storedData) {
        const employees = JSON.parse(storedData);
        
        // Find index of employee to update
        const index = employees.findIndex(emp => emp.empID == empID);
        if (index != -1) {
            // Update record
            employees[index] = {
                empID,
                empFirstName: updatedFirstName,
                empLastName: updatedLastName,
                empEmail: updatedEmail,
                empDateHired: updatedDateHired,
                empSalary: updatedSalary,
                empPhone: updatedPhone,
                empAddress: updatedAddress,
                empActive: updatedActive,
                empUsername: updatedUsername,
                empPassword: updatedPassword,
                posID: updatedPosition
            };

            // Save updated data into local storage
            localStorage.setItem('employees', JSON.stringify(employees));

            // Ensure to fetch positionData if needed
            const positionData = JSON.parse(localStorage.getItem('positions'));
            console.log(positionData);
            console.log(employees);
            populateEmployeeTable(employees, positionData); // Pass position data here
        }
    }

    // Close the modal and call update table
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
    if (editModal) {
        editModal.hide();
        
    }

    //handle updating sidebar

};

// Function to handle deleting an employee
function deleteEmployee(empID) {
    // Show confirmation message in modal
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete this employee?\nID:${empID}`;

    // Event listener for yes button
    document.getElementById('btnDeleteYes').onclick = function() {
        removeEmployee(empID);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    document.getElementById('btnDeleteNo').onclick = function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Function to remove employee from local storage
function removeEmployee(empID) {
    const storedData = localStorage.getItem('employees');
    if (storedData) {
        const employees = JSON.parse(storedData);

        const updatedEmployees = employees.filter(emp => emp.empID != empID);

        localStorage.setItem('employees', JSON.stringify(updatedEmployees));

        // Refresh table or update display
        populateEmployeeTable(updatedEmployees);
    }
}