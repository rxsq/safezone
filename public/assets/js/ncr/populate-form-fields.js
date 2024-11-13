// DOMContentLoaded EventListener
document.addEventListener('DOMContentLoaded', function(){ 
    // Retrieve and populate suppliers
    fetch('../assets/data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            populateSupplierDropDownLists(data);
        })
        .catch(error => console.error('Failed to load suppliers:', error));

    // Retrieve and store products globally for dropdown population
    fetch('../assets/data/products.json')
        .then(response => response.json())
        .then(data => {
            window.products = data; // store products data in a global variable
        })
        .catch(error => console.error('Failed to load products:', error));
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
        option.value = supplier.supID;  // Ensure `supID` exists in the data
        option.textContent = supplier.supName;  // Ensure `supName` exists in the data
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
