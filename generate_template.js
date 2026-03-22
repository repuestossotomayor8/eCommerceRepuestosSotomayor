const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function createTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Plantilla Repuestos', {
    properties: { defaultRowHeight: 20 }
  });

  // Define columns with desired widths
  sheet.columns = [
    { header: 'name ✱', key: 'name', width: 40 },
    { header: 'price ✱', key: 'price', width: 12 },
    { header: 'category ✱', key: 'category', width: 20 },
    { header: 'brand', key: 'brand', width: 20 },
    { header: 'description', key: 'description', width: 50 },
    { header: 'code_1', key: 'code_1', width: 15 },
    { header: 'code_2', key: 'code_2', width: 15 },
    { header: 'image_url', key: 'image_url', width: 35 },
    { header: 'image_2', key: 'image_2', width: 35 },
  ];

  // Style the header row (dark background, white text)
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', family: 2, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F3542' } // Dark gray/blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add some sample data rows with lighter clear styling
  sheet.addRow({
    name: 'Pastillas de Freno Bosch Cerámicas',
    price: 32.50,
    category: 'Frenos',
    brand: 'Bosch',
    description: 'Pastillas de alto rendimiento para frenos de disco',
    code_1: 'B-4251',
    code_2: 'ABE-FP001',
    image_url: 'https://ejemplo.com/img1.jpg',
    image_2: ''
  });

  sheet.addRow({
    name: 'Filtro de Aceite Mann W712/75',
    price: 8.99,
    category: 'Motor',
    brand: 'Mann',
    description: 'Filtro premium de aceite para motores gasolina',
    code_1: 'W712/75',
    code_2: '',
    image_url: 'https://ejemplo.com/img2.jpg',
    image_2: ''
  });

  // Apply basic styling to data rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { name: 'Arial', family: 2, size: 10, color: { argb: 'FF333333' } };
      row.alignment = { vertical: 'middle', wrapText: true };
    }
    // Add light borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // Save the file to public folder
  const outputPath = path.join(__dirname, 'public', 'plantilla_productos_sotomayor.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log('✅ Plantilla Excel generada con éxito en:', outputPath);
}

createTemplate().catch(console.error);
