const filterBtn = document.getElementById('filter-btn');
const resetBtn = document.getElementById('reset-filter-btn');

const supplierSelect = document.getElementById('supplier-name');
const productSelect = document.getElementById('po-prod-no');
const statusSelect = document.getElementById('status');
const issueDatePicker = document.getElementById('filterIssueDate');

// Event listener for filter button
// filterBtn.addEventListener('click', function(){
    
// });

// //Event listener for reset button
// resetBtn.addEventListener('click', function(){
//     supplierSelect.value = "-1";
    
//     resetProductSelect();

//     statusSelect.value = "active";
//     issueDatePicker.value = "";
// });

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
        //if(openRecords === 5) break;

        let ncr = data[i];

        const row = document.createElement('tr'); 

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
                <button class="edit-btn" onclick="viewNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View NCR">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="archiveNCR('${ncr.ncrFormID}', '${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                    <i class="bi bi-archive"></i>
                </button>
                <button class="bi bi-file-earmark-pdf" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Viewing NCR's
function viewNCR(ncrFormID){
    const mode = 'view';
    sessionStorage.setItem("mode", "view");
    window.location.href = `non-conformance-report.html?ncrFormID=${ncrFormID}`;
}

// Editing NCR's
function editNCR(ncrFormID){
    const mode = 'edit'
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
    populateNCRInputs(ncrFormID);
}

// Printing NCR to PDF
function printNCR(ncrFormID) {
    const isConfirmed = confirm('Are you sure you want to generate and print the NCR report?');
    if (!isConfirmed) return;

    console.log(`Fetching NCR form with ID: ${ncrFormID}`);

    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            console.log('Received response for NCR form:', response);
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(ncrData => {
            console.log('NCR data received:', ncrData);
            if (!ncrData || typeof ncrData !== 'object') throw new Error('Invalid NCR data received');

            // Fetch related data
            const productFetch = fetch(`/api/products/${ncrData.prodID}`).then(res => res.json()); // Fetch product details
            const qualityFetch = fetch(`/api/qualityForms/${ncrData.qualFormID}`).then(res => res.json()); // Fetch quality form data
            const engineeringFetch = ncrData.engFormID ? fetch(`/api/engineerForms/${ncrData.engFormID}`).then(res => res.json()) : Promise.resolve(null); // Fetch engineering data if available
            const purchasingFetch = ncrData.purFormID ? fetch(`/api/purchasingForms/${ncrData.purFormID}`).then(res => res.json()) : Promise.resolve(null);  // Fetch purchasing data if available

            return Promise.all([ncrData, productFetch, qualityFetch, engineeringFetch, purchasingFetch]);
        })
        .then(([ncrData, productData, qualityData, engineeringData, purchasingData]) => {
            console.log('All data fetched:', { ncrData, productData, qualityData, engineeringData, purchasingData });

            // Use `supID` from `productData` to fetch supplier data
            return Promise.all([
                Promise.resolve(ncrData),
                Promise.resolve(productData),
                fetch(`/api/suppliers/${productData.supID}`).then(res => res.json()), // Fetch supplier data
                Promise.resolve(qualityData),
                Promise.resolve(engineeringData),
                Promise.resolve(purchasingData),
            ]);
        })
        .then(([ncrData, productData, supplierData, qualityData, engineeringData, purchasingData]) => {
            console.log('Supplier data fetched:', supplierData);
            
            const pdfData = {
                ncrData,
                productData,
                supplierData,
                qualityData,
                engineeringData,
                purchasingData,
            };

            console.log('Sending data to generate PDF:', pdfData);

            return fetch('/api/ncrPdfRoute/generate-ncr-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData),
            });
        })
        .then(response => {
            console.log('Received response for PDF generation:', response);
            if (!response.ok) throw new Error('Failed to generate PDF');
            return response.blob();
        })
        .then(blob => {
            console.log('Received PDF blob');
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'NCR_Report.pdf';
            downloadLink.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error generating the NCR report. Please try again.');
        });
}


// Archive NCR 
function archiveNCR(ncrFormID, ncrFormNo) {
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(data => {
            const { engFormID, purFormID, ncrStage } = data;

            if (ncrStage === 'ARC') {
                alert('This NCR form is already archived.');
                return;
            }

            // Check for incomplete fields
            const incompleteFields = [];
            if (!engFormID) incompleteFields.push('Engineering Form');
            //if (!purFormID) incompleteFields.push('Purchasing Form');

            let confirmationMessage = `Are you sure you want to archive this NCR form?`;
            if (incompleteFields.length > 0) {
                confirmationMessage += `\nThe following form(s) are not completed: ${incompleteFields.join(', ')}.`;
            }

            // Ask for confirmation
            if (!confirm(confirmationMessage)) {
                return;
            }

            // Proceed to archive the form
            fetch(`/api/ncrForms/${ncrFormNo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    ncrStage: 'ARC',
                    ncrStatusID: 2, 
                }),
            })
                .then(response => {
                    if (response.ok) {
                        alert('NCR form archived successfully!');
                        window.location.reload(); // Refresh the page
                    } else {
                        return response.json().then(error => {
                            throw new Error(error.message || 'Failed to archive NCR form');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error archiving NCR form:', error);
                    alert(`Error: ${error.message}`);
                });
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert(`Error: ${error.message}`);
        });
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
