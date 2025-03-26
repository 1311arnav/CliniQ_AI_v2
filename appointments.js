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
    
    // Populate user information in sidebar
    populateUserInfo(user);
    
    // Get DOM elements
    const newAppointmentBtn = document.getElementById('newAppointmentBtn');
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentFormContainer = document.getElementById('appointmentFormContainer');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const formTitle = document.getElementById('formTitle');
    const appointmentsList = document.getElementById('appointmentsList');
    const filterAppointments = document.getElementById('filterAppointments');
    
    // Initialize appointments from localStorage or create empty array
    let appointments = [];
    const storedAppointments = localStorage.getItem(`cliniqAppointments_${user.username}`);
    
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    }
    
    // Display initial list of appointments
    renderAppointments();
    
    // Event listeners
    newAppointmentBtn.addEventListener('click', function() {
        // Clear form fields
        appointmentForm.reset();
        document.getElementById('appointmentId').value = '';
        formTitle.textContent = 'New Appointment';
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('appointmentDate').value = formatDateForInput(tomorrow);
        
        // Show form
        appointmentFormContainer.style.display = 'block';
        
        // Scroll to form
        appointmentFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    cancelFormBtn.addEventListener('click', function() {
        appointmentFormContainer.style.display = 'none';
    });
    
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const appointmentId = document.getElementById('appointmentId').value;
        const doctorName = document.getElementById('doctorName').value;
        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = document.getElementById('appointmentTime').value;
        const appointmentPurpose = document.getElementById('appointmentPurpose').value;
        
        if (appointmentId) {
            // Update existing appointment
            const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
            
            if (appointmentIndex !== -1) {
                appointments[appointmentIndex] = {
                    ...appointments[appointmentIndex],
                    doctorName,
                    date: appointmentDate,
                    time: appointmentTime,
                    purpose: appointmentPurpose,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new appointment
            const newAppointment = {
                id: generateId(),
                doctorName,
                date: appointmentDate,
                time: appointmentTime,
                purpose: appointmentPurpose,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            appointments.push(newAppointment);
        }
        
        // Save to localStorage
        saveAppointments();
        
        // Hide form
        appointmentFormContainer.style.display = 'none';
        
        // Refresh list
        renderAppointments();
    });
    
    filterAppointments.addEventListener('change', function() {
        renderAppointments();
    });
    
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
    
    // Functions
    function populateUserInfo(user) {
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
        const loginDate = new Date(user.loginTime);
        const creationDate = loginDate.toLocaleDateString();
        
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) {
            memberSinceElement.textContent = `Member since: ${creationDate}`;
        }
    }
    
    function renderAppointments() {
        // Clear list
        appointmentsList.innerHTML = '';
        
        // Get filter value
        const filter = filterAppointments.value;
        
        // Filter appointments
        let filteredAppointments = [...appointments];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filter === 'upcoming') {
            filteredAppointments = filteredAppointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= today;
            });
        } else if (filter === 'past') {
            filteredAppointments = filteredAppointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate < today;
            });
        }
        
        // Sort appointments by date (newest first)
        filteredAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        // Show message if no appointments
        if (filteredAppointments.length === 0) {
            const noAppointmentsMsg = document.createElement('div');
            noAppointmentsMsg.className = 'no-appointments-message';
            
            if (appointments.length === 0) {
                noAppointmentsMsg.innerHTML = '<p>You don\'t have any appointments scheduled yet. Click "New Appointment" to schedule one.</p>';
            } else {
                noAppointmentsMsg.innerHTML = '<p>No appointments match your filter criteria.</p>';
            }
            
            appointmentsList.appendChild(noAppointmentsMsg);
            return;
        }
        
        // Render each appointment
        filteredAppointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'appointment-card';
            
            // Format date and time
            const dateObj = new Date(`${appointment.date}T${appointment.time}`);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Check if appointment is in the past
            const isPast = dateObj < new Date();
            const statusClass = isPast ? 'past' : 'upcoming';
            
            appointmentCard.innerHTML = `
                <div class="appointment-info">
                    <div class="appointment-date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span class="${statusClass}">${formattedDate}, ${formattedTime}</span>
                    </div>
                    <h3 class="appointment-doctor">Dr. ${appointment.doctorName}</h3>
                    <p class="appointment-purpose">${appointment.purpose || 'No purpose specified'}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-icon btn-edit" data-id="${appointment.id}" title="Edit Appointment">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${appointment.id}" title="Delete Appointment">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            
            appointmentsList.appendChild(appointmentCard);
            
            // Add event listeners to edit and delete buttons
            const editBtn = appointmentCard.querySelector('.btn-edit');
            const deleteBtn = appointmentCard.querySelector('.btn-delete');
            
            editBtn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editAppointment(id);
            });
            
            deleteBtn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteAppointment(id);
            });
        });
    }
    
    function editAppointment(id) {
        const appointment = appointments.find(apt => apt.id === id);
        
        if (appointment) {
            // Fill form with appointment data
            document.getElementById('appointmentId').value = appointment.id;
            document.getElementById('doctorName').value = appointment.doctorName;
            document.getElementById('appointmentDate').value = appointment.date;
            document.getElementById('appointmentTime').value = appointment.time;
            document.getElementById('appointmentPurpose').value = appointment.purpose || '';
            
            // Update form title
            formTitle.textContent = 'Edit Appointment';
            
            // Show form
            appointmentFormContainer.style.display = 'block';
            
            // Scroll to form
            appointmentFormContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function deleteAppointment(id) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            // Remove appointment from array
            appointments = appointments.filter(apt => apt.id !== id);
            
            // Save to localStorage
            saveAppointments();
            
            // Refresh list
            renderAppointments();
        }
    }
    
    function saveAppointments() {
        localStorage.setItem(`cliniqAppointments_${user.username}`, JSON.stringify(appointments));
    }
    
    // Helper functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}); 