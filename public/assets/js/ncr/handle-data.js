// const filterBtn = document.getElementById('filter-btn');
// const resetBtn = document.getElementById('reset-filter-btn');

const supplierSelect = document.getElementById('supplier-name');
const productSelect = document.getElementById('po-prod-no');
const statusSelect = document.getElementById('status');
const issueDatePicker = document.getElementById('filterIssueDate');

//Event listener for filter button
// filterBtn.addEventListener('click', function(){
    
// });

//Event listener for reset button
// resetBtn.addEventListener('click', function(){
//     supplierSelect.value = "-1";
    
//     resetProductSelect();

//     statusSelect.value = "active";
//     issueDatePicker.value = "";
// });

// function resetProductSelect(){
//     while (productSelect.options.length) {
//         productSelect.remove(0);
//     }

//     const defaultOption = document.createElement('option');
//     defaultOption.value = "-1";  
//     defaultOption.textContent = "Select a Product";  
//     defaultOption.selected = true; 
//     //defaultOption.disabled = true;   

//     productSelect.appendChild(defaultOption);

// }

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
            renderSupplierChart(data);
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

function groupByIssueDate(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        const issueDate = ncr.ncrIssueDate.substring(0, 10); // Format: YYYY-MM-DD
        dateCounts[issueDate] = (dateCounts[issueDate] || 0) + 1;
    });

    return dateCounts;
}

function groupByYearMonth(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        // Extract "YYYY-MM" from "YYYY-MM-DD" format
        const issueYearMonth = ncr.ncrIssueDate.substring(0, 7); // e.g., "2024-11"
        dateCounts[issueYearMonth] = (dateCounts[issueYearMonth] || 0) + 1;
    });

    return dateCounts;
}

function renderBarChart(data) {
    const ctx = document.getElementById('issueDateChart').getContext('2d');

    // Get the grouped data by year-month
    const dateCounts = groupByYearMonth(data);
    const labels = Object.keys(dateCounts);
    const values = Object.values(dateCounts);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "NCR's per Year-Month",
                data: values,
                backgroundColor: '#173451',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year-Month',
                    },
                },
                y: {
                    beginAtZero: true, // Ensure Y-axis starts at 0
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Count NCR forms in whole numbers (0, 1, 2, etc.)
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}

function groupBySupplier(data) {
    const supplierCounts = {};

    // Iterate over each NCR record to count by supplier name
    data.forEach(ncr => {
        const supplier = ncr.ncrSupplierName || 'Unknown'; // Default to 'Unknown' if supplier name is missing
        supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1;
    });

    return supplierCounts; // Returns an object like { "Supplier Name 1": count, "Supplier Name 2": count, ... }
}

function renderSupplierChart(data) {
    const ctx = document.getElementById('supplierChart').getContext('2d');

    // Group NCRs by supplier name using groupBySupplier function
    const supplierCounts = groupBySupplier(data);
    const labels = Object.keys(supplierCounts); // Supplier names
    const values = Object.values(supplierCounts); // NCR counts per supplier

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "NCR's per Supplier",
                data: values,
                backgroundColor: '#173451',
                borderColor: 'rgba(255, 171, 0, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Supplier Name',
                    },
                    ticks: {
                        autoSkip: false, // Display all supplier names on the x-axis
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Use whole numbers for NCR count
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}


