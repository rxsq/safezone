import { formatPhoneNumber } from '../utils/generalUtils.js';

// Function to show loading spinner
function showLoadingSpinner() {
    const spinnerWrapper = document.getElementById('loading-spinner-wrapper');
    spinnerWrapper.style.opacity = '1';
    spinnerWrapper.style.display = 'flex';
}

// Function to hide loading spinner
function hideLoadingSpinner() {
    const spinnerWrapper = document.getElementById('loading-spinner-wrapper');
    spinnerWrapper.style.opacity = '0';

    setTimeout(() => {
        spinnerWrapper.style.display = 'none';
    });  
}

const pageSize = 10;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    fetchSuppliers();
});

// Function to fetch suppliers from the server
function fetchSuppliers(page = 1, pagelimitSize = pageSize) {
    showLoadingSpinner();
    const paginationParams = `page=${page}&limit=${pagelimitSize}`;
    let url = `/api/suppliers?${paginationParams}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                document.getElementById('page-number').textContent = `Page ${data.currentPage}`;
                
                populateSupplierTable(data.items);

                renderPaginationControls(data); 

                hideLoadingSpinner();
            } else {
                console.error('Failed fetching data for pagination');
            }
        })
        .catch(error => console.error('Error fetching suppliers:', error))
}

function renderPaginationControls(data){
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = '';

    const currentPage = data.currentPage;
    const totalPages = data.totalPages;

    const maxButtons = 3;
    const pagesToShow = Math.min(maxButtons, totalPages);

    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if(endPage === totalPages){
        startPage = Math.max(1, totalPages - pagesToShow + 1);
    }

    createNavigationButton(paginationContainer, 'First', 1, currentPage === 1);
    createNavigationButton(paginationContainer, 'Prev', currentPage - 1, currentPage === 1);

    for(let i = startPage; i <= endPage; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => fetchSuppliers(i);
        pageButton.disabled = i === currentPage;
        paginationContainer.appendChild(pageButton);
    }

    if(endPage < totalPages){
        const ellipsisButton = document.createElement('button');
        ellipsisButton.textContent = '...';
        ellipsisButton.onclick = () => showPageInput(currentPage, totalPages);
        paginationContainer.appendChild(ellipsisButton);
    }

    createNavigationButton(paginationContainer, 'Next', currentPage + 1, currentPage === totalPages);
    createNavigationButton(paginationContainer, 'Last', totalPages, currentPage === totalPages);

}

function createNavigationButton(container, text, page, isDisabled) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = () => fetchSuppliers(page);
    button.disabled = isDisabled;
    container.appendChild(button);
}

function showPageInput(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination-controls');

    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.value = currentPage;
    pageInput.min = 1;
    pageInput.max = totalPages;
    pageInput.classList.add('page-input');

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Go';
    submitButton.onclick = () => {
        const inputPage = parseInt(pageInput.value);
        if (inputPage >= 1 && inputPage <= totalPages) {
            fetchNcrForms(inputPage);
        } else {
            alert('Please enter a valid page number');
        }
    };

    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pageInput);
    paginationContainer.appendChild(submitButton);
    pageInput.style.display = 'inline-block'; 
}

function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Function to populate the supplier table
function populateSupplierTable(data) {
    const tableBody = document.getElementById('supplier-list');
    tableBody.innerHTML = "";

    data.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.supName}</td>
            <td>${supplier.supContactName}</td>
            <td>${supplier.supContactEmail}</td>
            <td>${formatPhoneNumber(supplier.supContactPhone)}</td>
            <td class="text-center action-buttons-td">
                <button class="action-btn view-btn" data-id="${supplier.supID}" data-bs-toggle="tooltip" title="View Supplier"> 
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${supplier.supID}" data-bs-toggle="tooltip" title="Edit Supplier">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${supplier.supID}" data-name="${supplier.supName}" data-bs-toggle="tooltip" title="Delete Supplier">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.view-btn').forEach(button =>
        button.addEventListener('click', () => viewSupplier(button.getAttribute('data-id')))
    );
    document.querySelectorAll('.edit-btn').forEach(button =>
        button.addEventListener('click', () => editSupplier(button.getAttribute('data-id')))
    );
    document.querySelectorAll('.delete-btn').forEach(button =>
        button.addEventListener('click', () => deleteSupplier(button.getAttribute('data-id'), button.getAttribute('data-name')))
    );

    initializeTooltips();
}

// Function to view selected supplier
function viewSupplier(supID) {
    fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('viewSupplierName').innerText = supplier.supName;
            document.getElementById('viewContactName').innerText = supplier.supContactName;
            document.getElementById('viewContactEmail').innerHTML = `<a href="mailto:${supplier.supContactEmail}">${supplier.supContactEmail}</a>`;
            document.getElementById('viewContactPhone').innerText = formatPhoneNumber(supplier.supContactPhone);
            document.getElementById('viewAddress').innerText = supplier.supAddress;
            document.getElementById('viewCity').innerText = supplier.supCity;
            document.getElementById('viewCountry').innerText = supplier.supCountry;

            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => console.error('Error fetching supplier:', error));
}

// Function to edit selected supplier
function editSupplier(supID) {
    fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('editSupID').value = supplier.supID;
            document.getElementById('editSupplierName').value = supplier.supName;
            document.getElementById('editContactName').value = supplier.supContactName;
            document.getElementById('editContactEmail').value = supplier.supContactEmail;
            document.getElementById('editContactPhone').value = formatPhoneNumber(supplier.supContactPhone);
            document.getElementById('editAddress').value = supplier.supAddress;
            document.getElementById('editCity').value = supplier.supCity;
            document.getElementById('editCountry').value = supplier.supCountry;

            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(error => console.error('Error fetching supplier for editing:', error));

}

// Save changes event listener
document.getElementById('btnSaveChanges').onclick = function() {
    const supID = parseInt(document.getElementById('editSupID').value);
    const updatedSupplierData = {
        supID,
        supName: document.getElementById('editSupplierName').value,
        supContactName: document.getElementById('editContactName').value,
        supContactEmail: document.getElementById('editContactEmail').value,
        supContactPhone: document.getElementById('editContactPhone').value,
        supAddress: document.getElementById('editAddress').value,
        supCity: document.getElementById('editCity').value,
        supCountry: document.getElementById('editCountry').value,
    };

    fetch(`/api/suppliers/${supID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSupplierData),
    })
    .then(response => {
        if (response.ok) {
            fetchSuppliers(); 
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
        } else {
            console.error('Failed to update supplier');
        }
    })
    .catch(error => console.error('Error updating supplier:', error));
}

// Function to handle deleting selected supplier
function deleteSupplier(supID, supName, supContactEmail, supContactName) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete this supplier?\n 
    ${supName}\n`;

    document.getElementById('btnDeleteYes').onclick = function() {
        fetch(`/api/suppliers/${supID}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                fetchSuppliers();
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
            } else {
                console.error('Failed to delete supplier');
            }
        })
        .catch(error => console.error('Error deleting supplier:', error));
    };

    document.getElementById('btnDeleteNo').onclick = function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

