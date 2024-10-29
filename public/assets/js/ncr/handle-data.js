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
        })
        .catch(error => console.error('Error fetching NCR forms:', error));
    
}

function updateMetrics(data){
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID == "OPEN").length;
    const inactive = data.filter(ncr => ncr.ncrStatusID == "CLSD").length;

    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;

    //handle overdue
    //const overdue = 
    //document.querySelector('.key-metrics .metric-card.overdue p').innerText = overdue;
};

// Function to populate recent NCR table with data
function populateRecentNcrTable(data) {
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = ''; 

    data.forEach(ncr => {
        const row = document.createElement('tr');

        const status = ncr.ncrStatusID;
        let ncrStatus;
        
        if(status==="OPEN"){
            ncrStatus = "Active";
        }
        else{
            ncrStatus = "Inactive";
        }

        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${ncr.ncrDocumentNo}</td>
            <td>${ncr.ncrSupplierName}</td>
            <td>${ncr.ncrDefectDesc}</td>
            <td>${ncrStatus}</td>
            <td class="action-buttons-td">
                <button class="view-btn" onclick="viewNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteNCR('${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
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

function deleteNCR(ncrFormNo, ncrString){
    const ncr = JSON.parse(decodeURIComponent(ncrString));
    document.getElementById('deleteModalBody').textContent = `Are you sure you want to delete NCR No. ${ncr.ncrFormNo}?`;
    document.getElementById('btnDeleteYes').onclick = () => removeNCR(ncr.ncrFormNo); 
    document.getElementById('btnDeleteNo').onclick = function(){
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

document.getElementById('btnSaveChanges').onclick = function() {
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
