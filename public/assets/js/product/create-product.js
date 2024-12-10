let errorList;

function validateInputs(event) {
    event.preventDefault();

    errorList = [];

    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const supplier = document.getElementById('supplier-name').value;

    // Clear previous error highlights
    clearErrorHighlights();

    let isValid = true;

    // Check if any fields are empty
    if (!name || !category || !supplier) {
        errorList.push('Please fill out all fields.');

        // Highlight the invalid fields
        if (!name) {
            document.getElementById('product-name').classList.add('error');
        }
        if (!category) {
            document.getElementById('product-category').classList.add('error');
        }
        if (!supplier) {
            document.getElementById('supplier-name').classList.add('error');
        }
        isValid = false;
    }

    if (isValid) {
        // Proceed with product creation
        createProduct();
    } else {
        // Display the error messages
        document.getElementById('error-message').innerHTML = `<ul>${errorList.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
}

function clearErrorHighlights() {
    // Remove error class from all input fields
    document.getElementById('product-name').classList.remove('error');
    document.getElementById('product-category').classList.remove('error');
    document.getElementById('supplier-name').classList.remove('error');
}

async function createProduct() {
    const productName = document.getElementById('product-name').value.trim();
    const productCategory = document.getElementById('product-category').value.trim();
    const supplierId = document.getElementById('supplier-name').value;

    const API_URL = '/api/products'; 

    // Basic validation
    if (!productName || !productCategory || !supplierId) {
        // Display error message if fields are empty
        showErrorMessage('Please fill out all fields.');
        return;
    }

    const productData = {
        prodName: productName,   
        prodCategory: productCategory, 
        supID: parseInt(supplierId, 10),
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to create product');
        }

        alert('success creating product');
        window.location.href='product.html';
        
    } catch (error) {
        showErrorMessage('There was an error creating the product. Please try again.');
    }
}

function showErrorMessage(message) {
    document.getElementById('error-message').innerHTML = `<ul><li>${message}</li></ul>`;
}

// Set up event listener for the submit button
document.getElementById('btnSubmit').addEventListener('click', validateInputs);

document.getElementById('product-name').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('product-category').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById('supplier-name').addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});