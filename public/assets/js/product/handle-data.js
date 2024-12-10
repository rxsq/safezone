const userRole = sessionStorage.getItem('userRole');

const pageSize = 6;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
    populateSupplierDropdown();
});

// Function to render pagination controls
function renderPaginationControls(data) {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; 

    const currentPage = data.currentPage;
    const totalPages = data.totalPages;

    const maxButtons = 3; 
    const pagesToShow = Math.min(maxButtons, totalPages); 
    
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - pagesToShow + 1);
    }

    createNavigationButton(paginationContainer, 'First', 1, currentPage === 1);
    createNavigationButton(paginationContainer, 'Prev', currentPage - 1, currentPage === 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => fetchProducts(i);
        pageButton.disabled = i === currentPage;
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        const ellipsisButton = document.createElement('button');
        ellipsisButton.textContent = '...';
        ellipsisButton.onclick = () => showPageInput(currentPage, totalPages);
        paginationContainer.appendChild(ellipsisButton);
    }

    createNavigationButton(paginationContainer, 'Next', currentPage + 1, currentPage === totalPages);
    createNavigationButton(paginationContainer, 'Last', totalPages, currentPage === totalPages);
}

// Function to create navigation buttons
function createNavigationButton(container, text, page, isDisabled) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = () => fetchNcrForms(page);
    button.disabled = isDisabled;
    container.appendChild(button);
}

// Function to show page input 
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


// Function to fetch products from the server
function fetchProducts(page = 1, pagelimitSize = pageSize) {
    const paginationParams = `page=${page}&limit=${pagelimitSize}`;
    let url = `/api/products?${paginationParams}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('page-number').textContent = `Page ${data.currentPage}`;
                
            populateProductTable(data.items);

            renderPaginationControls(data); 

        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to populate the supplier dropdown in the edit modal
function populateSupplierDropdown() {
    fetch('/api/suppliers')
        .then(response => response.json())
        .then(suppliers => {
            const supplierDropdown = document.getElementById('editSupplier');
            supplierDropdown.innerHTML = ""; // Clear existing options

            suppliers.items.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.supID;
                option.textContent = supplier.supName;
                supplierDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function getSupplierName(supID) {
    return fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => supplier.supName)
        .catch(error => {
            console.error(`Error fetching supplier with ID ${supID}:`, error);
            return 'Unknown Supplier';
        });
}

// Function to populate the product table
function populateProductTable(data) {
    const tableBody = document.getElementById('product-list');
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach(product => {
        const row = document.createElement('tr');
        
        switch(userRole){
            case "Administrator":
                row.innerHTML = `
                <td>${product.prodID}</td>
                <td>${product.prodName}</td>
                <td>${product.prodCategory}</td>
                <td id="supplier-${product.prodID}">Loading...</td>
                <td class="text-center action-buttons-td">
                    <button class="action-btn" onclick="viewProduct('${product.prodID}')"
                       data-bs-toggle="tooltip" title="View Product"> <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editProduct('${product.prodID}')"
                        data-bs-toggle="tooltip" title="Edit Product"> <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn" onclick="deleteProduct('${product.prodID}', '${product.prodName}')"
                       data-bs-toggle="tooltip" title="Delete Product"> <i class="bi bi-trash"></i>
                    </button>
                </td>
                
            `; break;
            default:       
            row.innerHTML = `
            <td>${product.prodID}</td>
            <td>${product.prodName}</td>
            <td>${product.prodCategory}</td>
            <td id="supplier-${product.prodID}">Loading...</td>
            <td class="text-center action-buttons-td">
                <button class="action-btn" onclick="viewProduct('${product.prodID}')"
                   data-bs-toggle="tooltip" title="View Product"> <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn" onclick="editProduct('${product.prodID}')"
                    data-bs-toggle="tooltip" title="Edit Product"> <i class="bi bi-pencil"></i>
                </button>
            </td>      
        `; break;
        }

        
        tableBody.appendChild(row);

        getSupplierName(product.supID).then(supplierName => {
            document.getElementById(`supplier-${product.prodID}`).innerText = supplierName;
        });
    });

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function viewProduct(productID) {
    fetch(`/api/products/${productID}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('viewProductID').innerText = product.prodID;
            document.getElementById('viewProductName').innerText = product.prodName;
            document.getElementById('viewProductCategory').innerText = product.prodCategory;

            // Fetch supplier name using supID
            return fetch(`/api/suppliers/${product.supID}`);
        })
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('viewProductSupplier').innerText = supplier.supName;

            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => console.error('Error fetching product or supplier:', error));
}

// Function to edit selected product
function editProduct(productID) {
    fetch(`/api/products/${productID}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('editProductID').value = product.prodID;
            document.getElementById('editProductName').value = product.prodName;
            document.getElementById('editProductCategory').value = product.prodCategory;

            const supplierDropdown = document.getElementById('editSupplier');
            supplierDropdown.value = product.supID; 

            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(error => console.error('Error fetching product for editing:', error));
}

// Save changes event listener
document.getElementById('btnSaveChanges').onclick = function () {
    const prodID = parseInt(document.getElementById('editProductID').value);
    const updatedProductData = {
        prodID,
        prodName: document.getElementById('editProductName').value,
        prodCategory: document.getElementById('editProductCategory').value,
        supID: document.getElementById('editSupplier').value,
    };

    fetch(`/api/products/${prodID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProductData),
    })
        .then(response => {
            if (response.ok) {
                fetchProducts(); // Refresh the product list
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
            } else {
                console.error('Failed to update product');
            }
        })
        .catch(error => console.error('Error updating product:', error));
}

// Function to handle deleting selected product
function deleteProduct(productID, productName) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the product: ${productName}?`;

    document.getElementById('btnDeleteYes').onclick = function () {
        fetch(`/api/products/${productID}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    fetchProducts(); // Refresh the product list
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                    modal.hide();
                } else {
                    console.error('Failed to delete product');
                }
            })
            .catch(error => console.error('Error deleting product:', error));
    };

    document.getElementById('btnDeleteNo').onclick = function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}
