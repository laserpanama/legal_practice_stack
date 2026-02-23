# Legal Practice Stack - Law Firm Automation Hub

A comprehensive, production-ready web application for managing legal practices in Panama. Built with modern technologies and full compliance with Panama's Ley 81 (2019) for data protection and electronic signatures.

## Overview

Legal Practice Stack is a full-stack legal practice management system designed specifically for Panamanian law firms. It streamlines case management, document workflows, client intake, billing, and compliance operations with an elegant, professional interface.

## Features

### 1. **Dashboard & Analytics**
- Real-time practice overview with key metrics
- Case tracking with status visualization
- Upcoming appointments and recent cases
- Comprehensive analytics dashboard with:
  - 6-month case metrics and trends
  - Billing revenue tracking in Panamanian Balboas (B/.)
  - Time tracking analytics (billable vs non-billable hours)
  - Case type distribution analysis
  - Lawyer productivity reports

### 2. **Client Management**
- Complete client database with search and filtering
- Panamanian cédula (ID) validation
- Contact information management
- Client status tracking (active, inactive, archived)
- Multi-step client intake form with privacy consent

### 3. **Case Management**
- Case creation and tracking with priority levels
- Case status workflow (open, in progress, pending review, closed)
- Matter assignment to lawyers
- Case history and timeline
- Document attachment to cases

### 4. **Document Management**
- Document template library with 5 pre-built legal templates:
  - Power of Attorney
  - Settlement Agreement
  - Confidentiality Agreement
  - Contract Templates
  - Pleading Templates
- Dynamic field population for document generation
- Document versioning and history
- Secure document storage with role-based access control

### 5. **Billing & Time Tracking**
- Time entry logging with billable/non-billable classification
- Invoice generation in Panamanian Balboas (B/.)
- Invoice tracking and payment status
- Billing reports and analytics
- Automatic invoice numbering

### 6. **Calendar & Appointments**
- Appointment scheduling system
- Calendar view with event management
- Client notifications
- Appointment reminders
- Recurring appointment support

### 7. **Ley 81 (2019) Compliance**
- Complete audit logging for all operations
- Privacy consent management
- Data protection compliance tracking
- Secure data storage with encryption
- Audit trail for compliance reporting
- Client data handling documentation

### 8. **Role-Based Access Control**
- Three user roles: Admin, Lawyer, Client
- Permission-based feature access
- Secure authentication with Manus OAuth
- Session management and logout

### 9. **Professional UI Design**
- Elegant light/dark theme support
- Responsive design for all devices
- Professional color scheme suitable for legal practice
- Accessible interface with keyboard navigation
- Intuitive sidebar navigation

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling and responsive design
- **shadcn/ui** - Professional component library
- **Recharts** - Data visualization and analytics
- **Wouter** - Lightweight routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Express 4** - Web server
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Database management
- **MySQL/TiDB** - Database
- **Node.js** - Runtime environment

### Infrastructure
- **Vite** - Build tool
- **Vitest** - Unit testing framework
- **TypeScript** - Type checking
- **Manus OAuth** - Authentication

## Project Structure

