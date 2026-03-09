# Where to See Payment Installments in Your UI

## Overview

The payment installment system can be integrated into **3 main places** in your application:

---

## 1. ✅ Patient Details Modal (RECOMMENDED - Easiest)

**Location:** Admin → Patients → Click on any patient

This is where you already show payment summary. You can add the detailed payment history here.

### Current View:
```
Patient Details Modal
├── Patient Information
├── Medical Summary
│   └── Payment Summary
│       ├── Total Paid: ₹10,000
│       └── Total Pending: ₹25,000    ← Currently just shows totals
└── Prescription History
```

### Enhanced View (With Installments):
```
Patient Details Modal
├── Patient Information
├── Medical Summary
│   └── Payment Summary
│       ├── Total Paid: ₹10,000
│       └── Total Pending: ₹25,000
└── Prescription History
    └── For each prescription with bills:
        ├── Bill Details
        ├── Payment History ⭐ NEW
        │   ├── Payment 1: ₹5,000 (Feb 1)
        │   ├── Payment 2: ₹5,000 (Mar 1)
        │   └── [Add Payment] button
        └── Treatment details
```

### Integration Code:

**File:** `app/admin/patients/page.tsx`

Add this import at the top:
```tsx
import { BillHistoryWithPayments } from "@/components/BillHistoryWithPayments";
```

Replace the PrescriptionHistory section (around line 530) with:
```tsx
{/* Prescription History with Bills and Payments */}
<div className="mt-6">
  <h4 className="text-lg font-semibold mb-4">Prescription & Payment History</h4>
  
  {selectedPatient.prescriptions.map((prescription) => (
    <div key={prescription.id} className="mb-6">
      {/* Prescription Details */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h5 className="font-semibold">Prescription: {new Date(prescription.prescription_date).toLocaleDateString()}</h5>
        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
      </div>
      
      {/* Bills with Payment History */}
      {prescription.bills && prescription.bills.length > 0 && (
        <BillHistoryWithPayments 
          bills={prescription.bills}
          onBillUpdated={() => {
            // Refresh patient data
            fetchPatients();
          }}
        />
      )}
    </div>
  ))}
</div>
```

**This shows:**
- Each prescription
- All bills for that prescription
- Payment history for each bill
- "Add Payment" button for pending payments

---

## 2. ✅ Prescription Page (After Bill Generation)

**Location:** Admin → Prescription → Generate Bill → View Payment History

After generating a bill, show payment tracking on the same page.

### Current Flow:
```
Prescription Page
└── Generate Bill → Shows payment modal → Print bill → Done
```

### Enhanced Flow:
```
Prescription Page
└── Generate Bill 
    └── Shows Bill Summary
        ├── Total: ₹35,000
        ├── Paid: ₹5,000
        ├── Balance: ₹30,000
        └── Payment History ⭐
            ├── Payment 1: ₹5,000 (Today)
            └── [Add Another Payment] button
```

### Integration Code:

**File:** `app/admin/prescription/page.tsx`

After the bill is generated (around line 1560, after payment modal), add:

```tsx
{/* Payment History Section - Shows after bill generation */}
{currentBill && (
  <div className="mt-6">
    <PaymentHistory
      billId={currentBill.id}
      totalAmount={currentBill.total_amount}
      paidAmount={currentBill.paid_amount}
      balanceAmount={currentBill.balance_amount}
      onPaymentAdded={() => {
        // Refresh bill data
        getBillByPrescriptionId(prescriptionId).then(setCurrentBill);
      }}
      onAddPaymentClick={() => {
        // Handle add payment
      }}
    />
  </div>
)}
```

---

## 3. ✅ Create Dedicated "Installments" Page (BEST for Daily Tracking)

**Location:** Admin → Installments (New page)

Create a dedicated page to see ALL patients with pending payments.

