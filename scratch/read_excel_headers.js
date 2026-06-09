const xlsx = require('xlsx');

const filePath = 'C:\\\\Users\\\\siwakorn.r\\\\Downloads\\\\Repair Acceptance (7).xls';

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  console.log("Headers:");
  console.log(data[0]);
  console.log("\\nFirst Row:");
  console.log(data[1]);
} catch (e) {
  console.error("Error reading file:", e.message);
}