```
legal_practice_stack/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Cases.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Billing.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── ClientIntake.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Home.tsx
│   │   ├── components/       # Reusable components
│   │   │   ├── LegalDashboardLayout.tsx
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── lib/             # Utilities and helpers
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                    # Backend Node.js/Express
│   ├── routers.ts           # tRPC procedure definitions
│   ├── db.ts                # Database helpers
│   ├── ley81-compliance.ts  # Compliance utilities
│   ├── clients.test.ts      # Unit tests
│   └── _core/               # Framework internals
├── drizzle/                  # Database schema
│   └── schema.ts            # Table definitions
├── shared/                   # Shared types and constants
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Database Schema

### Core Tables
- **users** - User authentication and profiles
- **clients** - Client records with cédula validation
- **cases** - Case/matter tracking
- **documents** - Document storage and versioning
- **timeEntries** - Time tracking for billing
- **invoices** - Invoice generation and tracking
- **appointments** - Calendar and scheduling
- **documentTemplates** - Legal template library
- **auditLogs** - Compliance and audit trails
- **privacyConsents** - Ley 81 data protection

## Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/laserpanama/legal_practice_stack.git
cd legal_practice_stack
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and OAuth credentials
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start development server:
```bash
pnpm dev
```

6. Open http://localhost:3000 in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

### Run Tests

```bash
pnpm test
```

## API Documentation

### tRPC Procedures

The application uses tRPC for type-safe API communication. All procedures are defined in `server/routers.ts`.

#### Client Procedures
- `clients.create` - Create a new client
- `clients.list` - Get all clients
- `clients.getById` - Get client by ID
- `clients.update` - Update client information
- `clients.delete` - Delete a client

#### Case Procedures
- `cases.create` - Create a new case
- `cases.list` - Get all cases
- `cases.getById` - Get case by ID
- `cases.update` - Update case status
- `cases.delete` - Delete a case

#### Document Procedures
- `documents.create` - Upload a document
- `documents.list` - Get all documents
- `documents.getById` - Get document by ID
- `documents.delete` - Delete a document

#### Billing Procedures
- `timeEntries.create` - Log time entry
- `timeEntries.list` - Get time entries
- `invoices.create` - Generate invoice
- `invoices.list` - Get invoices
- `invoices.getById` - Get invoice by ID

#### Appointment Procedures
- `appointments.create` - Schedule appointment
- `appointments.list` - Get appointments
- `appointments.update` - Update appointment
- `appointments.delete` - Cancel appointment

#### LexIA AI Procedures
- `lexia.createSession` - Create AI consultation session
- `lexia.saveMessage` - Save consultation message
- `lexia.getSessionHistory` - Get session history
- `lexia.createCaseNotes` - Generate AI case notes
- `lexia.analyzeDocument` - AI document analysis
- `lexia.getConsultationStats` - Get AI usage stats

#### eFirmas Signature Procedures
- `efirmas.requestSignature` - Request digital signature
- `efirmas.validateSignature` - Validate signature authenticity
- `efirmas.getSignatureDetails` - Get signature metadata
- `efirmas.listSignatures` - List signature requests
- `efirmas.getComplianceReport` - Ley 81 compliance report

#### Alexa Legal Knowledge Procedures
- `alexa.searchLegalCodes` - Search Panamanian legal codes
- `alexa.getLegalCode` - Get full text of legal codes
- `alexa.searchTemplates` - Search document templates
- `alexa.generateDocument` - AI-assisted document generation
- `alexa.getLegalAdvice` - AI legal advice with citations

#### Audit & Compliance
- `audit.getSignatureRequests` - List signature requests (Admin)
- `audit.getAuditTrail` - Detailed signature audit trail
- `audit.getComplianceStatistics` - Compliance metrics
- `audit.generateComplianceReport` - Generate PDF/CSV reports
- `audit.listByUser` - Get current user audit logs

## Ley 81 (2019) Compliance

This system is designed with full compliance to Panama's Law 81 of 2019 on Personal Data Protection and Electronic Signatures:

### Data Protection Features
- Encrypted data storage
- Role-based access control
- Audit logging for all data access
- Privacy consent management
- Secure data deletion procedures
- Data breach notification system

### Electronic Signature Support
- Certified digital signature capability
- Timestamp and audit trail recording
- Signature verification
- Legal validity documentation

### Compliance Reporting
- Audit trail reports
- Data processing activity logs
- Privacy consent records
- Security incident tracking

## Security Considerations

1. **Authentication**: Manus OAuth integration for secure login
2. **Authorization**: Role-based access control (RBAC)
3. **Data Encryption**: AES-256 encryption for sensitive data
4. **HTTPS**: All communications encrypted in transit
5. **Session Management**: Secure session cookies with HttpOnly flag
6. **Input Validation**: Zod schema validation on all inputs
7. **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
8. **CSRF Protection**: Built-in CSRF token handling

## Performance Optimization

- Optimistic updates for instant UI feedback
- Component-level loading states
- Efficient database queries with proper indexing
- Lazy loading of routes and components
- Caching strategies for frequently accessed data
- Responsive design for all screen sizes

## Panamanian Localization

- **Currency**: Balboa (B/.) formatting throughout
- **ID Validation**: Panamanian cédula validation
- **Language**: Spanish support ready
- **Legal Compliance**: Ley 81 (2019) compliance
- **Time Zone**: Panama timezone handling

## Testing

The project includes comprehensive unit tests using Vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Coverage
- Backend procedures: 22 test cases
- Client management: CRUD operations
- Case management: Status workflows
- Billing: Invoice generation
- Compliance: Audit logging

## Deployment

### Manus Platform
The application is designed to run on the Manus platform with:
- Automatic scaling
- Built-in SSL/TLS
- Custom domain support
- Database hosting
- Environment variable management

### Manual Deployment
For self-hosted deployment:
1. Build the application: `pnpm build`
2. Deploy to your server: `pnpm start`
3. Configure environment variables
4. Set up database backups
5. Enable HTTPS

## Troubleshooting

### Common Installation Issues

#### `ERR_PNPM_NO_PKG_MANIFEST` No package.json found
This error occurs when you try to run `pnpm install` in a directory that does not contain the `package.json` file (e.g., `C:\WINDOWS\system32`).
**Solution:** Ensure you have cloned the repository and moved into the project directory before running installation commands:
```bash
git clone https://github.com/laserpanama/legal_practice_stack.git
cd legal_practice_stack
pnpm install
```

#### Database Connection Failures
If the application fails to start with "Database not available" errors:
- Ensure your `DATABASE_URL` in `.env` is correct.
- Verify that your MySQL/TiDB server is running and accessible.
- For local development without a database, some features may use mock data, but core services require a valid connection.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Write tests for new features
4. Submit a pull request
5. Ensure all tests pass

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact support@legalpracticestack.com

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete case management system
- Client intake with cédula validation
- Document automation with templates
- Billing and time tracking
- Calendar and appointments
- Analytics and reporting
- Ley 81 (2019) compliance features
- Professional UI design

## Roadmap

### Upcoming Features
- Electronic signature integration with certified providers
- Payment processing (Stripe integration)
- Email notification system
- Voice AI agents for client notifications
- CRM integration
- Advanced reporting and analytics
- Mobile app (iOS/Android)
- Multi-language support
- Custom branding options

## Credits

Built with ❤️ for Panamanian law firms.

---

**Legal Practice Stack** - Streamline your legal practice with modern automation.
