
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper to format date for filenames
const getFileDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const exportToPDF = (reportName, tableData, columns) => {
  const doc = new jsPDF();
  
  // Font setup for Turkish characters support (using standard font, might have limitations with some chars in standard jsPDF without custom font)
  // For standard jsPDF, we rely on standard fonts.
  
  // Title
  doc.setFontSize(16);
  doc.text(reportName.replace(/_/g, ' '), 14, 20);
  
  // Meta info
  doc.setFontSize(10);
  doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);
  doc.text(`Oluşturan: Sistem`, 14, 33);

  // Prepare body
  const head = [columns.map(col => col.header)];
  const body = tableData.map(row => columns.map(col => {
    // Handle nested properties or formatting
    let val = row[col.dataKey];
    if (val === undefined || val === null) return '-';
    return String(val);
  }));

  doc.autoTable({
    head: head,
    body: body,
    startY: 40,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`${reportName}_${getFileDate()}.pdf`);
};

export const exportToExcel = (reportName, tableData, columns) => {
  // Map data to match column headers
  const excelData = tableData.map(row => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.header] = row[col.dataKey];
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const wscols = columns.map(c => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
  
  XLSX.writeFile(workbook, `${reportName}_${getFileDate()}.xlsx`);
};
