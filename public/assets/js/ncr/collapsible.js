document.querySelectorAll('.collapsible').forEach((legend, index) => {
    const sectionId = legend.id.replace('legend-', 'section-');
    const section = document.getElementById(sectionId);

    // Set the first collapsible section to be open by default
    section.style.display = index === 0 ? 'block' : 'none';

    legend.addEventListener('click', () => {
        // Close all sections first
        document.querySelectorAll('.collapsible').forEach((otherLegend) => {
            const otherSectionId = otherLegend.id.replace('legend-', 'section-');
            const otherSection = document.getElementById(otherSectionId);
            otherSection.style.display = 'none';
        });

        // Open the clicked section
        section.style.display = 'block';
    });
});