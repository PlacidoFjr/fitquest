const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

/**
 * Script para extrair dados da Tabela TACO (Excel) e gerar um JSON simplificado.
 * Foca em Nome, Calorias (kcal) e Proteína (g) por 100g.
 */

const excelPath = path.join(__dirname, "../../../Taco-4a-Edicao.xlsx");
const outputPath = path.join(__dirname, "../../../frontend/src/data/taco_database.json");

function parseTaco() {
  console.log("Iniciando extração da Tabela TACO...");

  if (!fs.existsSync(excelPath)) {
    console.error("Arquivo Excel não encontrado em:", excelPath);
    return;
  }

  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0]; // Geralmente a primeira aba contém os dados
  const worksheet = workbook.Sheets[sheetName];
  
  // Converte para JSON bruto
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // A Tabela TACO costuma ter cabeçalhos nas primeiras linhas
  // Vamos procurar as colunas: Alimento, Energia (kcal), Proteína (g)
  // Nota: A estrutura pode variar, então vamos mapear baseado em índices comuns ou nomes
  
  const foods = [];
  
  // Pula as primeiras linhas de cabeçalho (ajuste conforme necessário após ver o arquivo)
  // Na 4ª edição, os dados costumam começar após a linha 3 ou 4
  for (let i = 3; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length < 5) continue;

    const name = row[1]; // Coluna B: Nome do Alimento
    const kcal = row[2]; // Coluna C: Energia (kcal)
    const protein = row[3]; // Coluna D: Proteína (g)

    if (name && typeof name === "string" && !isNaN(parseFloat(kcal))) {
      foods.push({
        name: name.trim(),
        calories: Math.round(parseFloat(kcal)) || 0,
        protein: parseFloat(protein) || 0
      });
    }
  }

  // Garante que o diretório de saída existe
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(foods, null, 2));
  console.log(`Sucesso! ${foods.length} alimentos extraídos para ${outputPath}`);
}

parseTaco();
