document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-close');
    const homeContent = document.querySelector('.home-content');

    // Check the sidebar state in localStorage when the page loads
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        homeContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        homeContent.classList.remove('expanded');
    }

    // Toggle the sidebar and save its state in localStorage
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        homeContent.classList.toggle('expanded');

        // Store the current state of the sidebar in localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
});