// Function to populate recent NCR table with data
function populateRecentNcrTable(data) {
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = '';

    let openRecords = 0;

    for(let i = 0; i< data.length; i++){

        if(openRecords === 5){
            break;
        }

        let ncr = data[i];

        const row = document.createElement('tr');

        const status = ncr.ncrStatusID;
        let ncrStatus;

        if (status === "OPEN") {
            ncrStatus = "Open";
            openRecords++;
        }
        else {
            ncrStatus = "Closed";
            continue;
        }

        // <td>${ncr.ncrDocumentNo}</td>
        // <td>${ncr.ncrDefectDesc}</td>
        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${ncr.ncrSupplierName}</td>
            <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
            <td>${ncrStatus}</td>
            <td class="action-buttons-td">
                <button class="view-btn" data-bs-toggle="tooltip" title="View NCR" onclick="viewNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                    <i class="bi bi-archive"></i>
                </button>
                <button class="bi bi-file-earmark-pdf" onclick=printNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

function viewNCR(ncrFormNo, ncrString) {
    const ncr = JSON.parse(decodeURIComponent(ncrString));

    // Display NCR details in the modal
    document.getElementById('viewFormNo').innerText = ncr.ncrFormNo;
    document.getElementById('viewDocumentNo').innerText = ncr.ncrDocumentNo;
    document.getElementById('viewDescription').innerText = ncr.ncrDescription;
    document.getElementById('viewIssueDate').innerText = new Date(ncr.ncrIssueDate);
    document.getElementById('viewImageFileName').innerText = ncr.ncrImageFileName;
    document.getElementById('viewSalesOrderNo').innerText = ncr.ncrSalesOrderNo;
    document.getElementById('viewQtyReceived').innerText = ncr.ncrQtyRecieved;
    document.getElementById('viewQtyDefective').innerText = ncr.ncrQtyDefective;
    document.getElementById('viewDefectDesc').innerText = ncr.ncrDefectDesc;
    document.getElementById('viewStatusID').innerText = ncr.ncrStatusID;
    document.getElementById('viewSupplierName').innerText = ncr.ncrSupplierName;

    // Fetch the product name based on prodID
    fetch(`/api/products/${ncr.prodID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(product => {
            // Display the product name in the modal
            document.getElementById('viewProdID').innerText = product ? product.prodName : 'Unknown Product';
        })
        .catch(error => console.error('Error fetching product details:', error));

    const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
    viewModal.show();
}

function editNCR(ncrFormNo, ncrString) {
    const ncr = JSON.parse(decodeURIComponent(ncrString));
    document.getElementById('editFormNo').value = ncr.ncrFormNo;
    document.getElementById('editDocumentNo').value = ncr.ncrDocumentNo;
    document.getElementById('editDescription').value = ncr.ncrDescription;
    document.getElementById('editIssueDate').value = ncr.ncrIssueDate.substring(0, 16);
    document.getElementById('editImageFileName').value = ncr.ncrImageFileName;
    document.getElementById('editSalesOrderNo').value = ncr.ncrSalesOrderNo;
    document.getElementById('editQtyReceived').value = ncr.ncrQtyRecieved;
    document.getElementById('editQtyDefective').value = ncr.ncrQtyDefective;
    document.getElementById('editDefectDesc').value = ncr.ncrDefectDesc;
    document.getElementById('editStatusID').value = ncr.ncrStatusID;

    // Fetch and populate suppliers and products
    fetch('/api/suppliers')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(suppliers => {
            populateSupplierDropDownLists(suppliers);

            return fetch('/api/products');
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(products => {
            const selectedProduct = products.find(product => product.prodID === ncr.prodID);
            if (selectedProduct) {
                document.getElementById('editProduct').value = selectedProduct.prodID;
                document.getElementById('editSupplier').value = selectedProduct.supID;
                populateProductDropDownLists(products, selectedProduct.supID);
            }
        })
        .catch(error => console.error('Error fetching suppliers or products:', error));

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
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

function deleteNCR(ncrFormNo, ncrString) {
    const ncr = JSON.parse(decodeURIComponent(ncrString));
    document.getElementById('deleteModalBody').textContent = `Are you sure you want to delete NCR No. ${ncr.ncrFormNo}?`;
    document.getElementById('btnDeleteYes').onclick = () => removeNCR(ncr.ncrFormNo);
    document.getElementById('btnDeleteNo').onclick = function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

function removeNCR(ncrFormNo) {
    fetch(`/api/ncrForms/${ncrFormNo}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                fetchNcrForms();
                const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                deleteModal.hide();
            } else {
                console.error('Failed to delete NCR record');
            }
        })
        .catch(error => console.error('Error deleting NCR record:', error));
}

document.getElementById('btnSaveChanges').onclick = function () {
    const ncrFormNo = document.getElementById('editFormNo').value;
    const updatedDocumentNo = document.getElementById('editDocumentNo').value;
    const updatedDescription = document.getElementById('editDescription').value;
    const updatedIssueDate = document.getElementById('editIssueDate').value;
    const updatedImageFileName = document.getElementById('editImageFileName').value;
    const updatedSalesOrderNo = document.getElementById('editSalesOrderNo').value;
    const updatedQtyReceived = document.getElementById('editQtyReceived').value;
    const updatedQtyDefective = document.getElementById('editQtyDefective').value;
    const updatedDefectDesc = document.getElementById('editDefectDesc').value;
    const updatedStatusID = document.getElementById('editStatusID').value;

    // Convert selected supplier and product IDs to numbers
    const selectedSupplierID = parseInt(document.getElementById('editSupplier').value, 10);
    const selectedProductID = parseInt(document.getElementById('editProduct').value, 10); // Get product ID

    fetch('/api/suppliers')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(suppliersData => {
            const selectedSupplier = suppliersData.find(supplier => supplier.supID === selectedSupplierID);
            const updatedSupplierName = selectedSupplier ? selectedSupplier.supName : '';

            const updatedData = {
                ncrFormNo,
                ncrDocumentNo: updatedDocumentNo,
                ncrDescription: updatedDescription,
                ncrIssueDate: updatedIssueDate,
                ncrImageFileName: updatedImageFileName,
                ncrSalesOrderNo: updatedSalesOrderNo,
                ncrQtyRecieved: updatedQtyReceived,
                ncrQtyDefective: updatedQtyDefective,
                ncrDefectDesc: updatedDefectDesc,
                ncrStatusID: updatedStatusID,
                ncrSupplierName: updatedSupplierName,
                prodID: selectedProductID // Add product ID to updated data
            };

            return fetch(`/api/ncrForms/${ncrFormNo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
        })
        .then(response => {
            if (response.ok) {
                fetchNcrForms();
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
            } else {
                console.error('Failed to update NCR record');
            }
        })
        .catch(error => console.error('Error updating NCR record:', error));
};

fetchNcrForms();
