import xlsx from 'xlsx';
import * as path from 'path';

const filePath = path.resolve('../../uploads/Data Penduduk Desa Sukarama Kecamatan Bojongpicung Status Nik Permanen.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log('Headers:', data[0]);
console.log('Row 2:', data[1]);
console.log('Total rows:', data.length);
