// app/api/generate-prescription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

interface ToothData {
  id: number;
  type: string;
  category: 'Permanent' | 'Deciduous';
  disease?: string;
}

interface MedicineEntry {
  name: string;
  dosage: string;
  duration: string;
  quantity?: number; // Quantity to dispense
}

interface PrescriptionData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  cc: string;  // Chief Complaint
  mh: string;  // Medical/Dental History
  de: string;  // Diagnosis
  advice: string;
  followupDate: string;
  medicines?: MedicineEntry[];
  // New fields from form
  dentalNotation: string;   // Formatted string of selected teeth
  clinicalNotes: string;    // Combined diagnosis and oral exam notes
  selectedTeeth: ToothData[];
  investigation?: string;   // Investigation/Tests
  treatmentPlan?: string[]; // Treatment plan steps
}

export async function POST(req: NextRequest) {
  try {
    // Log the request details for debugging
    console.log('Prescription API called');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const data: PrescriptionData = await req.json();
    console.log('Received prescription data:', data);
    
    // Load the template PDF
    const templatePath = path.join(process.cwd(), 'public', 'prescription-template1.pdf');
    const medicineTemplatePath = path.join(process.cwd(), 'public', 'prescription-template2.pdf');

    // Check if template files exist
    try {
      await fs.access(templatePath);
      await fs.access(medicineTemplatePath);
    } catch (fileError) {
      console.error('Template files not found:', fileError);
      return NextResponse.json(
        { error: 'PDF template files not found' },
        { status: 500 }
      );
    }

    // Load both templates
    const templateBytes = await fs.readFile(templatePath);
    const medicineTemplateBytes = await fs.readFile(medicineTemplatePath);
    
    // Load the first PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const firstPage = pdfDoc.getPages()[0];
    
    // Load the medicine template
    const medicineDoc = await PDFDocument.load(medicineTemplateBytes);
    const [medicinePage] = await pdfDoc.copyPages(medicineDoc, [0]);
    pdfDoc.addPage(medicinePage);

    let currentPage = medicinePage;
    let yPosition = currentPage.getHeight() - 100;
    
    // Embed a standard font
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Text properties
    const textSize = 12;
    const textColor = rgb(0, 0, 0);
      // Format date
    const formattedDate = new Date(data.date).toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Patient details - Patient name (maintain existing position)
    firstPage.drawText(data.patientName, {
      x: 280,
      y: firstPage.getHeight() - 183,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Age (maintain existing position)
    firstPage.drawText(data.age, {
      x: 201,
      y: firstPage.getHeight() - 218,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Sex (maintain existing position)
    firstPage.drawText(data.sex, {
      x: 345,
      y: firstPage.getHeight() - 218,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Date (maintain existing position)
    firstPage.drawText(formattedDate, {
      x: 511,
      y: firstPage.getHeight() - 183,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Medical information - Chief Complaint (maintain existing position)
    firstPage.drawText(data.cc || 'N/A', {
      x: 197,
      y: firstPage.getHeight() - 258,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Medical/Dental History (maintain existing position)
    firstPage.drawText(data.mh || 'N/A', {
      x: 197,
      y: firstPage.getHeight() - 296,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Define maximum width for text wrapping
    const maxWidth = 340;
    
    // Investigation (optional field - add after M/H if provided)
    if (data.investigation && data.investigation.trim()) {
      const investigationLines = splitTextIntoLines(data.investigation, regularFont, textSize, maxWidth);
      investigationLines.forEach((line, index) => {
        firstPage.drawText(line, {
          x: 197,
          y: firstPage.getHeight() - 324 - (index * 18),
          size: textSize,
          font: regularFont,
          color: textColor
        });
      });
    }
    
    // Oral Examination (O/E) - This replaces the Diagnosis field in the PDF template
    let oralExamText = 'None';
    
    // Handle teeth information for prescription
    if (data.selectedTeeth && data.selectedTeeth.length > 0) {
      const teethInfo = data.selectedTeeth.map(tooth => {
        const toothId = tooth.id.toString();
        const quadrant = toothId[0];
        const number = parseInt(toothId.slice(1));
        
        // Convert numbers 9-13 to letters A-E directly
        let displayId;
        if (number >= 9 && number <= 13) {
          const letterIndex = number - 9; // 9->0, 10->1, 11->2, etc.
          const letter = String.fromCharCode('A'.charCodeAt(0) + letterIndex);
          displayId = `${quadrant}${letter}`;
        } else {
          displayId = toothId;
        }
    
        return `#${displayId} (${tooth.disease})`;
      }).join('; ');
    
      // Update dental notation with converted IDs
      data.dentalNotation = teethInfo;
    }

    // Prepare oral examination text with teeth information and clinical notes
    if (data.dentalNotation || data.clinicalNotes) {
      const teethInfo = data.dentalNotation ? `Teeth involved: ${data.dentalNotation}` : '';
      const clinicalInfo = data.clinicalNotes || '';
      
      if (teethInfo && clinicalInfo) {
        oralExamText = `${teethInfo}; ${clinicalInfo}`;
      } else {
        oralExamText = teethInfo || clinicalInfo;
      }
    }
    
    // Handle the Oral Examination text with proper wrapping
    const oralExamLines = splitTextIntoLines(oralExamText, regularFont, textSize, maxWidth);
    const yPos = firstPage.getHeight() - 324;
    
    // Draw each line of the oral examination text
    oralExamLines.forEach((line, index) => {
      firstPage.drawText(line, {
        x: 197,
        y: yPos - (index * 20), // 20 pixels between lines
        size: textSize,
        font: regularFont,
        color: textColor
      });
    });
    
    // Add "Medicines" header
    // currentPage.drawText('Medicines:', {
    //   x: 160,
    //   y: yPosition - 120,
    //   size: textSize + 2,
    //   font: regularFont,
    //   color: textColor
    // });

    yPosition -= 140; // Space after header

    // Medicines entries
    // Adjust these coordinates for better spacing
    const xMedicineName = 160;
    const xDosage = 357;     
    const xDuration = 492;   
    const lineSpacing = 28; // Define line spacing for medicine rows

    // Add column headers
    currentPage.drawText('Medicine name', {
      x: xMedicineName,
      y: yPosition + 40,
      size: textSize,
      font: regularFont,
      color: textColor
    });

    currentPage.drawText('Dosage', {
      x: xDosage,
      y: yPosition + 40,
      size: textSize,
      font: regularFont,
      color: textColor
    });

    currentPage.drawText('Duration', {
      x: xDuration,
      y: yPosition + 40,
      size: textSize,
      font: regularFont,
      color: textColor
    });

    // In your medicines section, replace the existing medicine drawing code with:
    if (data.medicines && Array.isArray(data.medicines)) {
      for (const medicine of data.medicines) {
        // Check if we need another page
        if (yPosition < 180) {
          // Create new page from template
          const [newPage] = await pdfDoc.copyPages(medicineDoc, [0]);
          pdfDoc.addPage(newPage);
          currentPage = newPage;
          yPosition = currentPage.getHeight() - 100;
        }

        // Draw all information in one line
        currentPage.drawText(medicine.name, {
          x: xMedicineName,
          y: yPosition,
          size: textSize,
          font: regularFont,
          color: textColor
        });
        
        currentPage.drawText(medicine.dosage, {
          x: xDosage,
          y: yPosition,  // Same y position as medicine name
          size: textSize,
          font: regularFont,
          color: textColor
        });
        
        currentPage.drawText(medicine.duration, {
          x: xDuration,
          y: yPosition,  // Same y position as medicine name
          size: textSize,
          font: regularFont,
          color: textColor
        });
        
        yPosition -= lineSpacing;  // Move to next line after drawing all three items
      }
    }

    // Add Treatment Plan section if provided
    if (data.treatmentPlan && Array.isArray(data.treatmentPlan) && data.treatmentPlan.length > 0) {
      yPosition -= 50; // Add space before treatment plan
      
      // Check if we have enough space for treatment plan
      if (yPosition < 250) {
        const [newPage] = await pdfDoc.copyPages(medicineDoc, [0]);
        pdfDoc.addPage(newPage);
        currentPage = newPage;
        yPosition = currentPage.getHeight() - 100;
      }
      
      currentPage.drawText('Treatment Plan:', {
        x: 160,
        y: yPosition,
        size: textSize + 2,
        font: regularFont,
        color: textColor
      });
      
      yPosition -= 25;
      
      // Draw each treatment plan step
      for (let index = 0; index < data.treatmentPlan.length; index++) {
        const step = data.treatmentPlan[index];
        
        if (yPosition < 180) {
          const [newPage] = await pdfDoc.copyPages(medicineDoc, [0]);
          pdfDoc.addPage(newPage);
          currentPage = newPage;
          yPosition = currentPage.getHeight() - 100;
        }
        
        const stepText = `${index + 1}. ${step}`;
        const stepLines = splitTextIntoLines(stepText, regularFont, textSize, 450);
        
        stepLines.forEach((line) => {
          currentPage.drawText(line, {
            x: 180,
            y: yPosition,
            size: textSize,
            font: regularFont,
            color: textColor
          });
          yPosition -= 20;
        });
      }
    }

    //Add advice on the same page
    currentPage.drawText('Advice:', {
      x: 160,
      y: 155,
      size: textSize + 2,
      font: regularFont,
      color: textColor
    });

    currentPage.drawText(data.advice || 'No specific advice', {
      x: 222,
      y: 155,
      size: textSize,
      font: regularFont,
      color: textColor
    });

    // Add follow-up on the same page
    currentPage.drawText('Follow-up:', {
      x: 160,
      y: 116,
      size: textSize + 2,
      font: regularFont,
      color: textColor    });    const followupText = data.followupDate ? 
      new Date(data.followupDate).toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : 'No follow-up scheduled';

    currentPage.drawText(followupText, {
      x: 225,
      y: 116,
      size: textSize,
      font: regularFont,
      color: textColor
    });
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Return the PDF as response with proper type conversion
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=prescription-${data.patientName.replace(/\s+/g, '-')}.pdf`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate prescription PDF' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper function to add a new page with header
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addNewPage(pdfDoc: PDFDocument, font: PDFFont): PDFPage {
  const newPage = pdfDoc.addPage();
  
  // Add header to new page
  newPage.drawText('KS Dental & Aesthetics', {
    x: newPage.getWidth() / 2 - 100,
    y: newPage.getHeight() - 50,
    size: 14,
    font,
    color: rgb(0, 0, 0)
  });
  
  newPage.drawText('Prescription Continued', {
    x: newPage.getWidth() / 2 - 80,
    y: newPage.getHeight() - 70,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  });
  
  return newPage;
}

// Helper function to split text into lines of appropriate width
function splitTextIntoLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}