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
                <button class="delete-btn" onclick="deleteEmployee('${employee.empID}', '${employee.empFirstName} ${employee.empLastName}')">
                    <i class="bi bi-trash"></i>
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
            document.getElementById('viewEmpFirstName').innerText = employee.empFirstName;
            document.getElementById('viewEmpLastName').innerText = employee.empLastName;
            document.getElementById('viewEmpEmail').innerText = employee.empEmail;
            document.getElementById('viewEmpPhone').innerText = employee.empPhone;
            document.getElementById('viewEmpAddress').innerText = employee.empAddress;
            document.getElementById('viewEmpDateHired').innerText = new Date(employee.empDateHired).toLocaleDateString();
            document.getElementById('viewEmpSalary').innerText = employee.empSalary;
            document.getElementById('viewEmpActive').innerText = employee.empActive === "ACTV" ? "Active" : "Inactive";
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
            document.getElementById('editEmpFirstName').value = employee.empFirstName;
            document.getElementById('editEmpLastName').value = employee.empLastName;
            document.getElementById('editEmpEmail').value = employee.empEmail;
            document.getElementById('editEmpSalary').value = employee.empSalary;
            document.getElementById('editEmpPhone').value = employee.empPhone;
            document.getElementById('editEmpAddress').value = employee.empAddress;
            document.getElementById('editEmpDateHired').value = employee.empDateHired.substring(0, 10);
            document.getElementById('editEmpActive').value = employee.empActive;
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
        empFirstName: document.getElementById('editEmpFirstName').value,
        empLastName: document.getElementById('editEmpLastName').value,
        empEmail: document.getElementById('editEmpEmail').value,
        empPhone: document.getElementById('editEmpPhone').value,
        empAddress: document.getElementById('editEmpAddress').value,
        empSalary: document.getElementById('editEmpSalary').value,
        empDateHired: document.getElementById('editEmpDateHired').value,
        empActive: document.getElementById('editEmpActive').value,
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
