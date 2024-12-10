document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('employee-form');
    const errorMessage = document.getElementById('error-message'); 

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); 
        if (await createEmployee()) {
            console.log('Employee created successfully!');
        } else {
            console.log('Validation failed or error occurred.');
        }
    });

    // Function to create employee
    async function createEmployee() {
        errorMessage.innerHTML = ''; 
        clearFieldHighlights();

        if (!validateInputs()) {
            errorMessage.style.display = 'block';  
            return false;  
        }

        const employeeData = {
            firstName: document.getElementById('empFirstName').value.trim(),
            lastName: document.getElementById('empLastName').value.trim(),
            email: document.getElementById('empEmail').value.trim(),
            phone: document.getElementById('empPhone').value.trim(),
            username: document.getElementById('empUsername').value.trim(),
            password: document.getElementById('empPassword').value.trim(),
            position: document.getElementById('position').value.trim(),
        };

        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert('Employee created successfully!');
            window.location.href = "employee.html"; 
            return true;
        } catch (error) {
            console.error('Error creating employee:', error);
            alert('Failed to create employee. Please try again.');
            return false;
        }
    }

    // Function to validate inputs
    function validateInputs() {
        const errorList = []; 
        let isValid = true; 
        let isAnyFieldEmpty = false; 

        const fields = [
            { id: 'empFirstName', name: 'First Name' },
            { id: 'empLastName', name: 'Last Name' },
            { id: 'empEmail', name: 'Email' },
            { id: 'empPhone', name: 'Phone' },
            { id: 'empUsername', name: 'Username' },
            { id: 'empPassword', name: 'Password' },
            { id: 'position', name: 'Position' }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input?.value.trim();

            if (!value) {
                isValid = false;
                isAnyFieldEmpty = true; 
                input?.classList.add('error'); 
            } else {
                input?.classList.remove('error');
            }
        });

        // Additional validation for email and phone
        const emailInput = document.getElementById('empEmail');
        const emailValue = emailInput?.value.trim();
        if (emailValue && !validateEmail(emailValue)) {
            isValid = false;
            emailInput?.classList.add('error');
            errorList.push('Please enter a valid email format.');
        }

        const phoneInput = document.getElementById('empPhone');
        const phoneValue = phoneInput?.value.trim();
        if (phoneValue && !validatePhone(phoneValue)) {
            isValid = false;
            phoneInput?.classList.add('error');
            errorList.push('Please enter a valid phone number format.');
        }

        // If any required field is empty, show the general message
        if (isAnyFieldEmpty) {
            errorList.unshift('Please fill out all highlighted fields.');
        }

        // If there are any errors, display them
        if (errorList.length > 0) {
            errorMessage.innerHTML = '<ul>' + errorList.map(error => `<li>${error}</li>`).join('') + '</ul>';
        }

        return isValid;
    }

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function validatePhone(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone);
    }

    // Clear field highlights
    function clearFieldHighlights() {
        const fields = document.querySelectorAll('.error');
        fields.forEach(field => {
            field.classList.remove('error');
        });
    }

    // Real-time input validation for Email
    document.getElementById("empEmail").addEventListener("input", function() {
        const emailInput = this;
        const emailValue = emailInput.value.trim();

        // If email is valid, remove error class, else add error class
        if (emailValue) {
            if (validateEmail(emailValue)) {
                emailInput.classList.remove("error");
            } else {
                emailInput.classList.add("error");
            }
        } else {
            emailInput.classList.remove("error");
        }
    });

    // Real-time input validation for Phone
    document.getElementById("empPhone").addEventListener("input", function() {
        const phoneInput = this;
        const phoneValue = phoneInput.value.trim();

        // If phone is valid, remove error class, else add error class
        if (phoneValue) {
            if (validatePhone(phoneValue)) {
                phoneInput.classList.remove("error");
            } else {
                phoneInput.classList.add("error");
            }
        } else {
            phoneInput.classList.remove("error");
        }
    });

    // Remove error class on real-time input for other fields
    document.getElementById("empFirstName").addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    document.getElementById("empLastName").addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    document.getElementById("empUsername").addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    document.getElementById("empPassword").addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    document.getElementById("position").addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });
});
