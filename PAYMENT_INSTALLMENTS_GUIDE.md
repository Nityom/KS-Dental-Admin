# Payment Installment System

## Overview

This system allows you to track partial payments for long-term procedures (like braces that cost ₹35,000 over 1 year, with payments of ₹5,000 per month).

## Features

✅ Track multiple payments for a single bill  
✅ Automatic balance calculation  
✅ Payment history with dates and methods  
✅ Support multiple payment methods (Cash, UPI, Card, etc.)  
✅ Add notes to each payment  
✅ Delete payments (with automatic balance recalculation)  
✅ Visual payment summary  

---

## Installation Steps

### 1. Run the Database Migration

Execute the SQL migration to create the `payment_transactions` table:

```bash
# Navigate to your MySQL database
mysql -u root -p dental_db

# Run the migration
source php-backend/database/add-payment-transactions.sql;

# Verify the table was created
SHOW TABLES;
DESCRIBE payment_transactions;
```

Or use phpMyAdmin:
1. Open phpMyAdmin
2. Select `dental_db` database
3. Click "SQL" tab
4. Copy and paste the contents of `php-backend/database/add-payment-transactions.sql`
5. Click "Go"

---

## Usage Guide

### Example Scenario: Braces Treatment

**Patient:** Rahul Kumar  
**Treatment:** Braces  
**Total Cost:** ₹35,000  
**Payment Plan:** ₹5,000 per month for 7 months

#### Step 1: Create the Bill

When creating the bill for braces:
- **Total Amount:** 35000
- **Paid Amount:** 5000 (first payment)
- **Payment Status:** Will automatically be set to "PARTIAL"
- **Balance:** ₹30,000

#### Step 2: Record Monthly Payments

When the patient visits and pays ₹5,000:

