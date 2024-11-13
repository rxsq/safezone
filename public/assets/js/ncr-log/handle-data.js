const filterBtn = document.getElementById('filter-btn');
const resetBtn = document.getElementById('reset-filter-btn');

const supplierSelect = document.getElementById('supplier-name');
const productSelect = document.getElementById('po-prod-no');
const statusSelect = document.getElementById('status');
const issueDatePicker = document.getElementById('filterIssueDate');

// Event listener for filter button
filterBtn.addEventListener('click', function(){
    
});

//Event listener for reset button
resetBtn.addEventListener('click', function(){
    supplierSelect.value = "-1";
    
    resetProductSelect();

    statusSelect.value = "active";
    issueDatePicker.value = "";
});

function resetProductSelect(){
    while (productSelect.options.length) {
        productSelect.remove(0);
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = "-1";  
    defaultOption.textContent = "Select a Product";  
    defaultOption.selected = true; 
    //defaultOption.disabled = true;   

    productSelect.appendChild(defaultOption);

}

//bootstrap tooltip 
function tooltip() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function fetchNcrForms() {
    fetch('/api/ncrForms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            //console.log(data);
            populateRecentNcrTable(data);
            updateMetrics(data);
            renderBarChart(data); // Render chart with the fetched data
            tooltip();

        })
        .catch(error => console.error('Error fetching NCR forms:', error));

}

function updateMetrics(data) {
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID == "OPEN").length;
    const inactive = data.filter(ncr => ncr.ncrStatusID == "CLSD").length;

    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;

};

// Function to populate recent NCR table with data
async function populateRecentNcrTable(data){
    // Get tablebody element & clear innerHTML
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = '';

    let openRecords = 0; 

    // Loop which iterates over all items in data array
    for(let i = 0; i < data.length; i ++){
        // If 5 open records are showing, then break out of loop
        if(openRecords === 5) break;

        let ncr = data[i];

        const row = document.createElement('tr'); // Create new row element to be used in the table

        let ncrStatus;
        // If status is open, incriment openRecords
        if(ncr.ncrStatusID === 1){
            ncrStatus = "Open";
            openRecords++;
        } else continue;

        // Fetch supplier name 
        const productResponse = await fetch(`/api/products/${ncr.prodID}`);
        const productData = await productResponse.json();

        const supplierResponse = await fetch(`/api/suppliers/${productData.supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName;

        // Generating table row
        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${supplierName}</td>
            <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
            <td>${ncrStatus}</td>
            <td class="action-buttons-td">
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View/Edit NCR">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="archiveNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                    <i class="bi bi-archive"></i>
                </button>
                <button class="bi bi-file-earmark-pdf" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Editing & Viewing NCR's
function editNCR(ncrFormID){

}

// Printing NCR to PDF
function printNCR(ncrFormID){

}

// Archive NCR 
function archiveNCR(ncrFormID){

}

function populateSupplierDropDownLists(suppliers) {
    const supplierDropDown = document.getElementById('editSupplier');

    if (!supplierDropDown) {
        console.error('Dropdown element not found on the page');
        return;
    }

    if (!Array.isArray(suppliers)) {
        console.error('Suppliers is not an array:', suppliers);
        return;
    }

    supplierDropDown.innerHTML = '';

    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.supID;
        option.textContent = supplier.supName;
        supplierDropDown.appendChild(option);
    });

    supplierDropDown.addEventListener('change', function () {
        const selectedSupplierID = this.value;
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                populateProductDropDownLists(products, selectedSupplierID);
            });
    });
}


function populateProductDropDownLists(products, selectedSupplierID) {
    const productDropDown = document.getElementById('editProduct');
    productDropDown.innerHTML = '';

    const filteredProducts = products.filter(product => product.supID == selectedSupplierID);

    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.prodID;
        option.textContent = product.prodName;
        productDropDown.appendChild(option);
    });
}

fetchNcrForms();
