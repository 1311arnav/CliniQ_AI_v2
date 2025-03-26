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
    
    // Initialize records from localStorage or create empty array
    let records = [];
    const storedRecords = localStorage.getItem(`cliniqMedicalRecords_${user.username}`);
    
    if (storedRecords) {
        records = JSON.parse(storedRecords);
    }
    
    // Get DOM elements
    const uploadRecordBtn = document.getElementById('uploadRecordBtn');
    const recordForm = document.getElementById('recordForm');
    const recordFormContainer = document.getElementById('recordFormContainer');
    const cancelRecordBtn = document.getElementById('cancelRecordBtn');
    const recordsList = document.getElementById('recordsList');
    const filterRecords = document.getElementById('filterRecords');
    const searchRecords = document.getElementById('searchRecords');
    const relatedAppointmentSelect = document.getElementById('relatedAppointment');
    
    // Populate appointments dropdown
    populateAppointmentsDropdown(user);
    
    // Set today as default date for new records
    document.getElementById('recordDate').value = formatDateForInput(new Date());
    
    // Display initial list of records
    renderRecords();
    
    // Event listeners
    uploadRecordBtn.addEventListener('click', function() {
        // Clear form fields
        recordForm.reset();
        document.getElementById('recordId').value = '';
        
        // Set default date to today
        document.getElementById('recordDate').value = formatDateForInput(new Date());
        
        // Show form
        recordFormContainer.style.display = 'block';
        
        // Scroll to form
        recordFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    cancelRecordBtn.addEventListener('click', function() {
        recordFormContainer.style.display = 'none';
    });
    
    recordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const recordId = document.getElementById('recordId').value;
        const recordTitle = document.getElementById('recordTitle').value;
        const recordDate = document.getElementById('recordDate').value;
        const recordDoctor = document.getElementById('recordDoctor').value;
        const recordType = document.getElementById('recordType').value;
        const recordNotes = document.getElementById('recordNotes').value;
        const relatedAppointment = document.getElementById('relatedAppointment').value;
        const recordFile = document.getElementById('recordFile').files[0];
        
        if (!recordFile && !recordId) {
            alert('Please select a file to upload.');
            return;
        }
        
        // Process the file (in real-world, this would send to a server)
        if (recordFile) {
            handleFileUpload(recordFile).then(fileData => {
                if (recordId) {
                    // Update existing record
                    const recordIndex = records.findIndex(rec => rec.id === recordId);
                    
                    if (recordIndex !== -1) {
                        records[recordIndex] = {
                            ...records[recordIndex],
                            title: recordTitle,
                            date: recordDate,
                            doctor: recordDoctor,
                            type: recordType,
                            notes: recordNotes,
                            relatedAppointment: relatedAppointment,
                            updatedAt: new Date().toISOString()
                        };
                        
                        // Only update the file if a new one was provided
                        if (fileData) {
                            records[recordIndex].fileData = fileData;
                            records[recordIndex].fileName = recordFile.name;
                            records[recordIndex].fileType = recordFile.type;
                        }
                    }
                } else {
                    // Create new record
                    const newRecord = {
                        id: generateId(),
                        title: recordTitle,
                        date: recordDate,
                        doctor: recordDoctor,
                        type: recordType,
                        notes: recordNotes,
                        fileName: recordFile.name,
                        fileType: recordFile.type,
                        fileData: fileData,
                        relatedAppointment: relatedAppointment,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    records.push(newRecord);
                }
                
                // Save to localStorage
                saveRecords();
                
                // Hide form
                recordFormContainer.style.display = 'none';
                
                // Refresh list
                renderRecords();
            }).catch(error => {
                alert('Error processing file: ' + error.message);
            });
        } else {
            // Just update the record without changing the file
            const recordIndex = records.findIndex(rec => rec.id === recordId);
            
            if (recordIndex !== -1) {
                records[recordIndex] = {
                    ...records[recordIndex],
                    title: recordTitle,
                    date: recordDate,
                    doctor: recordDoctor,
                    type: recordType,
                    notes: recordNotes,
                    relatedAppointment: relatedAppointment,
                    updatedAt: new Date().toISOString()
                };
                
                // Save to localStorage
                saveRecords();
                
                // Hide form
                recordFormContainer.style.display = 'none';
                
                // Refresh list
                renderRecords();
            }
        }
    });
    
    // Filter and search events
    filterRecords.addEventListener('change', function() {
        renderRecords();
    });
    
    searchRecords.addEventListener('input', function() {
        renderRecords();
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
    
    // Helper functions
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
    
    function populateAppointmentsDropdown(user) {
        // Get user's appointments
        const storedAppointments = localStorage.getItem(`cliniqAppointments_${user.username}`);
        
        if (!storedAppointments) {
            return;
        }
        
        const appointments = JSON.parse(storedAppointments);
        
        // Sort appointments by date (newest first)
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
        });
        
        // Add to dropdown
        appointments.forEach(appointment => {
            const dateObj = new Date(`${appointment.date}T${appointment.time}`);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const option = document.createElement('option');
            option.value = appointment.id;
            option.textContent = `${formattedDate} - Dr. ${appointment.doctorName}`;
            
            relatedAppointmentSelect.appendChild(option);
        });
    }
    
    function renderRecords() {
        // Clear list
        recordsList.innerHTML = '';
        
        // Get filter and search values
        const filter = filterRecords.value;
        const search = searchRecords.value.toLowerCase();
        
        // Filter records
        let filteredRecords = [...records];
        
        if (filter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.type === filter);
        }
        
        if (search) {
            filteredRecords = filteredRecords.filter(record => 
                record.title.toLowerCase().includes(search) ||
                record.doctor.toLowerCase().includes(search) ||
                record.notes.toLowerCase().includes(search)
            );
        }
        
        // Sort records by date (newest first)
        filteredRecords.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        // Show message if no records
        if (filteredRecords.length === 0) {
            const noRecordsMsg = document.createElement('div');
            noRecordsMsg.className = 'no-records-message';
            
            if (records.length === 0) {
                noRecordsMsg.innerHTML = '<p>You don\'t have any medical records saved yet. Click "Upload New Record" to add one.</p>';
            } else {
                noRecordsMsg.innerHTML = '<p>No records match your filter criteria.</p>';
            }
            
            recordsList.appendChild(noRecordsMsg);
            return;
        }
        
        // Render each record
        filteredRecords.forEach(record => {
            // Format date
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Get record type display text
            const recordTypeDisplay = getRecordTypeDisplay(record.type);
            
            // Create record card
            const recordCard = document.createElement('div');
            recordCard.className = 'record-card';
            
            recordCard.innerHTML = `
                <div class="record-card-header">
                    <span>${record.title}</span>
                    <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div class="record-card-body">
                    <div class="record-type">${recordTypeDisplay}</div>
                    <div class="record-date">${formattedDate}</div>
                    <div class="record-doctor">Dr. ${record.doctor}</div>
                    
                    <div class="record-preview" data-id="${record.id}">
                        ${record.fileType && record.fileType.startsWith('image/') 
                            ? `<img src="${record.fileData}" alt="${record.title}">`
                            : `<svg class="record-preview-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                               </svg>`
                        }
                    </div>
                    
                    ${record.notes ? `<div class="record-notes">${record.notes}</div>` : ''}
                    
                    <div class="record-actions">
                        <button class="view-record" data-id="${record.id}">View File</button>
                        <button class="edit-record" data-id="${record.id}">Edit Details</button>
                        <button class="delete-record" data-id="${record.id}">Delete</button>
                    </div>
                </div>
            `;
            
            recordsList.appendChild(recordCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-record').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editRecord(id);
            });
        });
        
        document.querySelectorAll('.delete-record').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteRecord(id);
            });
        });
        
        document.querySelectorAll('.view-record').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                viewRecord(id);
            });
        });
        
        document.querySelectorAll('.record-preview').forEach(preview => {
            preview.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                viewRecord(id);
            });
        });
    }
    
    function editRecord(id) {
        const record = records.find(rec => rec.id === id);
        
        if (!record) return;
        
        // Populate form with record data
        document.getElementById('recordId').value = record.id;
        document.getElementById('recordTitle').value = record.title;
        document.getElementById('recordDate').value = formatDateForInput(new Date(record.date));
        document.getElementById('recordDoctor').value = record.doctor;
        document.getElementById('recordType').value = record.type;
        document.getElementById('recordNotes').value = record.notes || '';
        
        if (record.relatedAppointment) {
            document.getElementById('relatedAppointment').value = record.relatedAppointment;
        } else {
            document.getElementById('relatedAppointment').value = '';
        }
        
        // Note: We can't pre-populate the file input due to security restrictions
        
        // Show form
        recordFormContainer.style.display = 'block';
        
        // Scroll to form
        recordFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function deleteRecord(id) {
        if (confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
            // Remove record from array
            const recordIndex = records.findIndex(rec => rec.id === id);
            
            if (recordIndex !== -1) {
                records.splice(recordIndex, 1);
                
                // Save to localStorage
                saveRecords();
                
                // Refresh list
                renderRecords();
            }
        }
    }
    
    function viewRecord(id) {
        const record = records.find(rec => rec.id === id);
        
        if (!record || !record.fileData) return;
        
        // For image files, create a new window/tab and write the image HTML
        if (record.fileType && record.fileType.startsWith('image/')) {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${record.title} - Medical Record</title>
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            background-color: #f5f7fa;
                        }
                        .header {
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        img {
                            max-width: 90%;
                            max-height: 80vh;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            border: 1px solid #eee;
                        }
                        .details {
                            margin-top: 20px;
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                            width: 90%;
                            max-width: 600px;
                        }
                        .label {
                            font-weight: bold;
                            color: #555;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${record.title}</h1>
                        <p>Date: ${new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <img src="${record.fileData}" alt="${record.title}">
                    <div class="details">
                        <p><span class="label">Record Type:</span> ${getRecordTypeDisplay(record.type)}</p>
                        <p><span class="label">Doctor:</span> Dr. ${record.doctor}</p>
                        ${record.notes ? `<p><span class="label">Notes:</span> ${record.notes}</p>` : ''}
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
        } 
        // For PDF files, open directly in a new tab
        else if (record.fileType === 'application/pdf') {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${record.title} - Medical Record</title>
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            background-color: #f5f7fa;
                        }
                        .header {
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        iframe {
                            width: 90%;
                            height: 80vh;
                            border: 1px solid #eee;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        }
                        .details {
                            margin-top: 20px;
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                            width: 90%;
                            max-width: 600px;
                        }
                        .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .download-btn {
                            margin-top: 15px;
                            padding: 8px 16px;
                            background-color: #4361ee;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .download-btn:hover {
                            background-color: #3a56d4;
                        }
                        .fallback {
                            margin: 20px 0;
                            padding: 15px;
                            background-color: #fff3cd;
                            border: 1px solid #ffeeba;
                            border-radius: 4px;
                            max-width: 90%;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${record.title}</h1>
                        <p>Date: ${new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    
                    <iframe src="${record.fileData}" type="application/pdf"></iframe>
                    
                    <div class="fallback" id="pdfFallback" style="display:none;">
                        <p>Your browser may have trouble displaying this PDF directly.</p>
                        <button class="download-btn" id="downloadPdf">Download PDF</button>
                    </div>
                    
                    <div class="details">
                        <p><span class="label">Record Type:</span> ${getRecordTypeDisplay(record.type)}</p>
                        <p><span class="label">Doctor:</span> Dr. ${record.doctor}</p>
                        ${record.notes ? `<p><span class="label">Notes:</span> ${record.notes}</p>` : ''}
                    </div>
                    
                    <script>
                        // Check if PDF loaded properly
                        document.querySelector('iframe').onerror = function() {
                            document.getElementById('pdfFallback').style.display = 'block';
                        };
                        
                        // For browsers that don't trigger iframe onerror
                        setTimeout(function() {
                            document.getElementById('pdfFallback').style.display = 'block';
                        }, 2000);
                        
                        // Setup download button
                        document.getElementById('downloadPdf').addEventListener('click', function() {
                            const a = document.createElement('a');
                            a.href = "${record.fileData}";
                            a.download = "${record.fileName || 'medical-record.pdf'}";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        });
                    </script>
                </body>
                </html>
            `);
            newWindow.document.close();
        } 
        // For other file types, trigger a download
        else {
            const a = document.createElement('a');
            a.href = record.fileData;
            a.download = record.fileName || `medical-record-${record.id}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
    
    function saveRecords() {
        localStorage.setItem(`cliniqMedicalRecords_${user.username}`, JSON.stringify(records));
    }
    
    // File handling functions
    function handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('File size exceeds the maximum limit of 10MB.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file.'));
            };
            
            // Read the file as Data URL (base64)
            reader.readAsDataURL(file);
        });
    }
    
    // Helper functions
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    function getRecordTypeDisplay(type) {
        const types = {
            'lab_result': 'Lab Result',
            'prescription': 'Prescription',
            'radiology': 'Radiology/Imaging',
            'discharge': 'Discharge Summary',
            'consultation': 'Consultation Note',
            'other': 'Other Medical Record'
        };
        
        return types[type] || 'Medical Record';
    }
}); 