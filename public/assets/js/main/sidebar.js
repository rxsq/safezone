// if sidebar is collapsed, it adds a new class to it called 'collapsed' which alters how it looks through css

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-close');
    const homeContent = document.querySelector('.home-content');

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        homeContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        homeContent.classList.remove('expanded');
    }

    // event listener for toggle button (hamburger icon)
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        homeContent.classList.toggle('expanded');

        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
});