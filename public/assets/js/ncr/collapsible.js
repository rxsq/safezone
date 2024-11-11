document.querySelectorAll('.collapsible').forEach(legend => {
    const sectionId = legend.id.replace('legend-', 'section-');
    const section = document.getElementById(sectionId);
    section.style.display = 'none'; 

    legend.addEventListener('click', () => {
        const isCollapsed = section.style.display === 'none';
        section.style.display = isCollapsed ? 'block' : 'none';
    });
});