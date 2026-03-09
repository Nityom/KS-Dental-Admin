# Quick Fix for 500 Error

## Problem
You're getting a 500 error because the database doesn't have the new columns (investigation, treatment_plan, treatment_done).

## Solution - Choose ONE method:

### Method 1: Run Migration SQL (Recommended)

If you're using MySQL/MariaDB, run this command:

```bash
mysql -u your_username -p dental_db < php-backend/database/add-prescription-fields.sql
```

Replace `your_username` with your database username and enter your password when prompted.

### Method 2: Quick Manual Fix (Alternative)

1. Access your database using phpMyAdmin or MySQL command line
2. Run these SQL commands one by one:

```sql
USE dental_db;

ALTER TABLE prescriptions 
ADD COLUMN investigation TEXT AFTER medical_history;

ALTER TABLE prescriptions 
ADD COLUMN treatment_plan JSON AFTER diagnosis;

ALTER TABLE prescriptions 
ADD COLUMN treatment_done JSON AFTER medicines;
```

### Method 3: Temporary Workaround (If you can't access database right now)

Until you can run the migration, you can temporarily disable the new features:

1. Comment out the new fields in the prescription form
2. Or just avoid filling the Investigation, Treatment Plan, and Treatment Done sections
3. The old fields (Chief Complaint, Medical History, Diagnosis, Medicines) will work fine

## How to Check if Migration Worked

After running the migration, you can verify by running:

```sql
DESCRIBE prescriptions;
```

You should see `investigation`, `treatment_plan`, and `treatment_done` columns in the output.

## For Medicine Sales Tracking

Also run (optional - for future sales analytics):

```bash
mysql -u your_username -p dental_db < php-backend/database/add-medicine-sales.sql
```

## Still Getting Errors?

If you're still getting 500 errors, check:

1. Your database connection settings in `.env` file
2. PHP error logs at `php-backend/error.log`
3. Browser console for more detailed error messages

## Contact

If you need help, provide:
- The exact error message from browser console
- PHP error log content (if available)
- Your MySQL version (run `SELECT VERSION();`)
