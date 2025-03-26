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
    
    // Set active menu item
    setActiveMenuItem();
    
    // Initialize variables
    let selectedRecords = [];
    let temporaryUploadedFile = null;
    const API_KEY = '[Your API Key here]'; // This would be secured in a real implementation
    
    // Get DOM elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const filterSavedRecords = document.getElementById('filterSavedRecords');
    const searchSavedRecords = document.getElementById('searchSavedRecords');
    const savedRecordsList = document.getElementById('savedRecordsList');
    const selectedRecordsList = document.getElementById('selectedRecordsList');
    const selectedRecordsCounter = document.querySelector('.selected-records h4');
    const fileInput = document.getElementById('newRecordFile');
    const uploadPreview = document.getElementById('uploadPreview');
    const fileNameElement = document.getElementById('fileName');
    const previewContent = document.getElementById('previewContent');
    const removeFileBtn = document.getElementById('removeFile');
    const toStep2Btn = document.getElementById('toStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const toStep3Btn = document.getElementById('toStep3');
    const stepButtons = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const analysisLoading = document.getElementById('analysisLoading');
    const analysisResults = document.getElementById('analysisResults');
    const restartAnalysis = document.getElementById('restartAnalysis');
    const restartBtn = document.getElementById('restartBtn');
    
    // Setup button states
    setupButtonStates();
    
    // Load saved medical records
    loadSavedRecords();
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active state for buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Filter and search saved records
    filterSavedRecords.addEventListener('change', function() {
        loadSavedRecords();
    });
    
    searchSavedRecords.addEventListener('input', function() {
        loadSavedRecords();
    });
    
    // File upload handling
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Check file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF or image file (JPG, JPEG, PNG).');
            this.value = '';
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds the maximum limit of 10MB.');
            this.value = '';
            return;
        }
        
        // Store the file for later use
        temporaryUploadedFile = file;
        
        // Show file name
        fileNameElement.textContent = file.name;
        
        // Show preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContent.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            previewContent.innerHTML = `
                <div class="pdf-preview">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>${file.name}</span>
                </div>
            `;
        }
        
        uploadPreview.style.display = 'block';
        
        // Add to selected records
        addTemporaryFileToSelection();
        
        // Enable next button if we have selections
        toStep2Btn.disabled = selectedRecords.length === 0;
    });
    
    // Remove uploaded file
    removeFileBtn.addEventListener('click', function() {
        fileInput.value = '';
        uploadPreview.style.display = 'none';
        temporaryUploadedFile = null;
        
        // Remove from selected records
        removeTemporaryFileFromSelection();
        
        // Disable next button if no selections
        toStep2Btn.disabled = selectedRecords.length === 0;
    });
    
    // Step navigation
    toStep2Btn.addEventListener('click', function() {
        goToStep(2);
    });
    
    backToStep1Btn.addEventListener('click', function() {
        goToStep(1);
    });
    
    toStep3Btn.addEventListener('click', function() {
        goToStep(3);
        performAnalysis();
    });
    
    restartBtn.addEventListener('click', function() {
        // Reset everything
        selectedRecords = [];
        temporaryUploadedFile = null;
        fileInput.value = '';
        uploadPreview.style.display = 'none';
        updateSelectedRecordsList();
        
        // Reset form fields
        document.getElementById('symptoms').value = '';
        document.getElementById('medicalHistory').value = '';
        document.getElementById('specificQuestions').value = '';
        document.getElementById('medications').value = '';
        
        goToStep(1);
    });
    
    // Handle save, print, and share buttons
    document.getElementById('saveAnalysisBtn').addEventListener('click', saveAnalysis);
    document.getElementById('printAnalysisBtn').addEventListener('click', printAnalysis);
    document.getElementById('shareWithDoctorBtn').addEventListener('click', shareWithDoctor);
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('cliniqUserData');
            window.location.href = 'login.html';
        });
    }
    
    // Helper Functions

    function populateUserInfo(user) {
        // Update user greeting in header
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${user.username}`;
        }
        
        // Update username in sidebar
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        
        // Update member since info
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) {
            const creationDate = new Date(user.createdAt || Date.now());
            const formattedDate = creationDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            memberSinceElement.textContent = `Member since: ${formattedDate}`;
        }
    }
    
    function loadSavedRecords() {
        // Get user's medical records
        const storedRecords = localStorage.getItem(`cliniqMedicalRecords_${user.username}`);
        let records = [];
        
        if (storedRecords) {
            records = JSON.parse(storedRecords);
        }
        
        // Apply filter and search
        const filter = filterSavedRecords.value;
        const search = searchSavedRecords.value.toLowerCase();
        
        let filteredRecords = [...records];
        
        if (filter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.type === filter);
        }
        
        if (search) {
            filteredRecords = filteredRecords.filter(record => 
                record.title.toLowerCase().includes(search) ||
                record.doctor.toLowerCase().includes(search) ||
                (record.notes && record.notes.toLowerCase().includes(search))
            );
        }
        
        // Sort records by date (newest first)
        filteredRecords.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        // Display records
        renderSavedRecords(filteredRecords);
    }
    
    function renderSavedRecords(records) {
        // Clear list
        savedRecordsList.innerHTML = '';
        
        // Show message if no records
        if (records.length === 0) {
            savedRecordsList.innerHTML = `
                <div class="no-records">
                    <p>No medical records found. You can add records in the "Medical Records" section.</p>
                </div>
            `;
            return;
        }
        
        // Render each record
        records.forEach(record => {
            // Format date
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Get record type display text
            const recordTypeDisplay = getRecordTypeDisplay(record.type);
            
            // Check if this record is already selected
            const isSelected = selectedRecords.some(selected => selected.id === record.id);
            
            // Create record item
            const recordItem = document.createElement('div');
            recordItem.className = `record-item${isSelected ? ' selected' : ''}`;
            recordItem.dataset.id = record.id;
            
            recordItem.innerHTML = `
                <span class="record-type-badge">${recordTypeDisplay}</span>
                <h4>${record.title}</h4>
                <div class="record-date">${formattedDate}</div>
                <div class="record-doctor">Dr. ${record.doctor}</div>
                <div class="record-select-indicator"></div>
            `;
            
            // Toggle selection on click
            recordItem.addEventListener('click', function() {
                const recordId = this.dataset.id;
                const recordIndex = selectedRecords.findIndex(r => r.id === recordId);
                
                if (recordIndex === -1) {
                    // Add to selected records
                    selectedRecords.push(record);
                    this.classList.add('selected');
                } else {
                    // Remove from selected records
                    selectedRecords.splice(recordIndex, 1);
                    this.classList.remove('selected');
                }
                
                // Update selected records list
                updateSelectedRecordsList();
                
                // Enable/disable next button
                toStep2Btn.disabled = selectedRecords.length === 0;
            });
            
            savedRecordsList.appendChild(recordItem);
        });
    }
    
    function updateSelectedRecordsList() {
        // Update counter
        selectedRecordsCounter.textContent = `Selected for Analysis (${selectedRecords.length})`;
        
        // Clear list
        selectedRecordsList.innerHTML = '';
        
        // Show message if no records selected
        if (selectedRecords.length === 0) {
            selectedRecordsList.innerHTML = `
                <div class="no-records-selected">No records selected yet</div>
            `;
            return;
        }
        
        // Render each selected record
        selectedRecords.forEach(record => {
            const isTemporary = record.isTemporary;
            
            const recordItem = document.createElement('div');
            recordItem.className = 'selected-record-item';
            recordItem.dataset.id = record.id;
            
            recordItem.innerHTML = `
                <span>${record.title || record.fileName}</span>
                <button class="remove-record" data-id="${record.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            // Remove record on click
            const removeBtn = recordItem.querySelector('.remove-record');
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const recordId = this.dataset.id;
                
                // Remove from selected records
                const recordIndex = selectedRecords.findIndex(r => r.id === recordId);
                if (recordIndex !== -1) {
                    selectedRecords.splice(recordIndex, 1);
                }
                
                // Update UI
                if (isTemporary) {
                    // If it was a temporary file, reset the file input
                    fileInput.value = '';
                    uploadPreview.style.display = 'none';
                    temporaryUploadedFile = null;
                } else {
                    // Update saved records list selection
                    const recordItem = savedRecordsList.querySelector(`.record-item[data-id="${recordId}"]`);
                    if (recordItem) {
                        recordItem.classList.remove('selected');
                    }
                }
                
                updateSelectedRecordsList();
                
                // Enable/disable next button
                toStep2Btn.disabled = selectedRecords.length === 0;
            });
            
            selectedRecordsList.appendChild(recordItem);
        });
    }
    
    function addTemporaryFileToSelection() {
        if (!temporaryUploadedFile) return;
        
        // Remove any existing temporary file
        removeTemporaryFileFromSelection();
        
        // Add the new temporary file
        const temporaryRecord = {
            id: 'temp-' + Date.now(),
            fileName: temporaryUploadedFile.name,
            fileType: temporaryUploadedFile.type,
            file: temporaryUploadedFile,
            isTemporary: true,
            title: temporaryUploadedFile.name.split('.')[0] // Use filename as title
        };
        
        selectedRecords.push(temporaryRecord);
        updateSelectedRecordsList();
    }
    
    function removeTemporaryFileFromSelection() {
        // Remove any temporary files from selection
        selectedRecords = selectedRecords.filter(record => !record.isTemporary);
        updateSelectedRecordsList();
    }
    
    function goToStep(stepNumber) {
        // Update step indicators
        stepButtons.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // Show selected step content
        stepContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `step${stepNumber}`) {
                content.classList.add('active');
            }
        });
    }
    
    async function performAnalysis() {
        // Show loading state
        analysisLoading.style.display = 'block';
        analysisResults.style.display = 'none';
        restartAnalysis.style.display = 'none';
        
        try {
            // Collect context information
            const context = {
                symptoms: document.getElementById('symptoms').value,
                medicalHistory: document.getElementById('medicalHistory').value,
                specificQuestions: document.getElementById('specificQuestions').value,
                medications: document.getElementById('medications').value
            };
            
            // Process records for analysis
            const processedRecords = await processRecordsForAnalysis();
            
            // Call Gemini API
            const results = await callGeminiAPI(processedRecords, context);
            
            // Display the results
            displayResults(results);
            
            // Hide loading, show results and restart button
            analysisLoading.style.display = 'none';
            analysisResults.style.display = 'block';
            restartAnalysis.style.display = 'block';
        } catch (error) {
            console.error('Analysis error:', error);
            
            // Show error message
            analysisLoading.style.display = 'none';
            analysisResults.innerHTML = `
                <div class="analysis-error">
                    <h3>Analysis Error</h3>
                    <p>We encountered an error analyzing your medical records. Please try again later.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
            analysisResults.style.display = 'block';
            restartAnalysis.style.display = 'block';
        }
    }
    
    async function processRecordsForAnalysis() {
        const processedRecords = [];
        
        for (const record of selectedRecords) {
            // For already saved records
            if (!record.isTemporary) {
                processedRecords.push({
                    title: record.title,
                    type: getRecordTypeDisplay(record.type),
                    date: new Date(record.date).toLocaleDateString(),
                    doctor: record.doctor,
                    notes: record.notes || '',
                    fileData: record.fileData || '',
                    content: record.content || record.notes || `Medical record: ${record.title}`
                });
            } 
            // For temporary file upload
            else if (record.file) {
                let content = "";
                let fileData = "";
                
                try {
                    // Read file as data URL for all file types
                    fileData = await readFileAsDataURL(record.file);
                    
                    // For image files
                    if (record.file.type.startsWith('image/')) {
                        content = `The analysis is based on the image medical record: ${record.fileName}. This image may contain laboratory test results, medical reports, or other healthcare data that should be analyzed.`;
                    } 
                    // For PDF files
                    else if (record.file.type === 'application/pdf') {
                        content = `The analysis is based on the PDF medical record: ${record.fileName}. This PDF may contain laboratory test results, medical reports, or other healthcare data that should be analyzed.`;
                    }
                    else {
                        content = `Medical record: ${record.fileName}`;
                    }
                } catch (error) {
                    console.error("Error reading file:", error);
                    content = `Failed to extract content from ${record.fileName}`;
                }
                
                processedRecords.push({
                    title: record.fileName,
                    type: 'Uploaded Document',
                    fileData: fileData,
                    content: content
                });
            }
        }
        
        return processedRecords;
    }
    
    // Helper function to read file as DataURL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    }
    
    async function callGeminiAPI(records, context) {
        try {
            // Prepare the request body
            const requestBody = {
                contents: [{
                    parts: []
                }]
            };

            // Add text prompt
            requestBody.contents[0].parts.push({
                text: `Analyze the following medical records and provide insights:\n\n` +
                      `RECORDS:\n${JSON.stringify(records.map(r => ({...r, fileData: r.fileData ? "[File data available]" : ""})))}\n\n` +
                      `PATIENT CONTEXT:\n${JSON.stringify(context)}\n\n` +
                      `Format your response as follows:
                      1. SUMMARY: A brief summary of the findings
                      2. KEY_FINDINGS: A list of key findings, each on a new line starting with "*"
                      3. HEALTH_INDICATORS: A list of potential health indicators, each on a new line starting with "*"
                      4. RECOMMENDATIONS: A list of recommendations, each on a new line starting with "*"
                      5. QUESTION_ANSWERS: If there are specific questions in the context, answer each one clearly.`
            });

            // Add image(s) if available (for multimodal analysis)
            const imageRecords = records.filter(r => r.fileData && (r.fileData.startsWith('data:image/')));
            
            if (imageRecords.length > 0) {
                // Add only the first image for now (API limitations)
                const imageRecord = imageRecords[0];
                requestBody.contents[0].parts.push({
                    inlineData: {
                        mimeType: imageRecord.fileData.split(';')[0].split(':')[1],
                        data: imageRecord.fileData.split(',')[1] // Remove the "data:image/jpeg;base64," part
                    }
                });
                
                // Add instruction for image
                requestBody.contents[0].parts.push({
                    text: `Please analyze the medical image provided and include insights from it in your analysis.`
                });
            }

            // Make the API call
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                }
            );
            
            const data = await response.json();
            
            // Check for API errors
            if (data.error) {
                throw new Error(data.error.message || "API Error");
            }
            
            const apiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!apiText) {
                throw new Error("No response from the analysis API");
            }
            
            // Parse the API response into our required format
            return parseApiResponse(apiText);
        } catch (error) {
            console.error("API call error:", error);
            throw error;
        }
    }
    
    function parseApiResponse(apiText) {
        // Initialize the result structure
        const result = {
            summary: "",
            keyFindings: [],
            healthIndicators: [],
            recommendations: [],
            questionAnswers: []
        };
        
        // Split response by sections
        const sections = apiText.split(/\d+\.\s+/);
        
        // Extract content from each section
        sections.forEach(section => {
            if (section.includes("SUMMARY:")) {
                // Clean up the summary text - remove asterisks, double asterisks, etc.
                let summaryText = section.replace("SUMMARY:", "").trim();
                summaryText = summaryText.replace(/\*\*/g, "").replace(/\*/g, "");
                result.summary = summaryText;
            } 
            else if (section.includes("KEY_FINDINGS:")) {
                // Extract list items starting with "*" and clean up formatting
                const listContent = section.replace("KEY_FINDINGS:", "").trim();
                result.keyFindings = listContent.split(/\n\*/)
                    .map(item => item.trim().replace(/\*\*/g, "").replace(/\*/g, ""))
                    .filter(item => item);
                
                // Make sure the first item doesn't have a * prefix
                if (result.keyFindings[0] && result.keyFindings[0].startsWith("*")) {
                    result.keyFindings[0] = result.keyFindings[0].substring(1).trim();
                }
            } 
            else if (section.includes("HEALTH_INDICATORS:")) {
                const listContent = section.replace("HEALTH_INDICATORS:", "").trim();
                result.healthIndicators = listContent.split(/\n\*/)
                    .map(item => item.trim().replace(/\*\*/g, "").replace(/\*/g, ""))
                    .filter(item => item);
                
                if (result.healthIndicators[0] && result.healthIndicators[0].startsWith("*")) {
                    result.healthIndicators[0] = result.healthIndicators[0].substring(1).trim();
                }
            } 
            else if (section.includes("RECOMMENDATIONS:")) {
                const listContent = section.replace("RECOMMENDATIONS:", "").trim();
                result.recommendations = listContent.split(/\n\*/)
                    .map(item => item.trim().replace(/\*\*/g, "").replace(/\*/g, ""))
                    .filter(item => item);
                
                if (result.recommendations[0] && result.recommendations[0].startsWith("*")) {
                    result.recommendations[0] = result.recommendations[0].substring(1).trim();
                }
            } 
            else if (section.includes("QUESTION_ANSWERS:")) {
                const qaContent = section.replace("QUESTION_ANSWERS:", "").trim();
                
                // Process question-answer pairs
                // Look for patterns like "Question: ... Answer: ..."
                const qaPairs = qaContent.split(/Question:/).filter(item => item.trim());
                
                qaPairs.forEach(pair => {
                    const parts = pair.split(/Answer:/);
                    if (parts.length >= 2) {
                        const question = parts[0].trim().replace(/\*\*/g, "").replace(/\*/g, "");
                        const answer = parts[1].trim().replace(/\*\*/g, "").replace(/\*/g, "");
                        
                        result.questionAnswers.push({
                            question: question,
                            answer: answer
                        });
                    }
                });
            }
        });
        
        // If parsing failed, create some fallback content
        if (!result.summary) {
            result.summary = "Unable to parse the analysis results properly. Please try again.";
        }
        
        if (result.keyFindings.length === 0) {
            result.keyFindings = ["No specific findings were identified"];
        }
        
        return result;
    }
    
    function displayResults(results) {
        // Populate results sections - convert the summary to bullet points
        const summaryElement = document.getElementById('resultsSummary');
        summaryElement.innerHTML = ''; // Clear the existing content
        
        // Split summary into sentences for bullet points
        const summaryText = results.summary;
        const sentences = summaryText.split(/\.\s+/).filter(s => s.trim().length > 0);
        
        // Create a bullet point list
        sentences.forEach(sentence => {
            if (sentence.trim().length === 0) return;
            
            // Add period if it doesn't end with one
            if (!sentence.endsWith('.')) {
                sentence += '.';
            }
            
            const bulletPoint = document.createElement('div');
            bulletPoint.className = 'summary-bullet';
            bulletPoint.textContent = sentence.trim();
            summaryElement.appendChild(bulletPoint);
        });
        
        // Key findings
        const keyFindingsElement = document.getElementById('keyFindings');
        keyFindingsElement.innerHTML = '';
        results.keyFindings.forEach(finding => {
            const listItem = document.createElement('div');
            listItem.className = 'finding-item';
            
            // Remove any redundant labels that might still be present
            let findingText = finding.trim();
            // Remove trailing colons if present
            if (findingText.endsWith(':')) {
                findingText = findingText.substring(0, findingText.length - 1);
            }
            
            listItem.textContent = findingText;
            keyFindingsElement.appendChild(listItem);
        });
        
        // Health indicators
        const healthIndicatorsElement = document.getElementById('healthIndicators');
        healthIndicatorsElement.innerHTML = '';
        results.healthIndicators.forEach(indicator => {
            // Remove any labels or prefixes for conciseness
            let indicatorText = indicator.trim();
            // Remove patterns like "Anemia:" or "Kidney Dysfunction:" to make it more concise
            indicatorText = indicatorText.replace(/^([^:]+):\s*/g, "");
            // Remove trailing colons if present
            if (indicatorText.endsWith(':')) {
                indicatorText = indicatorText.substring(0, indicatorText.length - 1);
            }
            
            const listItem = document.createElement('div');
            listItem.className = 'indicator-item';
            listItem.textContent = indicatorText;
            healthIndicatorsElement.appendChild(listItem);
        });
        
        // Recommendations
        const recommendationsElement = document.getElementById('recommendations');
        recommendationsElement.innerHTML = '';
        results.recommendations.forEach(recommendation => {
            let recommendationText = recommendation.trim();
            // Remove trailing periods if present to be consistent
            if (recommendationText.endsWith('.')) {
                recommendationText = recommendationText.substring(0, recommendationText.length - 1);
            }
            
            const listItem = document.createElement('div');
            listItem.className = 'recommendation-item';
            listItem.textContent = recommendationText;
            recommendationsElement.appendChild(listItem);
        });
        
        // Question answers
        const questionAnswersElement = document.getElementById('questionAnswers');
        questionAnswersElement.innerHTML = '';
        
        if (results.questionAnswers && results.questionAnswers.length > 0) {
            results.questionAnswers.forEach(qa => {
                const qaItem = document.createElement('div');
                qaItem.className = 'qa-item';
                
                const question = document.createElement('div');
                question.className = 'question';
                question.textContent = qa.question;
                
                // Convert answer to bullet points if it contains multiple sentences
                const answer = document.createElement('div');
                answer.className = 'answer';
                
                const answerSentences = qa.answer.split(/\.\s+/).filter(s => s.trim().length > 0);
                if (answerSentences.length > 1) {
                    // Multiple sentences - create bullet points
                    const answerList = document.createElement('div');
                    answerList.className = 'answer-bullets';
                    
                    answerSentences.forEach(sentence => {
                        if (sentence.trim().length === 0) return;
                        
                        // Add period if it doesn't end with one
                        if (!sentence.endsWith('.')) {
                            sentence += '.';
                        }
                        
                        const answerBullet = document.createElement('div');
                        answerBullet.className = 'answer-bullet';
                        answerBullet.textContent = sentence.trim();
                        answerList.appendChild(answerBullet);
                    });
                    
                    answer.appendChild(answerList);
                } else {
                    // Single sentence - just show it
                    answer.textContent = qa.answer;
                }
                
                qaItem.appendChild(question);
                qaItem.appendChild(answer);
                questionAnswersElement.appendChild(qaItem);
            });
        } else {
            questionAnswersElement.innerHTML = '<p>No specific questions were provided for analysis.</p>';
        }
    }
    
    function saveAnalysis() {
        // In a real app, this would save the analysis to the user's account
        alert('Analysis saved successfully!');
        
        // For demo, we'll just simulate saving
        const analysis = {
            id: 'analysis-' + Date.now(),
            date: new Date().toISOString(),
            records: selectedRecords.map(r => r.id),
            results: {
                summary: document.getElementById('resultsSummary').textContent,
                // ... other results data would be here
            }
        };
        
        // Store in localStorage
        const savedAnalyses = JSON.parse(localStorage.getItem(`cliniqAnalyses_${user.username}`) || '[]');
        savedAnalyses.push(analysis);
        localStorage.setItem(`cliniqAnalyses_${user.username}`, JSON.stringify(savedAnalyses));
    }
    
    function printAnalysis() {
        window.print();
    }
    
    function shareWithDoctor() {
        // In a real app, this would open a sharing dialog
        alert('This feature would allow you to share this analysis with your healthcare provider via secure messaging or email.');
    }
    
    function getRecordTypeDisplay(type) {
        const typeMap = {
            'lab_result': 'Lab Result',
            'prescription': 'Prescription',
            'radiology': 'Radiology/Imaging',
            'discharge': 'Discharge Summary',
            'consultation': 'Consultation Note',
            'other': 'Other Document'
        };
        
        return typeMap[type] || 'Document';
    }

    function setActiveMenuItem() {
        // Find all sidebar menu items and remove active class
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        menuItems.forEach(item => {
            if (item.querySelector('a[href="intelligent-diagnosis.html"]')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Fix the button size and set appropriate states
    function setupButtonStates() {
        const toStep2Button = document.getElementById('toStep2');
        const selectedRecordsList = document.getElementById('selectedRecordsList');
        
        if (!toStep2Button) return;
        
        // Update the button state based on selection
        function updateButtonState() {
            if (selectedRecordsList.childElementCount > 0 && 
                !selectedRecordsList.querySelector('.no-records-selected')) {
                toStep2Button.removeAttribute('disabled');
            } else {
                toStep2Button.setAttribute('disabled', 'disabled');
            }
        }
        
        // Initial state
        updateButtonState();
        
        // Set up a mutation observer to watch for changes in the selected records list
        const observer = new MutationObserver(function(mutations) {
            updateButtonState();
        });
        
        observer.observe(selectedRecordsList, { 
            childList: true,
            subtree: true
        });
    }
}); 
