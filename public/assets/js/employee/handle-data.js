document.addEventListener('DOMContentLoaded', function () {
    fetchEmployees();

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("editEmpPassword");
    const eyeIcon = document.getElementById("eyeIcon");

    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        eyeIcon.classList.toggle("bi-eye");
        eyeIcon.classList.toggle("bi-eye-slash");
    });
});

// Function to fetch employees from the server
function fetchEmployees() {
    fetch('/api/employees')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateEmployeeTable(data);
        })
        .catch(error => console.error('Error fetching employees:', error));
}

// Function to populate the employee table
function populateEmployeeTable(data) {
    const tableBody = document.getElementById('employee-list');
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach(employee => {
        const row = document.createElement('tr');
        const empPosition = getPositionDescription(employee.posID); // Fetch position description

        console.log(empPosition);
        row.innerHTML = `
            <td>${employee.empID}</td>
            <td>${employee.empFirst} ${employee.empLast}</td>
            <td>${employee.empEmail}</td>
            <td>${employee.empPhone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</td>
            <td>${empPosition}</td>
            <td class="action-buttons-td">
                <button class="view-btn" onclick="viewEmployee('${employee.empID}')"
                     data-bs-toggle="tooltip" title="View Employee"> <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editEmployee('${employee.empID}')"
                     data-bs-toggle="tooltip" title="Edit Employee"> <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteEmployee('${employee.empID}', '${employee.empFirst} ${employee.empLast}')"
                     data-bs-toggle="tooltip" title="Delete Employee"> <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper function to get position description from position data
function getPositionDescription(posID) {
    const storedPositionData = localStorage.getItem('positions');
    const positionData = storedPositionData ? JSON.parse(storedPositionData) : [];
    const position = positionData.find(position => position.posID === posID);
    return position ? position.posDescription : "Unknown";
}

// Function to view selected employee
function viewEmployee(empID) {

    fetch(`/api/employees/${empID}`)
        .then(response => response.json())
        .then(employee => {
            // Populate modal fields with employee data
            document.getElementById('viewEmpID').innerText = employee.empID;
            document.getElementById('viewEmpFirstName').innerText = employee.empFirst;
            document.getElementById('viewEmpLastName').innerText = employee.empLast;
            document.getElementById('viewEmpEmail').innerText = employee.empEmail;
            document.getElementById('viewEmpPhone').innerText = employee.empPhone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            document.getElementById('viewEmpUsername').innerText = employee.empUsername;

            const viewModal = new bootstrap.Modal(document.getElementById('viewEmployeeModal'));
            viewModal.show();
        })
        .catch(error => console.error('Error fetching employee:', error));
}

// Function to edit selected employee
function editEmployee(empID) {
    fetch(`/api/employees/${empID}`)
        .then(response => response.json())
        .then(employee => {
            // Populate form fields with employee data
            document.getElementById('editEmpID').value = employee.empID;
            document.getElementById('editEmpFirstName').value = employee.empFirst;
            document.getElementById('editEmpLastName').value = employee.empLast;
            document.getElementById('editEmpEmail').value = employee.empEmail;
            document.getElementById('editEmpPhone').value = employee.empPhone;
            document.getElementById('editEmpPosition').value = employee.posID;
            document.getElementById('editEmpUsername').value = employee.empUsername;
            document.getElementById('editEmpPassword').value = employee.empPassword;

            const editModal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
            editModal.show();
        })
        .catch(error => console.error('Error fetching employee for editing:', error));
}

// Save changes event listener
document.getElementById('btnSaveEmployeeChanges').onclick = function () {
    const empID = document.getElementById('editEmpID').value;
    const updatedEmployeeData = {
        empID,
        empFirst: document.getElementById('editEmpFirstName').value,
        empLast: document.getElementById('editEmpLastName').value,
        empEmail: document.getElementById('editEmpEmail').value,
        empPhone: document.getElementById('editEmpPhone').value,
        empUsername: document.getElementById('editEmpUsername').value,
        empPassword: document.getElementById('editEmpPassword').value,
        posID: parseInt(document.getElementById('editEmpPosition').value),
    };

    fetch(`/api/employees/${empID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployeeData),
    })
    .then(response => {
        if (response.ok) {
            fetchEmployees(); // Refresh the employee list
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
            editModal.hide();
        } else {
            console.error('Failed to update employee');
        }
    })
    .catch(error => console.error('Error updating employee:', error));
}

// Function to handle deleting selected employee
function deleteEmployee(empID, empName) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the record: ${empName}?`;

    document.getElementById('btnDeleteYes').onclick = function () {
        fetch(`/api/employees/${empID}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                fetchEmployees(); // Refresh the employee list
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
            } else {
                console.error('Failed to delete employee');
            }
        })
        .catch(error => console.error('Error deleting employee:', error));
    };

    document.getElementById('btnDeleteNo').onclick = function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}
