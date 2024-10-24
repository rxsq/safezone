//When html content is loaded, fire event
document.addEventListener('DOMContentLoaded', function(){ 
    //localStorage.clear(); //Add to reset records

    //retrieve data in localstorage
    const storedSupplierData = localStorage.getItem('suppliers');
    const storedProductData = localStorage.getItem('products');

    if(storedSupplierData != 'null'){
        //if exists then parse it and populate table
        const data = JSON.parse(storedSupplierData) 
        populateSupplierDropDownLists(data);
    }
    else {
        //initially fetch data from json
        fetch('../assets/data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            //store fetched data in local storage
            localStorage.setItem('suppliers', JSON.stringify(data));
            populateSupplierDropDownLists(data);
        })
    }  

    if(storedProductData != 'null'){
        //if exists then parse it and populate table
        const data = JSON.parse(storedProductData) 
        window.products = data;
    }
    else {
        //initially fetch data from json
        fetch('../assets/data/poducts.json')
        .then(response => response.json())
        .then(data => {
            //store fetched data in local storage
            localStorage.setItem('poducts', JSON.stringify(data));
            window.products = data;
        })
    }  
});

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

    // Clear existing options in the dropdown (if needed)
    //supplierDropDown.innerHTML = '';

    // Populate the dropdown with supplier names
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.supID;  // Ensure `supID` exists in the data
        option.textContent = supplier.supName;  // Ensure `supName` exists in the data
        supplierDropDown.appendChild(option);
    });

    supplierDropDown.addEventListener('change', function() {
        const selectedSupplierID = this.value;
        populateProductDropDownLists(window.products, selectedSupplierID)
    })
}

function populateProductDropDownLists(products, selectedSupplierID){
    const productDropDown = document.getElementById('po-prod-no');

    productDropDown.innerHTML = '';

    const filteredProducts = products.filter(product => product.supID == selectedSupplierID)

    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.prodID;
        option.textContent = product.prodName;
        productDropDown.appendChild(option);
    });
}