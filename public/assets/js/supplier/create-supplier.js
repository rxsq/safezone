document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('supplier-form');
    const errorMessage = document.getElementById('error-message'); 

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); 
        console.log('Form submitted!');
        if (await createSupplier()) {
            console.log('Supplier created successfully!');
        } else {
            console.log('Validation failed or error occurred.');
        }
    });

    async function createSupplier() {
        // Clear previous error messages and reset field highlights
        errorMessage.innerHTML = '';  
        clearFieldHighlights();

        if (!validateInputs()) {
            errorMessage.style.display = 'block';  
            return false;  
        }

        const supplierData = {
            supContactName: document.getElementById('supContactName').value.trim(),
            supContactEmail: document.getElementById('supContactEmail').value.trim(),
            supContactPhone: document.getElementById('supContactPhone').value.trim(),
            supName: document.getElementById('supName').value.trim(),
            supAddress: document.getElementById('supAddress').value.trim(),
            supCity: document.getElementById('supCity').value.trim(),
            supCountry: document.getElementById('supCountry').value.trim(),
        };

        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert('Supplier created successfully!');
            window.location.href = "supplier.html"; 
            return true;
        } catch (error) {
            console.error('Error creating supplier:', error);
            alert('Failed to create supplier. Please try again.');
            return false;
        }
    }

    function validateInputs() {
        const errorList = []; 
        let isValid = true; 
        let isAnyFieldEmpty = false; 

        const fields = [
            { id: 'supContactName', name: 'Contact Name' },
            { id: 'supContactEmail', name: 'Contact Email' },
            { id: 'supContactPhone', name: 'Contact Phone' },
            { id: 'supName', name: 'Supplier Name' },
            { id: 'supAddress', name: 'Address' },
            { id: 'supCity', name: 'City' },
            { id: 'supCountry', name: 'Country' },
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
        const emailInput = document.getElementById('supContactEmail');
        const emailValue = emailInput?.value.trim();
        if (emailValue && !validateEmail(emailValue)) {
            isValid = false;
            emailInput?.classList.add('error');
            errorList.push('Please enter a valid email format.');
        }

        const phoneInput = document.getElementById('supContactPhone');
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

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone);
    }

    function clearFieldHighlights() {
        const fields = document.querySelectorAll('.error');
        fields.forEach(field => {
            field.classList.remove('error');
        });
    }
});

document.getElementById('supName').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('supContactEmail').addEventListener("input", function() {
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

document.getElementById('supContactPhone').addEventListener("input", function() {
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

document.getElementById('supAddress').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('supCity').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('supCountry').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('supContactName').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});
