document.addEventListener('DOMContentLoaded', function(){ 
    // Retrieve and populate suppliers
    fetch('../assets/data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            populateSupplierDropDownLists(data);
        })
        .catch(error => console.error('Failed to load suppliers:', error));

    // Retrieve and store products globally for dropdown population
});

// Function to populate DropDownLists based on supplier data
function populateSupplierDropDownLists(suppliers) {
    const supplierDropDown = document.getElementById('supplier-name');

    // Check if the supplierDropDown exists before trying to populate it
    if (!supplierDropDown) {
        console.error('Dropdown element not found on the page');
        return;
    }

    // Ensure suppliers is an array before attempting to iterate
    if (!Array.isArray(suppliers)) {
        console.error('Suppliers is not an array:', suppliers);
        return;
    }

    // Populate the dropdown with supplier names
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.supID;  
        option.textContent = supplier.supName;  
        supplierDropDown.appendChild(option);
    });

    // Event listener to populate products dropdown based on selected supplier
    supplierDropDown.addEventListener('change', function() {
        const selectedSupplierID = this.value;
        populateProductDropDownLists(window.products, selectedSupplierID);
    });
}

// Function to populate DropDownLists based on product data
function populateProductDropDownLists(products, selectedSupplierID) {
    console.log(products, selectedSupplierID);

    const productDropDown = document.getElementById('po-prod-no');

    // Clear existing options in the product dropdown
    productDropDown.innerHTML = '';

    // Filter products based on the selected supplier ID
    const filteredProducts = products.filter(product => product.supID == selectedSupplierID);

    // Populate the product dropdown with filtered products
    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.prodID;
        option.textContent = product.prodName;
        productDropDown.appendChild(option);
    });
}

// Manually setting the supplier ID and triggering the change event
function setSupplierAndTriggerChange(supplierID) {

    const supplierDropDown = document.getElementById('supplier-name');
    
    // Add the event listener before triggering the event
    supplierDropDown.addEventListener('change', function() {
        populateProductDropDownLists(window.products, supplierID);
    });

    // Set the value programmatically
    supplierDropDown.value = supplierID;

    // Manually trigger the change event
    const changeEvent = new Event('change');
    supplierDropDown.dispatchEvent(changeEvent);  // Trigger the change event to update the products dropdown
}
