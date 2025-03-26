# Healthcare Dashboard

A modern web-based healthcare management solution that empowers patients to manage their medical information, appointments, and access AI-powered diagnostic assistance.

## Features

### Dashboard
- View upcoming appointments
- Track healthcare metrics
- Quick access to all platform features

### Saved Medical Records
- Upload and store medical records (images, PDFs)
- Organize records by type, date, and doctor
- Link records to specific appointments
- Search and filter functionality

### Intelligent Diagnosis
- AI-powered analysis of medical records
- Step-by-step guided diagnostic process
- Contextual insights based on uploaded records
- Secure and private analysis

### Appointments
- Schedule and manage medical appointments
- View appointment history
- Receive reminders for upcoming visits

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Custom CSS with responsive design
- **Icons**: SVG icons for lightweight, scalable graphics
- **Local Storage**: Browser localStorage for data persistence
- **File Handling**: JavaScript File API for document uploads

## Project Structure

```
/
├── dashboard.html         # Main dashboard page
├── dashboard.css          # Dashboard styles
├── dashboard.js           # Dashboard functionality
├── appointments.html      # Appointments management page
├── appointments.css       # Appointments styles
├── appointments.js        # Appointments functionality  
├── medical-records.html   # Medical records management page
├── medical-records.css    # Medical records styles
├── medical-records.js     # Medical records functionality
├── intelligent-diagnosis.html # AI diagnosis page
├── intelligent-diagnosis.css  # Diagnosis styles
├── intelligent-diagnosis.js   # Diagnosis functionality
└── assets/                # Images and other assets
```

## Setup Instructions

1. Clone the repository:
   ```
   https://github.com/yourusername/CliniQ_AI_v2
   ```

2. Open the project in your preferred code editor

3. Launch the application by opening `Index.html` in a web browser

## Usage

### User Authentication
- The application uses local browser storage for user authentication
- Demo credentials are provided for testing (username: demo@example.com, password: password)

### Adding Medical Records
1. Navigate to "Saved Medical Records" from the sidebar
2. Click "Upload New Record" button
3. Fill in record details and upload your document
4. Click "Save Record"

### Using Intelligent Diagnosis
1. Navigate to "Intelligent Diagnosis" from the sidebar
2. Select a medical record for analysis
3. Provide additional context about your symptoms
4. Review the AI-generated insights

## Browser Compatibility

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Integration with real healthcare provider APIs
- Mobile application version
- Enhanced AI diagnostic capabilities
- Telehealth consultation booking

