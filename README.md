# ClaimRight - Lost & Found Management System

## Project Overview
**ClaimRight** is a centralized web-based system designed to simplify the process of reporting, searching, and claiming lost and found items. The system aims to reduce fraudulent claims and efficiently return lost items to their rightful owners through a secure platform.

## Features
- **User Authentication**
  - User registration and login
  - Role-based access (User & Admin)
  
- **Item Management**
  - Post lost item reports (with optional prize money payment gateway)
  - Post found item reports
  - Automated matching of lost and found items
  - Search and filter by category, location, and date

- **Claim System**
  - Claim request submission with verification steps
  - Upload proof of ownership (receipts, item photos)
  - Internal messaging between finder and claimant
  - Notification system (claim status, potential matches)

- **Admin Dashboard**
  - View all claims and reports
  - Approve/reject claims
  - Monitor system activity
  - Prevent fraudulent claims

## Technologies Used
### Frontend
- HTML, CSS, JavaScript
- Bootstrap (for responsive design)
- jQuery (for DOM manipulation)
- SweetAlert2 (for interactive alerts)

### Backend
- Java with Spring Boot
- Spring Security (for authentication)
- MySQL (database)

## Getting Started
### Prerequisites
- Java JDK 11 or higher
- Maven
- MySQL Server
- Node.js (for frontend dependencies)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ClaimRight.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ClaimRight
   ```

3. Set up the database:
   - Create a MySQL database named `claimright_db`
   - Update the database credentials in `src/main/resources/application.properties`

4. Build and run the backend:
   ```bash
   mvn spring-boot:run
   ```

5. For frontend development:
   ```bash
   cd src/main/resources/static
   npm install
   ```

6. Access the application at:
   ```
   http://localhost:8080
   ```

## Project Structure
```
ClaimRight/
├── src/
│   ├── main/
│   │   ├── java/com/claimright/
│   │   │   ├── config/          # Spring configuration
│   │   │   ├── controller/      # MVC controllers
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── model/           # Entity classes
│   │   │   ├── repository/      # Data repositories
│   │   │   ├── service/         # Business logic
│   │   │   └── ClaimRightApplication.java
│   │   └── resources/
│   │       ├── static/          # Frontend assets
│   │       ├── templates/       # Thymeleaf templates
│   │       └── application.properties
│   └── test/                    # Test cases
├── pom.xml                      # Maven configuration
└── README.md
```

## Usage
1. **As a User**:
   - Register an account or login
   - Report lost or found items
   - Search for matching items
   - Submit claims with proof of ownership
   - Communicate with other users through the messaging system

2. **As an Admin**:
   - Access the admin dashboard
   - Review and approve/reject claims
   - Monitor system activity
   - Manage user accounts

## Expected Outcome
The final product will be a fully functional web application that:
- Streamlines the lost and found process
- Reduces fraudulent claims through verification
- Provides automated matching suggestions
- Offers a secure platform for item recovery
- Gives administrators tools to monitor and manage the system

## Contributors
- **U.G.Charuka Hansaja Samaraweera** (241722035) - Project Developer

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.