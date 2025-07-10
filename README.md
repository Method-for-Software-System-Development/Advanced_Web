# 🐾 FurEver Friends - Pet Clinic Management System

A comprehensive full-stack veterinary clinic management system built with modern web technologies. This system provides complete functionality for managing pet appointments, medical records, prescriptions, and clinic operations.

## 🌟 Features

### 👥 **Multi-Role User System**

- **Pet Owners**: Manage pet profiles, book appointments, view medical history
- **Secretary/Admin**: Complete clinic management dashboard
- **Veterinarians**: Access to patient records and appointment management

### 📅 **Advanced Appointment System**

- Regular appointment scheduling with time conflict detection
- **Emergency appointment handling** with automatic vet assignment
- Email notifications for appointments and cancellations
- Excel export functionality for appointment reports
- Real-time availability checking

### 🏥 **Comprehensive Pet & Medical Management**

- Pet profiles with photos and complete medical history
- Prescription management with fulfillment tracking
- Treatment history and medical records
- Medicine inventory management

### 👨‍⚕️ **Staff Management**

- Veterinarian and staff profiles with specializations
- Availability scheduling system
- Role-based access control
- Staff photo management

### 📊 **Reporting & Analytics**

- Professional Excel reports with styling
- Appointment statistics and revenue tracking
- Filterable data views by date ranges
- Summary dashboards

### 💬 **Communication Features**

- Integrated chat system for customer support
- Automated email notifications
- Emergency alert system

## 🛠️ Technology Stack

### **Frontend**

- **React 19** with TypeScript
- **Vite** for build tooling and development
- **TailwindCSS** for responsive styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### **Backend**

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose ODM**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **ExcelJS** for report generation
- **Multer** for file uploads

### **Database**

- **MongoDB** with structured schemas for:
  - Users and authentication
  - Pet profiles and medical records
  - Appointments and scheduling
  - Prescriptions and medications
  - Staff management
  - Treatment history

## 📁 Project Structure

```
Advanced_Web/
├── Client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── secretary/   # Admin dashboard components
│   │   │   ├── user/        # Client-facing components
│   │   │   ├── chatbot/     # Chat system
│   │   │   └── homePage/    # Landing page components
│   │   ├── pages/           # Main page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # CSS and styling
│   ├── public/              # Static assets
│   └── package.json
├── Server/                   # Node.js backend application
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File upload storage
│   └── package.json
├── PetClinicPrototype/       # Initial prototype/demo
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Method-for-Software-System-Development/Advanced_Web.git
   cd Advanced_Web
   ```
2. **Set up the backend**

   ```bash
   cd Server
   npm install
   ```
3. **Set up environment variables**
   Create a `.env` file in the Server directory:

   ```env
   PORT=3000
   MONGODB_URI=<mongodb url>
   JWT_SECRET=<your-super-secret-jwt-key>
   EMAIL_USER=<your-email@gmail.com>
   EMAIL_PASS=<your-app-password>
   GEMINI_API_KEY=<gemini-key>
   ```
4. **Set up the frontend**

   ```bash
   cd ../Client
   npm install
   ```
5. **Start the development servers**

   **Backend (Terminal 1):**

   ```bash
   cd Server
   npm run dev
   ```

   **Frontend (Terminal 2):**

   ```bash
   cd Client
   npm run dev
   ```
6. **Access the application**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/reset-password` - Password reset

### Appointment Endpoints

- `GET /api/appointments` - Get all appointments (with filtering)
- `POST /api/appointments` - Create new appointment
- `POST /api/appointments/emergency` - Create emergency appointment
- `GET /api/appointments/export-excel` - Export appointments to Excel
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Pet & User Management

- `GET /api/pets` - Get all pets
- `POST /api/pets` - Create new pet profile
- `GET /api/users` - Get all users/patients

### Prescription & Medicine

- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/medicines` - Get medicine catalog

### Staff Management

- `GET /api/staff` - Get staff members
- `POST /api/staff` - Add new staff member
- `PUT /api/staff/:id` - Update staff information

## 🎨 Key Features Detail

### Emergency Appointment System

- Automatically finds the most available veterinarian
- Cancels conflicting non-critical appointments
- Sends notifications to affected parties
- Flat emergency fee structure ($1000)
- Never cancels surgery appointments

### Excel Reporting

- Professional styling with clinic branding
- Summary statistics (total appointments, revenue)
- Detailed appointment listings
- Filterable by date ranges
- Downloadable file generation

### Real-time Features

- Live appointment conflict detection
- Instant availability updates
- Chat system for customer support
- Email notifications for all major events

## 🔒 Security Features

- **JWT-based authentication** with secure token handling
- **Password hashing** using bcrypt
- **Role-based access control** (user/secretary/admin)
- **Input validation** and sanitization
- **CORS configuration** for cross-origin security
- **Protected routes** on both frontend and backend

## 🌐 Deployment

### Frontend (Vercel)

The frontend is configured for easy deployment to Vercel:

```bash
cd Client
npm run build
# Deploy to Vercel
```

### Backend (Vercel/Railway/Heroku)

The backend includes configuration for serverless deployment:

- `vercel.json` configuration included
- Environment variable support
- Database connection handling

## 🧪 Testing

Run tests for the application:

```bash
# Frontend tests
cd Client
npm run test

# Backend tests
cd Server
npm run test
```

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:

- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🎯 Future Enhancements

- [ ] SMS notifications integration
- [ ] Advanced reporting dashboard
- [ ] Mobile app development
- [ ] Integration with external veterinary systems
- [ ] Appointment reminder automation
- [ ] Payment processing integration
- [ ] Inventory management system
- [ ] Telemedicine features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Group 4 - Advanced Web Technologies Course**

- Project developed as part of university coursework
- July 2025

## 📞 Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/your-username/Advanced_Web/issues)

## 🙏 Acknowledgments

- Thanks to the Advanced Web Technologies course instructors
- MongoDB community for excellent documentation
- React and TypeScript communities
- TailwindCSS for the amazing styling framework

---

**FurEver Friends Pet Clinic** - Your pet's health. Our FurEver mission. 🐾
