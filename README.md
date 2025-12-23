# MemberBase

A comprehensive member management system for Persatuan Seni Silat Cekak Malaysia. The system allows admins to manage member records and reference data, while members can self-register and update their profiles securely.

## Features

### Admin Portal
- **Dashboard**: Overview of system statistics
- **Member Management**: Pre-register, list, filter, search, edit, and delete members
- **Lookup Management**: Manage Classes (Kelas Latihan), Supervisors (Penyelia), and Ranks (Peringkat)
- **Member Export**: Export member records to CSV
- **Audit Logs**: Track all administrative actions
- **Session-based Authentication**: Secure email/password login

### Member Portal
- **Self-Registration**: Register via IC Number and Email
- **OTP Verification**: Email-based verification (currently bypassed for testing)
- **Profile Management**: 
  - Personal Information (Name, Gender, DOB, Contact)
  - Multiple Class Selection
  - Job Information
  - Next of Kin Details
  - Silat Experience History
  - PDPA Consent with Timestamp
- **Data Privacy**: IC numbers stored as plain text but masked in admin view

## System Requirements

- **Node.js**: v18+ (v20 recommended)
- **PostgreSQL**: 12+
- **npm**: 8+

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cis
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/cis_db

# Session Configuration
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Application Environment
NODE_ENV=development

# Port (Optional)
PORT=5000
```

#### Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Example:**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/cis_db
```

### 3. Database Setup

#### Option A: Local PostgreSQL Installation

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb cis_db
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb cis_db
```

**Windows:**
- Download and install from https://www.postgresql.org/download/windows/
- Use pgAdmin to create a new database named `cis_db`

#### Option B: Docker (Recommended for Self-Hosted)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: cis_user
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: cis_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

Update your `.env`:
```env
DATABASE_URL=postgresql://cis_user:secure_password_here@localhost:5432/cis_db
```

### 4. Database Migrations

Initialize the database schema:

```bash
npm run db:push
```

This command creates all necessary tables and relations.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

## Default Credentials

For initial testing:

**Admin Account:**
- Email: `admin@cis.com`
- Password: `admin`

**OTP Code (Testing):** `123654`

⚠️ **Change these credentials immediately in production!**

## Usage

### Admin Login
1. Navigate to http://localhost:5000/admin/login
2. Enter `admin@cis.com` and `admin`
3. Access the admin dashboard

### Member Registration
1. Navigate to http://localhost:5000
2. Enter IC Number and Email
3. Click "Continue to Profile"
4. Complete profile information
5. Accept PDPA consent
6. Submit

## Project Structure

```
.
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and query client
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                 # Backend (Express)
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database layer
│   ├── db.ts              # Database connection
│   └── vite.ts            # Vite dev server integration
├── shared/                 # Shared types and contracts
│   ├── schema.ts          # Drizzle ORM schema
│   └── routes.ts          # API route definitions
├── migrations/            # Database migrations (auto-generated)
└── .env                   # Environment variables (not committed)
```

## API Endpoints

### Admin Endpoints

```
POST   /api/admin/login           - Admin login
POST   /api/admin/logout          - Admin logout
GET    /api/admin/me              - Get current admin

GET    /api/members               - List members (paginated)
POST   /api/members/pre-register  - Pre-register member
GET    /api/members/:id           - Get member details
PUT    /api/members/:id           - Update member
DELETE /api/members/:id           - Delete member
GET    /api/members/export        - Export members to CSV

GET    /api/lookups/classes       - List classes
POST   /api/lookups/classes       - Create class
DELETE /api/lookups/classes/:id   - Delete class

GET    /api/lookups/supervisors   - List supervisors
POST   /api/lookups/supervisors   - Create supervisor
DELETE /api/lookups/supervisors/:id - Delete supervisor

GET    /api/lookups/ranks         - List ranks
POST   /api/lookups/ranks         - Create rank
DELETE /api/lookups/ranks/:id     - Delete rank

GET    /api/audit-logs            - Get audit logs
```

### Member Endpoints

```
POST   /api/auth/otp/request      - Request OTP code
POST   /api/auth/otp/verify       - Verify OTP code

GET    /api/member/me             - Get member profile
PUT    /api/member/me             - Update member profile
```

## Self-Hosted Deployment

### Production .env Example

```env
DATABASE_URL=postgresql://cis_prod_user:strong_password_12345@db.example.com:5432/cis_production
SESSION_SECRET=generate-long-random-string-use-openssl-rand-base64-32
NODE_ENV=production
PORT=5000
```

### Generate Secure Session Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String((Get-Random -InputObject (1..256) -Count 32))
```

### Running Behind Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
upstream cis {
    server localhost:5000;
}

server {
    listen 80;
    server_name cis.example.com;

    location / {
        proxy_pass http://cis;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Using PM2 for Process Management

```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cis',
    script: './node_modules/.bin/tsx',
    args: 'server/index.ts',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Database Backup

### Manual Backup

```bash
pg_dump -U username -h localhost cis_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup

```bash
psql -U username -h localhost cis_db < backup_20231223_120000.sql
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solution:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DATABASE_URL in .env file
- Ensure database user has correct permissions

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### OTP/Email Not Working

Currently, OTP verification is disabled for testing. The hardcoded OTP is `123654`. To implement real email sending, integrate with SendGrid, Resend, or similar email service.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## License

This project is proprietary software for Persatuan Seni Silat Cekak Malaysia.

## Support

For issues or questions, please contact the development team.

---

**Last Updated:** December 2024
**Version:** 1.0.0