**File:** Create `app/admin/installments/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { billService } from '@/services/bills';
import { BillHistoryWithPayments } from '@/components/BillHistoryWithPayments';

export default function InstallmentsPage() {
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBills();
  }, []);

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      const allBills = await billService.getAll();
      
      // Filter bills with pending/partial payments
      const pending = allBills.filter(
        bill => bill.payment_status === 'PARTIAL' || bill.payment_status === 'PENDING'
      );
      
      setPendingBills(pending);
    } catch (error) {
      console.error('Error fetching pending bills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Installments</h1>
        <p className="text-gray-600 mt-2">
          Track all pending payments and installments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600">Pending Bills</p>
          <p className="text-2xl font-bold text-orange-600">{pendingBills.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{pendingBills.reduce((sum, b) => sum + b.paid_amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{pendingBills.reduce((sum, b) => sum + b.balance_amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bills List with Payment History */}
      <div className="space-y-6">
        {pendingBills.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No pending payments! 🎉</p>
          </div>
        ) : (
          <BillHistoryWithPayments 
            bills={pendingBills}
            onBillUpdated={fetchPendingBills}
          />
        )}
      </div>
    </div>
  );
}
```

**Add to Sidebar Navigation:**

Edit `components/sidebar.tsx` to add a new menu item:

```tsx
{
  title: "Installments",
  icon: CreditCard,
  href: "/admin/installments",
}
```

---

## 4. Visual Demo - How It Looks

### Patient Details View:
```
╔════════════════════════════════════════════════╗
║  Patient: Amit Sharma                         ║
║  Phone: 9876543210                            ║
╠════════════════════════════════════════════════╣
║  Payment Summary                              ║
║  • Total Paid: ₹15,000                        ║
║  • Total Pending: ₹20,000                     ║
╠════════════════════════════════════════════════╣
║  Bill #B1234 - Braces Treatment               ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Total: ₹35,000                           │ ║
║  │ Paid: ₹15,000 ✅                         │ ║
║  │ Balance: ₹20,000 ⚠️                      │ ║
║  │                                          │ ║
║  │ [View Payment History ▼]                 │ ║
║  └──────────────────────────────────────────┘ ║
║                                               ║
║  When clicked ▼                               ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Payment History (3 transactions)         │ ║
║  ├──────────────────────────────────────────┤ ║
║  │ ₹5,000 • Cash    Feb 1, 2026            │ ║
║  │ ₹5,000 • UPI     Mar 1, 2026            │ ║
║  │ ₹5,000 • Cash    Apr 1, 2026            │ ║
║  ├──────────────────────────────────────────┤ ║
║  │           [+ Add Payment]                │ ║
║  └──────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════╝
```

### Dedicated Installments Page:
```
╔════════════════════════════════════════════════╗
║  Payment Installments Dashboard               ║
╠════════════════════════════════════════════════╣
║  ┌─────────┐  ┌─────────┐  ┌─────────┐       ║
║  │Pending  │  │Collected│  │Pending  │       ║
║  │   12    │  │ ₹45,000 │  │₹1,20,000│       ║
║  └─────────┘  └─────────┘  └─────────┘       ║
╠════════════════════════════════════════════════╣
║  Pending Payments:                            ║
║                                               ║
║  Amit Sharma - Braces                         ║
║  Balance: ₹20,000  [Add Payment] [View ▼]    ║
║                                               ║
║  Priya Patel - Root Canal                     ║
║  Balance: ₹3,000   [Add Payment] [View ▼]    ║
║                                               ║
║  Rahul Kumar - Implant                        ║
║  Balance: ₹15,000  [Add Payment] [View ▼]    ║
╚════════════════════════════════════════════════╝
```

---

## Quick Start - What to Do Now:

### Option A: Quick Integration (5 minutes)
1. Open `app/admin/patients/page.tsx`
2. Import `BillHistoryWithPayments`
3. Replace the bill display section with the component
4. Test by clicking on a patient

### Option B: Dedicated Page (10 minutes)
1. Create `app/admin/installments/page.tsx` (copy code above)
2. Add menu item to sidebar
3. Visit `/admin/installments` to see all pending payments

### Option C: Both (15 minutes)
Do both Option A and B for complete coverage

---

## Summary

**Where you'll see it:**
1. ✅ **Patient Details Modal** - Best for viewing specific patient history
2. ✅ **Prescription Page** - After generating a bill
3. ✅ **Dedicated Installments Page** - Best for daily tracking of all pending payments

**What you can do:**
- View all payments for a bill
- Add new payments
- See updated balances instantly
- Track payment methods and dates
- Delete incorrect payments

**Best Recommendation:**
Start with **Option B (Dedicated Installments Page)** - it's the easiest to test and gives you a complete overview of all pending payments in one place!

