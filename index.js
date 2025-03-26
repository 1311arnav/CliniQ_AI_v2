document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isUserLoggedIn = checkUserLoggedIn();
    
    // Get all button elements
    const getStartedBtn = document.getElementById('get-started-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const heroGetStartedBtn = document.getElementById('hero-get-started-btn');
    const heroDashboardBtn = document.getElementById('hero-dashboard-btn');
    const ctaGetStartedBtn = document.getElementById('cta-get-started-btn');
    const ctaDashboardBtn = document.getElementById('cta-dashboard-btn');
    
    // Update button visibility based on login status
    if (isUserLoggedIn) {
        // User is logged in, show dashboard buttons and hide get started buttons
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
        
        if (heroGetStartedBtn) heroGetStartedBtn.style.display = 'none';
        if (heroDashboardBtn) heroDashboardBtn.style.display = 'inline-block';
        
        if (ctaGetStartedBtn) ctaGetStartedBtn.style.display = 'none';
        if (ctaDashboardBtn) ctaDashboardBtn.style.display = 'inline-block';
        
        // Show username in welcome message if available
        const userData = JSON.parse(localStorage.getItem('cliniqUserData'));
        if (userData && userData.username) {
            // Add a welcome message next to the dashboard button
            const authButtons = document.getElementById('auth-buttons');
            if (authButtons) {
                // Create welcome element if it doesn't exist
                if (!document.getElementById('welcome-user')) {
                    const welcomeSpan = document.createElement('span');
                    welcomeSpan.id = 'welcome-user';
                    welcomeSpan.className = 'welcome-message';
                    welcomeSpan.textContent = `Welcome, ${userData.username}!`;
                    authButtons.insertBefore(welcomeSpan, dashboardBtn);
                }
            }
        }
    } else {
        // User is not logged in, show get started buttons and hide dashboard buttons
        if (getStartedBtn) getStartedBtn.style.display = 'inline-block';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
        
        if (heroGetStartedBtn) heroGetStartedBtn.style.display = 'inline-block';
        if (heroDashboardBtn) heroDashboardBtn.style.display = 'none';
        
        if (ctaGetStartedBtn) ctaGetStartedBtn.style.display = 'inline-block';
        if (ctaDashboardBtn) ctaDashboardBtn.style.display = 'none';
        
        // Remove welcome message if it exists
        const welcomeUser = document.getElementById('welcome-user');
        if (welcomeUser) welcomeUser.remove();
    }
    
    // Function to check if user is logged in
    function checkUserLoggedIn() {
        // Check localStorage for user data (same approach as in login.js)
        const savedUserData = localStorage.getItem('cliniqUserData');
        return savedUserData ? true : false;
    }
    
    // Also modify the hero section buttons if they exist
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons && isUserLoggedIn) {
        const heroButtonsHTML = heroButtons.innerHTML;
        // Replace the "Get Started" button with "Go to Dashboard" if logged in
        if (heroButtonsHTML.includes('Get Started')) {
            heroButtons.innerHTML = heroButtonsHTML.replace(
                '<a href="login.html" class="btn btn-primary">Get Started</a>',
                '<a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>'
            );
        }
    }
    
    // Modify the CTA section button if it exists
    const ctaSection = document.querySelector('.cta');
    if (ctaSection && isUserLoggedIn) {
        const ctaButton = ctaSection.querySelector('.btn');
        if (ctaButton) {
            ctaButton.textContent = 'Go to Dashboard';
            ctaButton.href = 'dashboard.html';
        }
    }
});

// Testing functions for browser console
// These will be accessible globally for testing purposes
function testLogin() {
    // Sample user data
    const userData = {
        username: "testuser",
        password: "password123",
        dateOfBirth: "1990-01-01",
        rememberMe: true,
        loginTime: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('cliniqUserData', JSON.stringify(userData));
    
    // Save to simulated CSV storage
    let users = [];
    const usersData = localStorage.getItem('cliniqUsersCSV');
    if (usersData) {
        users = JSON.parse(usersData);
    }
    
    const existingUserIndex = users.findIndex(user => user.username === userData.username);
    if (existingUserIndex !== -1) {
        users[existingUserIndex] = userData;
    } else {
        users.push(userData);
    }
    
    localStorage.setItem('cliniqUsersCSV', JSON.stringify(users));
    
    // Refresh page to show changes
    window.location.reload();
    
    return "Login successful! Page will refresh to show changes.";
}

function testLogout() {
    // Remove user data from localStorage
    localStorage.removeItem('cliniqUserData');
    
    // Refresh page to show changes
    window.location.reload();
    
    return "Logout successful! Page will refresh to show changes.";
} 