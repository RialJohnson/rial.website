// Game Recap Script
document.addEventListener('DOMContentLoaded', function() {
    const yearButtons = document.querySelectorAll('.year-btn');
    const recapImage = document.getElementById('recap-image');

    yearButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            yearButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get the year from the button's data attribute
            const year = this.getAttribute('data-year');

            // Update the image source
            recapImage.src = `/images/game-recap-${year}.png`;
            recapImage.alt = `${year} Game Recap`;

            // Add fade effect
            recapImage.classList.add('fade');
            setTimeout(() => {
                recapImage.classList.remove('fade');
            }, 150);
        });
    });
});