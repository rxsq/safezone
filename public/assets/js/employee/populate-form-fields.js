async function populatePositionSelect() {
    try {
        const response = await fetch('/api/positions');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const positions = await response.json();
        const positionSelect = document.getElementById('position');

        // Clear existing options
        positionSelect.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = ''; 
        defaultOption.textContent = 'Select a Position'; 
        defaultOption.selected = true; 
        defaultOption.disabled = true; 
        positionSelect.appendChild(defaultOption);

        // Populate the select dropdown with positions
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.posID; 
            option.textContent = position.posDescription; 
            positionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching positions:', error);
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', populatePositionSelect);
