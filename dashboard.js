document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = localStorage.getItem('cliniqUserData');
    
    if (!userData) {
        // No user data found, redirect to login
        window.location.href = 'login.html';
        return;
    }
    
    // Parse user data
    const user = JSON.parse(userData);
    
    // Populate user information
    populateUserInfo(user);
    
    // Display next appointment
    displayNextAppointment(user);
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear current user data (but keep the CSV data)
            localStorage.removeItem('cliniqUserData');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
});

/**
 * Display the user's next appointment
 */
function displayNextAppointment(user) {
    // Get appointment elements
    const appointmentDateElement = document.getElementById('nextAppointmentDate');
    const appointmentDaysElement = document.getElementById('nextAppointmentDays');
    
    if (!appointmentDateElement || !appointmentDaysElement) {
        return;
    }
    
    // Get appointments from localStorage
    const storedAppointments = localStorage.getItem(`cliniqAppointments_${user.username}`);
    
    if (!storedAppointments) {
        appointmentDateElement.textContent = 'No appointments';
        appointmentDaysElement.textContent = 'Schedule your first appointment';
        return;
    }
    
    const appointments = JSON.parse(storedAppointments);
    
    // Filter out past appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        return aptDate >= today;
    });
    
    // Sort appointments by date (earliest first)
    upcomingAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    // Display next appointment if available
    if (upcomingAppointments.length > 0) {
        const nextAppointment = upcomingAppointments[0];
        const appointmentDate = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
        
        // Format date for display
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Calculate days until appointment
        const daysDiff = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));
        const daysText = daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`;
        
        appointmentDateElement.textContent = formattedDate;
        appointmentDaysElement.textContent = daysText;
    } else {
        appointmentDateElement.textContent = 'No upcoming appointments';
        appointmentDaysElement.textContent = 'Schedule your next appointment';
    }
}

/**
 * Populate the dashboard with user information
 */
function populateUserInfo(user) {
    // Format the login time
    const loginDate = new Date(user.loginTime);
    const formattedLoginTime = loginDate.toLocaleString();
    
    // Format the date of birth
    const dobDate = new Date(user.dateOfBirth);
    const formattedDob = dobDate.toLocaleDateString();
    
    // Calculate member since date (using login time as a proxy for account creation)
    const creationDate = loginDate.toLocaleDateString();
    
    // Update user greeting in navbar
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${user.username}`;
    }
    
    // Update username in sidebar
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = user.username;
    }
    
    // Update member since in sidebar
    const memberSinceElement = document.getElementById('memberSince');
    if (memberSinceElement) {
        memberSinceElement.textContent = `Member since: ${creationDate}`;
    }
    
    // Update user details table
    const userDetailName = document.getElementById('userDetailName');
    const userDetailDob = document.getElementById('userDetailDob');
    const userDetailCreated = document.getElementById('userDetailCreated');
    const userDetailLogin = document.getElementById('userDetailLogin');
    
    if (userDetailName) userDetailName.textContent = user.username;
    if (userDetailDob) userDetailDob.textContent = formattedDob;
    if (userDetailCreated) userDetailCreated.textContent = creationDate;
    if (userDetailLogin) userDetailLogin.textContent = formattedLoginTime;
} 