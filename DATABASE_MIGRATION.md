# Database Migration Guide - New Features

## Overview
This guide explains how to apply the database changes for the new features added to the KS Dental application.

## New Features Implemented

### 1. Prescription Enhancements
- **Investigation Field**: Optional field for recording investigations/tests recommended
- **Treatment Plan**: Multi-step treatment planning with point-wise display in printouts
- **Treatment Done**: Integrated billing - add treatments directly in prescription form

### 2. Medicine Sales Tracking
- Track medicine sales by brand
- Monthly and yearly sales reports
- Automatic sales recording when medicines are dispensed

## Database Migrations Required

### Step 1: Update Prescriptions Table
Run the following SQL file to add new fields to the prescriptions table:

```bash
mysql -u your_username -p your_database < php-backend/database/add-prescription-fields.sql
```

This adds:
- `investigation` (TEXT) - For test recommendations
- `treatment_plan` (JSON) - For treatment steps
- `treatment_done` (JSON) - For completed treatments with pricing

### Step 2: Add Medicine Sales Tracking
Run the following SQL file to create the sales tracking system:

```bash
mysql -u your_username -p your_database < php-backend/database/add-medicine-sales.sql
```

This creates:
- `medicine_sales` table - Tracks all medicine sales
- `monthly_sales_by_brand` view - Monthly sales summary by brand
- `yearly_sales_by_brand` view - Yearly sales summary by brand

## For Local Development

If you're using the embedded SQLite/demo mode, these migrations will be applied automatically on next start.

## Features Explanation

### Investigation Field
- Located after Medical History in the prescription form
- Optional field
- Records any recommended tests (X-ray, CBCT, Blood tests, etc.)

### Treatment Plan
- Located after Diagnosis in the prescription form
- Add multiple treatment steps
- Each step appears as a numbered point in the printout
- Optional - can be left empty if not needed

### Treatment Done
- Replaces the separate bill page workflow
- Add treatments/services directly in the prescription
- Automatically generates bill data
- Print prescription with billing information included
- Services include all dental procedures from the bill form

### Sales Tracking (Future Enhancement)
- Automatically tracks medicine dispensing
- View sales by brand/company
- Monthly and yearly reports
- Revenue analytics

## Backup Recommendation

**IMPORTANT**: Always backup your database before running migrations!

```bash
mysqldump -u your_username -p your_database > backup_$(date +%Y%m%d).sql
```

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Remove new prescription fields
ALTER TABLE prescriptions 
DROP COLUMN IF EXISTS investigation,
DROP COLUMN IF EXISTS treatment_plan,
DROP COLUMN IF EXISTS treatment_done;

-- Remove sales tracking tables/views
DROP VIEW IF EXISTS monthly_sales_by_brand;
DROP VIEW IF EXISTS yearly_sales_by_brand;
DROP TABLE IF EXISTS medicine_sales;
```

## Support

If you encounter any issues with the migration, check:
1. Database user has ALTER, CREATE permissions
2. Database connection is properly configured in `.env`
3. No data conflicts exist in existing records

For questions, refer to SETUP_INSTRUCTIONS.md or contact support.