1. **View the Bill** in the Bill History section
2. **Click "Add Payment"** button in the Payment History card
3. **Fill in the details:**
   - Amount: 5000
   - Payment Method: Cash/UPI/Card
   - Payment Date: (today's date)
   - Notes: "Month 2 payment" (optional)
4. **Click "Add Payment"**

The system will automatically:
- Record the payment transaction
- Update the bill's paid amount (₹10,000)
- Update the balance (₹25,000)
- Update payment status to "PARTIAL" (or "PAID" when fully paid)

#### Step 3: View Payment History

The Payment History card shows:
- **Total Amount:** ₹35,000
- **Paid:** ₹10,000 (after 2 payments)
- **Balance:** ₹25,000
- **Transaction List:** All payments with dates and amounts

---

## How to Integrate into Bill Pages

### Option 1: Add to BillHistory Component

Update `components/BillHistory.tsx` to include payment history:

```tsx
import PaymentHistory from "@/components/PaymentHistory";
import AddPaymentDialog from "@/components/AddPaymentDialog";
import { useState } from "react";

// Inside your bill detail view:
const [showAddPayment, setShowAddPayment] = useState(false);
const [selectedBill, setSelectedBill] = useState(null);

// Add this after bill details:
{selectedBill && (
  <>
    <PaymentHistory
      billId={selectedBill.id}
      totalAmount={selectedBill.total_amount}
      paidAmount={selectedBill.paid_amount}
      balanceAmount={selectedBill.balance_amount}
      onPaymentAdded={() => {
        // Refresh bill data
        fetchBills();
      }}
      onAddPaymentClick={() => setShowAddPayment(true)}
    />
    
    <AddPaymentDialog
      open={showAddPayment}
      onOpenChange={setShowAddPayment}
      billId={selectedBill.id}
      patientId={selectedBill.patient_id}
      balanceAmount={selectedBill.balance_amount}
      onPaymentAdded={() => {
        fetchBills();
        setShowAddPayment(false);
      }}
    />
  </>
)}
```

### Option 2: Create a Dedicated Installments Page

Create `app/admin/installments/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import PaymentHistory from "@/components/PaymentHistory";
import { billService } from "@/services/bills";

export default function InstallmentsPage() {
  const [bills, setBills] = useState([]);
  
  // Fetch all bills with pending/partial payments
  useEffect(() => {
    async function fetchPendingBills() {
      const allBills = await billService.getAll();
      const pending = allBills.filter(
        b => b.payment_status === 'PARTIAL' || b.payment_status === 'PENDING'
      );
      setBills(pending);
    }
    fetchPendingBills();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Installments</h1>
      {bills.map(bill => (
        <PaymentHistory
          key={bill.id}
          billId={bill.id}
          totalAmount={bill.total_amount}
          paidAmount={bill.paid_amount}
          balanceAmount={bill.balance_amount}
          onPaymentAdded={() => {/* refresh */}}
          onAddPaymentClick={() => {/* show dialog */}}
        />
      ))}
    </div>
  );
}
```

---

## API Endpoints

### Get Payments for a Bill
```
GET /php-backend/api/payment-transactions.php?bill_id={billId}
```

### Get Payments for a Patient
```
GET /php-backend/api/payment-transactions.php?patient_id={patientId}
```

### Create a Payment
```
POST /php-backend/api/payment-transactions.php
Content-Type: application/json

{
  "bill_id": "bill-uuid",
  "patient_id": "patient-uuid",
  "amount": 5000,
  "payment_method": "Cash",
  "payment_date": "2026-02-21",
  "notes": "Monthly installment"
}
```

### Update a Payment
```
PUT /php-backend/api/payment-transactions.php?id={paymentId}
Content-Type: application/json

{
  "amount": 5500,
  "payment_method": "UPI",
  "notes": "Updated amount"
}
```

### Delete a Payment
```
DELETE /php-backend/api/payment-transactions.php?id={paymentId}
```

---

## Database Schema

### payment_transactions Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| bill_id | VARCHAR(36) | Foreign key to bills table |
| patient_id | VARCHAR(36) | Foreign key to patients table |
| amount | DECIMAL(10,2) | Payment amount |
| payment_method | VARCHAR(50) | Cash, UPI, Card, etc. |
| payment_date | DATE | Date of payment |
| notes | TEXT | Optional notes |
| created_by | VARCHAR(255) | User who recorded the payment |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

---

## Common Workflows

### 1. Patient Makes Partial Payment
1. Open the bill
2. Click "Add Payment"
3. Enter amount and method
4. System updates balance automatically

### 2. View All Pending Payments
```php
// In bills.php, filter by status
$query = "SELECT * FROM bills WHERE payment_status = 'PARTIAL' OR payment_status = 'PENDING'";
```

### 3. Generate Payment Receipt
You can extend the system to print payment receipts:
- Show payment details
- Show remaining balance
- Include payment history

### 4. Send Payment Reminders
Query pending bills and send SMS/email reminders:
```sql
SELECT b.*, p.name, p.phone_number, b.balance_amount
FROM bills b
JOIN patients p ON b.patient_id = p.id
WHERE b.payment_status IN ('PENDING', 'PARTIAL')
  AND b.balance_amount > 0;
```

---

## Benefits

1. **Clear Payment Tracking:** See exactly when each payment was made
2. **Automatic Calculations:** No manual balance updates needed
3. **Payment History:** Full audit trail of all transactions
4. **Flexible Payments:** Accept any amount (up to balance)
5. **Multiple Methods:** Track Cash, UPI, Card, etc. separately
6. **Patient Trust:** Show transparent payment records

---

## Tips

- Always update payment_date to the actual payment date
- Use notes to record important details (e.g., "Check #1234")
- Regular payments build patient trust
- Review pending payments weekly
- Consider setting up payment reminders for patients

---

## Troubleshooting

### Payment doesn't update balance
- Check that bill_id exists in bills table
- Verify payment amount is positive
- Check browser console for errors

### Can't delete payment
- Ensure you have the correct payment ID
- Check database foreign key constraints
- Verify user permissions

### Balance calculation wrong
- The balance is auto-calculated: `total_amount - paid_amount`
- Check all payments are recorded correctly
- Verify no duplicate payments

---

## Future Enhancements

- 📧 Email payment receipts
- 📱 SMS payment reminders
- 📊 Payment analytics dashboard
- 📅 Scheduled payment plans
- 💳 Online payment integration
- 📄 PDF payment history export

---

## Support

For issues or questions:
1. Check error logs in browser console
2. Verify database connection
3. Check API responses in Network tab
4. Review this documentation

---

**Last Updated:** February 21, 2026  
**Version:** 1.0
