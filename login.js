document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Function to save user data to CSV
    function saveUserToCSV(userData) {
        // In a real application, this would be a server-side operation
        // For demonstration purposes, we're simulating the CSV handling in client-side JS
        
        // First, check if we have existing data in localStorage (simulating our CSV storage)
        let usersData = localStorage.getItem('cliniqUsersCSV');
        let users = [];
        
        if (usersData) {
            // Parse existing users
            users = JSON.parse(usersData);
        }
        
        // Check if user already exists (by username)
        const existingUserIndex = users.findIndex(user => user.username === userData.username);
        
        if (existingUserIndex !== -1) {
            // Update existing user
            users[existingUserIndex] = userData;
        } else {
            // Add new user
            users.push(userData);
        }
        
        // Save back to localStorage (simulating CSV storage)
        localStorage.setItem('cliniqUsersCSV', JSON.stringify(users));
        
        // Output to console what would be saved in CSV
        console.log("CSV would contain the following data:");
        console.log("username,password,dateOfBirth,loginTime");
        users.forEach(user => {
            console.log(`${user.username},${user.password},${user.dateOfBirth},${user.loginTime}`);
        });
    }
    
    // Function to authenticate user against "CSV" data
    function authenticateUser(username, password) {
        // Get users data
        const usersData = localStorage.getItem('cliniqUsersCSV');
        
        if (!usersData) {
            return null;
        }
        
        const users = JSON.parse(usersData);
        
        // Find matching user
        const matchedUser = users.find(user => user.username === username && user.password === password);
        
        return matchedUser || null;
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const dob = document.getElementById('dob').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Simple validation
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            if (!dob) {
                alert('Please enter your date of birth');
                return;
            }
            
            // First try to authenticate the user
            const existingUser = authenticateUser(username, password);
            
            // Create user data object
            const userData = {
                username: username,
                password: password,
                dateOfBirth: dob,
                rememberMe: rememberMe,
                loginTime: new Date().toISOString()
            };
            
            // Save to CSV (simulated)
            saveUserToCSV(userData);
            
            // Save current user to localStorage
            localStorage.setItem('cliniqUserData', JSON.stringify(userData));
            
            if (existingUser) {
                alert(`Welcome back, ${username}!`);
            } else {
                alert(`Account created and logged in as ${username}!`);
            }
            
            // Redirect to dashboard page
            window.location.href = 'dashboard.html';
        });
    }
    
    // Check if user data exists in localStorage (for "remember me" functionality)
    const savedUserData = localStorage.getItem('cliniqUserData');
    if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        
        // If "remember me" was checked, pre-fill the form
        if (userData.rememberMe) {
            document.getElementById('username').value = userData.username;
            document.getElementById('remember').checked = true;
            
            // If we have stored date of birth, populate that field too
            if (userData.dateOfBirth) {
                document.getElementById('dob').value = userData.dateOfBirth;
            }
        }
    }
}); 