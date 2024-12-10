document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-close');
    const homeContent = document.querySelector('.home-content');
    let tooltipInstances = [];

    // Initialize sidebar collapsed state from localStorage
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        homeContent.classList.add('expanded');
        enableTooltips();
    } else {
        sidebar.classList.remove('collapsed');
        homeContent.classList.remove('expanded');
        disableTooltips();
    }

    // Toggle sidebar collapsed state
    toggleBtn.addEventListener('click', function () {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        homeContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', isCollapsed);

        if (isCollapsed) {
            enableTooltips();
        } else {
            disableTooltips();
        }
    });

    // Enable tooltips for collapsed sidebar
    function enableTooltips() {
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach((el) => {
            const title = el.getAttribute('data-title') || el.getAttribute('title');
            if (title) {
                el.setAttribute('data-title', title); 
                el.setAttribute('title', title); 
            }
        });

        tooltipInstances = [...tooltipElements].map((el) => new bootstrap.Tooltip(el));
    }

    // Disable tooltips for expanded sidebar
    function disableTooltips() {
        tooltipInstances.forEach((tooltip) => {
            if (tooltip._element) {
                tooltip.hide();
            }
            tooltip.dispose();
        });
        tooltipInstances = [];

        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach((el) => {
            const title = el.getAttribute('title');
            if (title) {
                el.setAttribute('data-title', title); 
                el.removeAttribute('title'); 
            }
        });
    }
});