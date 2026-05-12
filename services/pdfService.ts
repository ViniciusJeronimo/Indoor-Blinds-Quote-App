import { jsPDF } from "jspdf";
import { Quote, BlindType, RollerBlindData, VerticalBlindData, VenetianTimberData, VenetianAluminiumData, CurtainData } from '../types';

export const generatePDF = (quote: Quote, type: 'customer' | 'company') => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;
  const pageHeight = doc.internal.pageSize.height;
  const includeDimensions = type === 'company';

  // Helper to check page break
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPos + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  // --- HEADER ---
  try {
    // Attempt to add logo if available
    doc.addImage("/logo.png", "PNG", margin, yPos - 10, 15, 15);
    doc.setFontSize(22);
    doc.setTextColor(2, 132, 199); // Brand Blue
    doc.text("BlindsQuote Pro", margin + 18, yPos);
  } catch (e) {
    // Fallback if image fails
    doc.setFontSize(22);
    doc.setTextColor(2, 132, 199); // Brand Blue
    doc.text("BlindsQuote Pro", margin, yPos);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Quote #${quote.customer.customerNumber.toString().padStart(6, '0')}`, 150, yPos);
  yPos += 6;
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 150, yPos);
  
  yPos += 15;

  // --- CUSTOMER DETAILS ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details:", margin, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${quote.customer.firstName} ${quote.customer.lastName}`, margin, yPos);
  yPos += 5;
  doc.text(`${quote.customer.address}`, margin, yPos);
  yPos += 5;
  doc.text(`${quote.customer.email} | ${quote.customer.phone}`, margin, yPos);
  
  yPos += 15;

  // --- ITEM LIST ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(includeDimensions ? "Items Quote (Internal Copy)" : "Items Quote (Customer Copy)", margin, yPos);
  yPos += 10;

  quote.blinds.forEach((blind, index) => {
    checkPageBreak(50); // Rough estimate for an item block

    // Item Header (Room & Type)
    doc.setFillColor(240, 249, 255); // brand-50
    doc.rect(margin, yPos - 5, 170, 10, 'F'); // Background bar
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`${index + 1}. ${blind.room} - ${blind.type}`, margin + 2, yPos + 2);
    
    // Price on the right
    doc.text(`$${blind.price.toFixed(2)}`, 170, yPos + 2);
    
    yPos += 10;

    // Item Details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);

    // Dimensions (Only for Company Copy)
    if (includeDimensions) {
      doc.setFont("helvetica", "bold");
      doc.text(`Dimensions: ${blind.width}mm (W) x ${blind.drop}mm (D)`, margin + 5, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
    }

    // Basic Info
    const basicInfo = `Material: ${blind.material}  |  Color: ${blind.color}`;
    doc.text(basicInfo, margin + 5, yPos);
    yPos += 5;

    // Specific Info - Property Grid Style
    const drawDetail = (label: string, value: string | number | undefined, xOffset: number) => {
      if (value === undefined || value === null || value === '') return false;
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin + 5 + xOffset, yPos);
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "normal");
      doc.text(`${value}`, margin + 5 + xOffset + labelWidth, yPos);
      return true;
    };

    let detailsRendered = 0;
    const rowHeight = 5;
    const colWidth = 55;

    if (blind.type === BlindType.Roller || blind.type === BlindType.DoubleRoller) {
      const b = blind as RollerBlindData;
      drawDetail("Control", b.controlSide, 0);
      drawDetail("Roll", b.rollDirection, colWidth);
      drawDetail("Rail", b.bottomRail, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Chain", b.chainType, 0);
      drawDetail("Motor", b.motor, colWidth);
      drawDetail("Fitting", b.fitting, colWidth * 2);
      yPos += rowHeight;
    } else if (blind.type === BlindType.Vertical) {
      const b = blind as VerticalBlindData;
      drawDetail("Slat", b.slatSize, 0);
      drawDetail("Track", b.trackColor, colWidth);
      drawDetail("Type", b.trackType, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Control", `${b.controlType} (${b.controlSide})`, 0);
      drawDetail("Bunch", b.bunch, colWidth);
      drawDetail("Fitting", b.fitting, colWidth * 2);
      yPos += rowHeight;
    } else if (blind.type === BlindType.VenetianTimber) {
      const b = blind as VenetianTimberData;
      drawDetail("Slat", b.slatSize, 0);
      drawDetail("Valance", b.valance, colWidth);
      drawDetail("Rail", b.bottomRail, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Return", b.blindReturn, 0);
      drawDetail("Control", `${b.controlType} (${b.controlSide})`, colWidth);
      yPos += rowHeight;
    } else if (blind.type === BlindType.VenetianAluminium) {
      const b = blind as VenetianAluminiumData;
      drawDetail("Slat", b.slatSize, 0);
      drawDetail("Control", b.controlSide, colWidth);
      yPos += rowHeight;
    } else if (blind.type === BlindType.Curtain) {
      const b = blind as CurtainData;
      drawDetail("Type", b.curtainType, 0);
      drawDetail("Fabric", b.fabric, colWidth);
      drawDetail("Track", b.trackColor, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Heading", b.headingStyle, 0);
      drawDetail("Hem", b.hemStyle, colWidth);
      drawDetail("Control", b.controlSide ? `${b.controlType} (${b.controlSide})` : b.controlType, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Bunch", b.bunch, 0);
      drawDetail("Hook", b.hookNumber, colWidth);
      drawDetail("BFP", b.bfp, colWidth * 2);
      yPos += rowHeight;
      drawDetail("Fitting", b.fitting, 0);
      yPos += rowHeight;
    }

    // Notes
    if (blind.notes) {
        yPos += 2;
        doc.setFont("helvetica", "italic");
        doc.text(`Note: ${blind.notes}`, margin + 5, yPos);
        yPos += 5;
    }
    
    yPos += 3;
    doc.setDrawColor(240);
    doc.line(margin, yPos, 190, yPos);
    yPos += 7; // Spacing between items
  });

  // --- TOTALS ---
  checkPageBreak(50);
  yPos += 5;
  doc.setDrawColor(200);
  doc.line(margin, yPos, 190, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0);

  // Helper for right-aligned text
  const printTotalLine = (label: string, value: string, isBold: boolean = false) => {
    if (isBold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    
    doc.text(label, 130, yPos);
    doc.text(value, 190, yPos, { align: 'right' });
    yPos += 6;
  };

  const itemsSubtotal = quote.blinds.reduce((sum, item) => sum + item.price, 0);
  const fittingCost = quote.fittingIncluded ? 0 : (quote.fittingPrice || 0);
  const takedownsCost = quote.takedownsIncluded ? 0 : ((quote.takedowns || 0) * 10);
  const discount = quote.discount || 0;
  const total = Math.max(0, itemsSubtotal + fittingCost + takedownsCost - discount);

  printTotalLine("Subtotal:", `$${itemsSubtotal.toFixed(2)}`);
  
  const fittingLabel = quote.fittingIncluded ? "Fitting (Inc.):" : "Fitting:";
  printTotalLine(fittingLabel, `$${fittingCost.toFixed(2)}`);

  const takedownsLabel = quote.takedownsIncluded ? `Takedowns (${quote.takedowns}):` : `Takedowns (${quote.takedowns}):`;
  const takedownsVal = quote.takedownsIncluded ? "Included" : `$${takedownsCost.toFixed(2)}`;
  printTotalLine(takedownsLabel, takedownsVal);

  if (discount > 0) {
    doc.setTextColor(220, 38, 38); // Red
    printTotalLine("Discount:", `-$${discount.toFixed(2)}`);
    doc.setTextColor(0);
  }

  yPos += 2;
  doc.setFontSize(14);
  doc.setTextColor(2, 132, 199); // Brand Blue
  printTotalLine("Grand Total:", `$${total.toFixed(2)}`, true);

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = includeDimensions 
    ? "Internal Company Copy - Includes Measurements." 
    : "This quote is valid for 30 days. Measurements excluded from this customer copy.";
  doc.text(footerText, margin, pageHeight - 10);

  // Return the doc for potential emailing or save it
  return doc;
};

export const getPDFBase64 = (quote: Quote, type: 'customer' | 'company'): string => {
  const doc = generatePDF(quote, type);
  return doc.output('datauristring').split(',')[1];
};

export const generateCustomerCopyPDF = (quote: Quote) => {
  const doc = generatePDF(quote, 'customer');
  doc.save(`Quote_${quote.customer.customerNumber}_CustomerCopy.pdf`);
};

export const generateCompanyCopyPDF = (quote: Quote) => {
  const doc = generatePDF(quote, 'company');
  doc.save(`Quote_${quote.customer.customerNumber}_CompanyCopy.pdf`);
};