# Migration Guide: Supabase to PHP + MySQL Backend

This guide will help you migrate your Titanium Dental Clinic application from Supabase to a PHP + MySQL backend.

## Overview

Your application has been restructured to use:
- **Frontend**: Next.js (unchanged)
- **Backend**: PHP + MySQL (replacing Supabase)
- **API Communication**: REST API endpoints

## What Has Changed

### 1. Backend Structure
- Created `php-backend/` directory with PHP API endpoints
- All Supabase calls replaced with REST API calls
- Session-based authentication instead of Supabase Auth

### 2. Service Layer Updates
All service files in `services/` directory have been updated:
- `adminuser.ts` - Authentication services
- `patients.ts` - Patient management
- `prescription.ts` - Prescription management
- `bills.ts` - Billing services
- `medicine.ts` - Medicine/inventory management
- `inventory.ts` - Inventory services

### 3. New Files Created
- `lib/apiClient.ts` - HTTP client for API communication
- `php-backend/config/database.php` - Database connection
- `php-backend/config/cors.php` - CORS configuration
- `php-backend/config/helpers.php` - Helper functions
- `php-backend/api/*.php` - API endpoints
- `php-backend/database/schema.sql` - MySQL database schema

## Setup Instructions

### Step 1: Install MySQL

1. Download and install MySQL Server from https://dev.mysql.com/downloads/mysql/
2. During installation, set a root password (remember this!)
3. Start MySQL service

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE titanium_db;

# Exit MySQL
exit;
```

### Step 3: Import Database Schema

```bash
cd php-backend
mysql -u root -p titanium_db < database/schema.sql
```

### Step 4: Configure PHP Backend

1. Navigate to `php-backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and update database credentials:
   ```
   DB_HOST=localhost
   DB_NAME=titanium_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

### Step 5: Start PHP Server

```bash
cd php-backend
php -S localhost:8000 -t .
```

The PHP backend will run on `http://localhost:8000`

### Step 6: Configure Next.js Frontend

1. In the root directory, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. The file should contain:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

### Step 7: Start Next.js Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints Reference

### Authentication
- `POST /api/auth.php?action=signup` - Register new user
- `POST /api/auth.php?action=signin` - Login
- `POST /api/auth.php?action=signout` - Logout
- `GET /api/auth.php?action=current-user` - Get current user
- `POST /api/auth.php?action=reset-password` - Request password reset
- `POST /api/auth.php?action=update-password` - Update password

### Patients
- `GET /api/patients.php` - Get all patients
- `GET /api/patients.php?id={id}` - Get patient by ID
- `GET /api/patients.php?phone={phone}` - Get patient by phone
- `POST /api/patients.php` - Create new patient
- `PUT /api/patients.php?id={id}` - Update patient
- `DELETE /api/patients.php?id={id}` - Delete patient

### Prescriptions
- `GET /api/prescriptions.php` - Get all prescriptions
- `GET /api/prescriptions.php?search={term}` - Search prescriptions
- `GET /api/prescriptions.php?id={id}` - Get prescription by ID
- `POST /api/prescriptions.php` - Create prescription
- `PUT /api/prescriptions.php?id={id}` - Update prescription
- `DELETE /api/prescriptions.php?id={id}` - Delete prescription

### Bills
- `GET /api/bills.php` - Get all bills
- `GET /api/bills.php?id={id}` - Get bill by ID
- `GET /api/bills.php?prescription_id={id}` - Get bills by prescription
- `POST /api/bills.php` - Create bill
- `PUT /api/bills.php?id={id}` - Update bill
- `DELETE /api/bills.php?id={id}` - Delete bill

### Medicines
- `GET /api/medicines.php` - Get all medicines
- `GET /api/medicines.php?id={id}` - Get medicine by ID
- `POST /api/medicines.php` - Create medicine
- `PUT /api/medicines.php?id={id}` - Update medicine
- `DELETE /api/medicines.php?id={id}` - Delete medicine

## Database Schema

The MySQL database includes these tables:
- `users` - User authentication
- `password_reset_tokens` - Password reset functionality
- `patients` - Patient records
- `prescriptions` - Prescription records
- `bills` - Billing information
- `medicines` - Medicine/inventory items
- `reference_counter` - Auto-incrementing reference numbers

## Key Differences from Supabase

### 1. Authentication
- **Supabase**: JWT-based authentication
- **PHP**: Session-based authentication
- Users must sign up again (old Supabase auth won't transfer)

### 2. Auto-increment IDs
- **Supabase**: Used PostgreSQL sequences
- **PHP**: Uses `reference_counter` table for reference numbers

### 3. JSON Fields
- Both support JSON, but PHP requires manual encoding/decoding
- Handled automatically in the API layer

### 4. Real-time Features
- Supabase real-time subscriptions are not available
- You'll need to implement polling if you need real-time updates

## Migration Checklist

- [x] Create PHP backend structure
- [x] Create MySQL database schema
- [x] Implement authentication endpoints
- [x] Implement patient management endpoints
- [x] Implement prescription endpoints
- [x] Implement billing endpoints
- [x] Implement medicine/inventory endpoints
- [x] Update Next.js services to use REST API
- [ ] Install MySQL
- [ ] Create database
- [ ] Import schema
- [ ] Configure environment variables
- [ ] Test authentication
- [ ] Migrate existing data (if any)
- [ ] Test all features

## Data Migration (Optional)

If you have existing data in Supabase you want to keep:

1. Export data from Supabase using their dashboard or API
2. Convert the data to SQL INSERT statements
3. Import into MySQL database

Example:
```sql
INSERT INTO patients (id, reference_number, name, age, sex, phone_number, address)
VALUES 
  ('uuid-1', 'REF-000001', 'John Doe', '30', 'Male', '1234567890', '123 Main St'),
  ('uuid-2', 'REF-000002', 'Jane Smith', '25', 'Female', '0987654321', '456 Oak Ave');
```

## Troubleshooting

### PHP Server Won't Start
- Check if port 8000 is already in use
- Try a different port: `php -S localhost:8080 -t .`
- Update `NEXT_PUBLIC_API_URL` in `.env.local` accordingly

### CORS Errors
- Verify the frontend URL in `php-backend/config/cors.php`
- Make sure both servers are running

### Database Connection Errors
- Verify MySQL is running
- Check credentials in `php-backend/.env`
- Ensure database `titanium_db` exists

### Session Issues
- PHP sessions require cookies to be enabled
- Check browser console for cookie errors
- Ensure both frontend and backend are on localhost

## Production Deployment

For production deployment:

1. **PHP Backend**:
   - Use Apache or Nginx instead of PHP built-in server
   - Enable HTTPS
   - Update CORS to allow your production domain
   - Use environment variables for sensitive data

2. **Next.js Frontend**:
   - Build for production: `npm run build`
   - Update `NEXT_PUBLIC_API_URL` to production API URL
   - Deploy to Vercel, Netlify, or your preferred host

3. **MySQL Database**:
   - Use managed MySQL service (AWS RDS, Google Cloud SQL)
   - Enable SSL connections
   - Regular backups
   - Optimize for production workload

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check PHP error logs
3. Verify all environment variables are set correctly
4. Ensure both servers are running

## Next Steps

1. Remove old Supabase dependencies (optional):
   ```bash
   npm uninstall @supabase/supabase-js
   ```
2. Delete `lib/supabaseClient.ts` and `utils/supabase/` (after verifying everything works)
3. Remove Supabase environment variables from `.env.local`

Your application is now running on a PHP + MySQL backend! 🎉
