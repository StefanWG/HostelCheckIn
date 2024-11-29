const fs = require('fs');
const ExcelJS = require('exceljs');

function writeExcel(fp, data) {
    console.log("Writing excel to ", fp);
    let workbook = new ExcelJS.Workbook();
    let sheet = workbook.addWorksheet('Sheet 1');
    sheet.columns = [
        {header: "Date", key: "date", width: 10},
        {header: "First Name", key: "fname", width: 32},
        {header: "Last Name", key: "lname", width: 32},
        {header: "People", key: "numppl", width: 10},
        {header: "Nights", key: "numDays", width: 10},
        {header: "Country", key: "country", width: 15},
        {header: "Passport #", key:"passport", width: 15},
        {header: "Check Out Date", key: "checkOutDate", width: 10},
        {header: "Paid", key: "paid", width: 10},
        {header: "Payment Method", key: "paymentMethod", width: 15},
        {header: "Amount Paid", key: "amountPaid", width: 10},
        {header: "Currency", key: "currency", width: 10},
        {header: "Notes", key: "notes", width: 10}
    ]
    for (let row of data) {
        sheet.addRow(row);
    }
    workbook.xlsx.writeFile(fp);
}

function createExcel(fp,override) {
    if (override) {
        const workbook = new ExcelJS.Workbook();
        workbook.xlsx.writeFile(`assets/${fp}`);
        return workbook;
    } else {
        if (fs.existsSync(`assets/${fp}`)) {
            const workbook = new ExcelJS.Workbook();
            workbook.xlsx.readFile(`assets/${fp}`);
            return workbook;
        } else {
            const workbook = new ExcelJS.Workbook();
            workbook.xlsx.writeFile(`assets/${fp}`);
            return workbook;
        }
    }
}
  
  
function getWorkSheet(wb) {
  
    let date = new Date();
    let month = date.toLocaleString('default', { month: 'long' });
  
    for (let sheet of wb.worksheets) {
        if (sheet.name === month) {
            sheet.columns = sheet.columns = [
                {header: "Date", key: "checkInDate", width: 10},
                {header: "First Name", key: "fname", width: 32},
                {header: "Last Name", key: "lname", width: 32},
                {header: "People", key: "numppl", width: 10},
                {header: "Nights", key: "numDays", width: 10},
                {header: "Country", key: "country", width: 15},
                {header: "Passport #", key:"passport", width: 15},
                {header: "Check Out Date", key: "checkOutDate", width: 10},
                {header: "Paid", key: "paid", width: 10},
                {header: "Payment Method", key: "paymentMethod", width: 15},
                {header: "Amount Paid", key: "amountPaid", width: 10},
                {header: "Currency", key: "currency", width: 10},
                {header: "Notes", key: "notes", width: 10}
            ]
            return sheet;
        }
    }
    return addMonth(wb, month);
}
  
function addMonth(workbook, month,) {
    let sheet = workbook.addWorksheet(month);
    sheet.columns = [
        {header: "Date", key: "checkInDate", width: 10},
        {header: "First Name", key: "fname", width: 32},
        {header: "Last Name", key: "lname", width: 32},
        {header: "People", key: "numppl", width: 10},
        {header: "Nights", key: "numDays", width: 10},
        {header: "Country", key: "country", width: 15},
        {header: "Passport #", key:"passport", width: 15},
        {header: "Check Out Date", key: "checkOutDate", width: 10},
        {header: "Paid", key: "paid", width: 10},
        {header: "Payment Method", key: "paymentMethod", width: 15},
        {header: "Amount Paid", key: "amountPaid", width: 10},
        {header: "Currency", key: "currency", width: 10},
        {header: "Rooms", key: "room", width: 10},
        {header: "Beds", key: "bed", width: 10},
        {header: "Person", key: "person", width: 10},
        {header: "Notes", key: "notes", width: 10}
    ]
  
    workbook.xlsx.writeFile(`assets/${EXCEL_FP}`);
    return sheet;
}
  
function addEntry(wb, args) {
    let sheet = getWorkSheet(wb); 
  
    let row = {};
    for (let key in args) {
      row[key] = args[key];
    }
  
    sheet.addRow(row);
    wb.xlsx.writeFile(`assets/${EXCEL_FP}`);
}

module.exports = {
    createExcel,
    getWorkSheet,
    addEntry,
    writeExcel
}
  