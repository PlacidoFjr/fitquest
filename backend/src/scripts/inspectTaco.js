const xlsx = require("xlsx");
const path = require("path");

const excelPath = path.join(__dirname, "../../../Taco-4a-Edicao.xlsx");

function inspectTaco() {
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  console.log("--- PRIMEIRAS 10 LINHAS DA TABELA ---");
  for (let i = 0; i < 10; i++) {
    console.log(`Linha ${i}:`, rawData[i]);
  }
}

inspectTaco();
