# Printable Bill Documentation

## Overview

The printable bill feature provides a professional, print-ready invoice layout matching the "KS Dental & Aesthetic Clinic" design with a gold color scheme. This implementation includes:

1. **PrintableBill Component** - A React component for displaying beautifully formatted bills
2. **Print Bill Page** - A dedicated page at `/print-bill` for viewing and printing bills
3. **Integration** - Updated existing components to include "View Printable Bill" buttons

## Features

- **Professional Layout**: Matches the KS Dental & Aesthetic Clinic design with proper formatting
- **Gold Color Scheme**: Uses amber/gold color (#D4A528) for clinic branding
- **Print-Optimized**: Configured for A4 paper with proper margins and page breaks
- **Amount in Words**: Automatically converts total amount to Indian number format words
- **Responsive Design**: Works well on screen and in print
- **Browser Print**: Uses native browser print functionality for best results

## Usage

### 1. Direct Component Usage

```tsx
import PrintableBill from '@/components/PrintableBill';

const MyComponent = () => {
  return (
    <PrintableBill
      billNumber="SDC986818419"
      billDate="18/02/2026"
      patientName="Dr Sandhya Kumari"
      patientPhone="9525948993"
      items={[
        {
          description: "CONSULTATION FEES",
          quantity: 1,
          unitPrice: 250,
          unit: "EACH",
          total: 250,
        },
        {
          description: "IOPAR",
          quantity: 1,
          unitPrice: 200,
          unit: "EACH",
          total: 200,
        }
      ]}
      subtotal={4623}
      total={4623}
      amountPaid={4623}
      balance={0}
      showPrintButton={true}
    />
  );
};
```

### 2. Using the Print Bill Page

Access printable bills via URL:
```
/print-bill?billId=123
```

This page:
- Fetches bill data from the backend
- Displays the formatted bill
- Includes a "Print Bill" button
- Auto-formats dates and currency

### 3. Integration in Existing Components

#### BillForm Component
After saving a bill, users can click:
- **"View Printable Bill"** (Amber button) - Opens the printable bill in a new tab
- **"Print Bill"** (Blue button) - Opens PDF directly for printing
- **"Download Bill"** (Green button) - Downloads the PDF

#### BillSummary Component
Shows bill summary with action buttons:
- **"Printable Bill"** - Opens the new printable layout
- **"View PDF"** - Opens the PDF version
- **"Download"** - Downloads the PDF
- **"Print"** - Prints the PDF

#### BillActionButtons Component
Provides quick actions for saved bills:
- **"View Printable Bill"** - Opens the new layout
- **"Generate Bill PDF"** - Creates PDF version
- **"Download Bill"** - Downloads the PDF
- **"Print Bill"** - Prints the PDF

## Customization

### Clinic Details

To customize the clinic name, address, and other details, edit the PrintableBill component:

```tsx
// In components/PrintableBill.tsx
<h1 className="text-4xl font-bold text-[#D4A528] mb-2">
  Your Clinic Name
</h1>
<p className="text-xs text-gray-700">
  Your clinic address and details
</p>
<p className="text-xs text-gray-700 mt-1">
  Mobile: Your phone number
</p>
```

### Color Scheme

The current colors are:
- **Primary Gold**: `#D4A528` - Used for clinic name and headers
- **Text**: Black and gray tones
- **Borders**: Gray borders for professional appearance

To change colors, update the className values in `components/PrintableBill.tsx`.

### Terms and Conditions

Default: "All disputes are subject to Muzaffarpur jurisdiction only"

Custom terms can be passed via props:
```tsx
<PrintableBill
  termsAndConditions="Custom terms and conditions text"
  // ... other props
/>
```

## Print Settings

For best results when printing:
- **Paper Size**: A4
- **Margins**: 10mm (configured via @page CSS rule)
- **Orientation**: Portrait
- **Scale**: 100% (default)
- **Background Graphics**: Enable in browser print settings

## API Integration

The `/print-bill` page fetches data from:
```
{NEXT_PUBLIC_API_URL}/bills.php?id={billId}
```

Expected response format:
```json
{
  "data": {
    "id": "123",
    "bill_number": "SDC123",
    "bill_date": "2026-02-18",
    "patient_name": "John Doe",
    "patient_phone": "1234567890",
    "patient_age": "35",
    "patient_sex": "M",
    "total_amount": "5000",
    "paid_amount": "5000",
    "balance_amount": "0",
    "discount_amount": "0",
    "items": [
      {
        "description": "Dental Checkup",
        "quantity": "1",
        "unit_price": "500",
        "total": "500",
        "item_type": "consultation"
      }
    ]
  }
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Print**: All modern browsers with print preview

## Technical Details

### Component Props (PrintableBill)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| billNumber | string | Yes | Invoice/bill number |
| billDate | string | Yes | Date of bill (format: DD/MM/YYYY) |
| patientName | string | Yes | Patient's full name |
| patientPhone | string | No | Patient's phone number |
| patientAge | string | No | Patient's age |
| patientSex | string | No | Patient's gender |
| items | BillItem[] | Yes | Array of bill items |
| subtotal | number | Yes | Subtotal amount |
| discount | number | No | Discount amount (default: 0) |
| total | number | Yes | Final total amount |
| amountPaid | number | No | Amount paid (default: 0) |
| balance | number | No | Balance due (default: 0) |
| termsAndConditions | string | No | Custom T&C text |
| showPrintButton | boolean | No | Show/hide print button (default: true) |

### BillItem Interface

```typescript
interface BillItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string; // e.g., "EACH", "PCS", "STRIP"
  total: number;
  itemType?: 'medicine' | 'procedure' | 'consultation' | 'other';
}
```

## Files Created/Modified

### New Files:
- `components/PrintableBill.tsx` - Main printable bill component
- `app/print-bill/page.tsx` - Page for viewing printable bills
- `PRINTABLE_BILL_DOCS.md` - This documentation

### Modified Files:
- `components/BillForm.tsx` - Added "View Printable Bill" button
- `components/BillSummary.tsx` - Added "Printable Bill" button
- `components/BillActionButtons.tsx` - Added "View Printable Bill" button

## Example Screenshots

The bill layout includes:
1. Header with "BILL OF SUPPLY" and "ORIGINAL FOR RECIPIENT"
2. Clinic name in gold/amber color
3. Clinic address and contact details
4. Invoice number and date
5. Bill to section with patient details
6. Items table with QTY, RATE, and AMOUNT columns
7. Subtotal, discount, and total sections
8. Terms and conditions
9. Amount in words (Indian numbering system)
10. Authorized signatory section

## Support

For issues or customization requests, please refer to the component source files or contact the development team.
