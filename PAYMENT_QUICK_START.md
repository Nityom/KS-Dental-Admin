# Quick Start: Payment Installments for Braces & Long-term Treatments

## What This Solves

You can now track partial payments when a patient pays for expensive treatments (like ₹35,000 braces) in installments over multiple visits (₹5,000 per month).

---

## Setup (One-time - 2 minutes)

### Step 1: Run Database Migration

Open your MySQL tool (phpMyAdmin or command line):

```sql
-- Copy and paste this into SQL tab in phpMyAdmin
-- OR run: mysql -u root -p dental_db < php-backend/database/add-payment-transactions.sql

USE dental_db;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    bill_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    payment_date DATE NOT NULL,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_bill_id (bill_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_payment_date (payment_date)
);
```

### Step 2: Verify Installation

Check that the table was created:

```sql
SHOW TABLES LIKE 'payment_transactions';
-- Should show the table

DESCRIBE payment_transactions;
-- Should show all columns
```

---

## How to Use (Daily Workflow)

### Scenario: Patient Getting Braces

**Patient:** Amit Sharma  
**Treatment:** Braces  
**Total:** ₹35,000  
**Plan:** ₹5,000 per month

#### First Visit (Creating the Bill)

1. Create prescription as usual
2. Generate bill with:
   - Total Amount: **35000**
   - Paid Amount: **5000** (first payment today)
   - Items: Braces, consultation, etc.
3. Bill is saved with status "PARTIAL" (₹30,000 balance)

#### Second Visit (One Month Later - Add Payment)

1. **Open the bill** (in your bill history or prescription view)
2. **Click "View Payment History"** to expand
3. **Click "Add Payment"** button
4. Fill in:
   - **Amount:** 5000
   - **Method:** Cash (or UPI/Card)
   - **Date:** February 21, 2026
   - **Notes:** "Month 2 payment" (optional)
5. **Click "Add Payment"**

**What happens automatically:**
- ✅ Payment is recorded
- ✅ Paid amount updates to ₹10,000
- ✅ Balance updates to ₹25,000
- ✅ Status stays "PARTIAL"

#### Subsequent Visits

Repeat Step 4 above each time patient pays. The system tracks everything!

#### Final Payment (Status Changes to PAID)

When the patient pays the last ₹5,000:
- ✅ Total paid becomes ₹35,000
- ✅ Balance becomes ₹0
- ✅ Status automatically changes to "PAID"

---

## Where to See Payment History

### Option 1: In Bill History (Expand)

```tsx
// Your existing page - just import the new component
import { BillHistoryWithPayments } from "@/components/BillHistoryWithPayments";

// Replace old BillHistory with:
<BillHistoryWithPayments 
  bills={bills} 
  onBillUpdated={() => fetchBills()} 
/>
```

Each bill card now has:
- "View Payment History" button
- When expanded: Shows all payments with dates
- "Add Payment" button if balance exists

### Option 2: Standalone Payment View

Create a dedicated installments page to see ALL pending payments at once.

---

## Example: Complete Workflow

**Day 1 - Feb 1, 2026:**
- Patient starts braces
- Create bill: ₹35,000 total
- Patient pays ₹5,000
- Record: Paid ₹5,000, Balance ₹30,000

**Day 30 - Mar 1, 2026:**
- Patient visits for adjustment
- Click "Add Payment"
- Enter ₹5,000 (Cash)
- New balance: ₹25,000

**Day 60 - Apr 1, 2026:**
- Patient visits
- Add ₹5,000 payment
- New balance: ₹20,000

_...continue monthly..._

**Day 210 - Aug 1, 2026:**
- Patient makes final ₹5,000 payment
- Balance becomes ₹0
- Status changes to "PAID"
- Treatment complete! 🎉

---

## Payment Methods Supported

- Cash
- UPI (PhonePe, GPay, etc.)
- Card (Credit/Debit)
- Net Banking
- Cheque
- Other

---

## Key Benefits for Your Clinic

1. **Never Forget Balances:** See exactly how much each patient owes
2. **Complete History:** Know when and how much was paid each time
3. **Patient Trust:** Show them their payment records anytime
4. **No Manual Calculation:** System auto-updates everything
5. **Flexible Amounts:** Patient can pay any amount (not fixed installments)

---

## Tips

✅ **Always update payment date** to actual payment date (not today's date if they paid yesterday)  
✅ **Add notes** like "Month 3 payment" or "Partial payment via UPI"  
✅ **Check balance** before adding payment (can't exceed balance)  
✅ **Review weekly** - check all PARTIAL bills to follow up  
✅ **Keep receipts** - you can print payment history for patients  

---

## Common Questions

**Q: Can patient pay more than the monthly amount?**  
A: Yes! They can pay any amount up to the remaining balance.

**Q: What if patient pays less one month?**  
A: No problem! Just record whatever they paid. Balance updates automatically.

**Q: Can I edit a payment?**  
A: Currently, you can delete and re-add. Update functionality coming soon.

**Q: How to see all pending payments across all patients?**  
A: Filter bills by status "PARTIAL" - shows everyone with balances.

**Q: Does this work for treatments other than braces?**  
A: Yes! Works for any treatment - implants, RCT, dentures, etc.

---

## Visual Example

```
Bill for Braces - ₹35,000
┌─────────────────────────────┐
│ Total:    ₹35,000           │
│ Paid:     ₹15,000 ✅        │
│ Balance:  ₹20,000 ⚠️        │
│                             │
│ [View Payment History ▼]    │
└─────────────────────────────┘

When expanded:
┌─────────────────────────────┐
│ Payment History             │
│ ───────────────────────────│
│ ₹5,000  •  Cash             │
│ Feb 1, 2026                 │
│ ───────────────────────────│
│ ₹5,000  •  UPI              │
│ Mar 1, 2026                 │
│ ───────────────────────────│
│ ₹5,000  •  Cash             │
│ Apr 1, 2026                 │
│ ───────────────────────────│
│         [Add Payment +]     │
└─────────────────────────────┘
```

---

## Files Created

✅ `php-backend/database/add-payment-transactions.sql` - Database schema  
✅ `php-backend/api/payment-transactions.php` - API endpoints  
✅ `services/payment-transactions.ts` - Frontend service  
✅ `components/PaymentHistory.tsx` - View payments  
✅ `components/AddPaymentDialog.tsx` - Add new payment  
✅ `components/BillHistoryWithPayments.tsx` - Integrated view  
✅ `components/ui/dialog.tsx` - Dialog component  

---

## Need Help?

1. Check `PAYMENT_INSTALLMENTS_GUIDE.md` for full documentation
2. Test with a sample patient first
3. Verify database connection works
4. Check browser console for errors

---

**Ready to use!** 🚀 Start tracking those installment payments today!

---

**Last Updated:** February 21, 2026
