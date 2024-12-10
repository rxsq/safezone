var createModal = new bootstrap.Modal(document.getElementById('createSupplierModal'));

document.addEventListener("DOMContentLoaded", () => {
    // Show the modal when clicking the 'new-suppliers-btn'
    document.getElementById('new-suppliers-btn').addEventListener('click', function(event) {
        event.preventDefault();  // Prevent any default behavior if necessary
        createModal.show();  // Show the modal
    });

    // Clear all input fields when the modal is opened
    document.getElementById('createSupplierModal').addEventListener('shown.bs.modal', function() {
        const inputs = document.querySelectorAll('#createSupplierModal input');
        inputs.forEach(input => {
            input.value = '';  // Clear the value of each input field
            input.classList.remove('error');  // Remove any error styles
        });

        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';  // Hide any previous error messages
        }
    });

    // Handle the form submission for saving a new supplier
    document.getElementById('saveSupplierBtn').addEventListener('click', function(event) {
        event.preventDefault();  // Prevent default form submission

        // Validate the form using the existing validation logic
        if (validateInputs()) {
            // Gather form data
            const supplierData = {
                supContactName: document.getElementById('supContactName').value.trim(),
                supContactEmail: document.getElementById('supContactEmail').value.trim(),
                supContactPhone: document.getElementById('supContactPhone').value.trim(),
                supName: document.getElementById('supName').value.trim(),
                supAddress: document.getElementById('supAddress').value.trim(),
                supCity: document.getElementById('supCity').value.trim(),
                supCountry: document.getElementById('supCountry').value.trim(),
            };

            // Send the data to the server
            fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    alert('Supplier saved successfully!');
                    createModal.hide();  // Close the modal
                } else {
                    alert('Failed to save supplier.');
                }
            })
            .catch(error => {
                console.error('Error saving supplier:', error);
                alert('Error saving supplier.');
            });
        } else {
            console.log("Form validation failed");
        }
    });

    // Function to validate inputs (same as your existing validation logic)
    function validateInputs() {
        const errorMessage = document.getElementById('error-message'); // The container for the general error message
        const errorList = []; // Reset error list
        let isValid = true; // Flag to track form validity
        let isAnyFieldEmpty = false; // To track if any required field is empty

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
                isAnyFieldEmpty = true; // Mark that at least one required field is empty
                input?.classList.add('error'); // Highlight invalid field
            } else {
                input?.classList.remove('error'); // Remove highlight if valid
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
            errorMessage.style.display = 'block';
        }

        return isValid;
    }
});

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
}
