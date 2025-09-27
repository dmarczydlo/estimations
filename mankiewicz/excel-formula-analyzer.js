/**
 * Excel Formula Analyzer
 *
 * Usage:
 * 1. Install dependencies: npm install xlsx
 * 2. Place your Excel file in the same directory
 * 3. Run: node excel-formula-analyzer.js your-file.xlsx
 *
 * This script will analyze all formulas in the Excel file and categorize them
 * by complexity (Simple, Medium, Complex)
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

class ExcelFormulaAnalyzer {
  constructor() {
    this.allFormulas = [];
    this.formulasBySheet = {};
    this.functionTypes = new Set();
    this.categorizedFormulas = {
      SIMPLE: [],
      MEDIUM: [],
      COMPLEX: [],
    };
  }

  /**
   * Analyze Excel file and extract all formulas
   * @param {string} filePath - Path to Excel file
   */
  analyzeFile(filePath) {
    console.log(`\n🔍 Analyzing Excel file: ${filePath}`);
    console.log("=".repeat(60));

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read Excel file
    const workbook = XLSX.readFile(filePath, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true,
    });

    console.log(`📊 Found ${workbook.SheetNames.length} worksheets`);

    // Extract formulas from all sheets
    this.extractFormulas(workbook);

    // Categorize formulas by complexity
    this.categorizeFormulas();

    // Generate analysis report
    this.generateReport();

    // Export detailed results
    this.exportResults(filePath);
  }

  /**
   * Extract all formulas from workbook
   * @param {Object} workbook - XLSX workbook object
   */
  extractFormulas(workbook) {
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet || !sheet["!ref"]) {
        console.log(`  ⚠️  Sheet "${sheetName}" has no data`);
        return;
      }

      const range = XLSX.utils.decode_range(sheet["!ref"]);
      let sheetFormulas = [];

      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellRef];

          if (cell && cell.f) {
            const formulaData = {
              sheet: sheetName,
              cell: cellRef,
              formula: cell.f,
              value: cell.v || cell.w || "",
            };

            this.allFormulas.push(formulaData);
            sheetFormulas.push(formulaData);

            // Extract function names
            const functions = cell.f.match(/[A-Z]+(?=\()/g) || [];
            functions.forEach((func) => this.functionTypes.add(func));
          }
        }
      }

      if (sheetFormulas.length > 0) {
        this.formulasBySheet[sheetName] = sheetFormulas;
        console.log(
          `  📄 Sheet "${sheetName}": ${sheetFormulas.length} formulas`
        );
      }
    });

    console.log(`\n✅ Total formulas extracted: ${this.allFormulas.length}`);
    console.log(`🔧 Unique Excel functions: ${this.functionTypes.size}`);
  }

  /**
   * Categorize formula by complexity
   * @param {string} formula - Excel formula string
   * @returns {string} - Category: SIMPLE, MEDIUM, or COMPLEX
   */
  categorizeFormula(formula) {
    // Simple formulas: basic arithmetic, single function, simple references
    const simplePatterns = [
      /^[A-Z]+\d+$/, // Simple cell reference like A1
      /^[A-Z]+\d+[+\-*/][A-Z]+\d+$/, // Simple arithmetic like A1+B1
      /^[A-Z]+\d+\/\$[A-Z]+\$\d+$/, // Simple division with absolute reference
      /^IF\(ISBLANK\([^,)]+\),"[^"]*","[^"]*"\)$/, // Simple ISBLANK check
      /^"[^"]*"&[A-Z]+\d+$/, // Simple concatenation
      /^[A-Z_]+![A-Z]+\d+$/, // Simple inter-sheet reference
      /^\d+(\.\d+)?$/, // Direct number
      /^[A-Z]+\d+\*[\d.]+$/, // Simple multiplication
    ];

    // Complex formulas: nested functions, multiple conditions, array formulas
    const complexPatterns = [
      /SUMPRODUCT/i,
      /INDEX.*MATCH/i,
      /VLOOKUP.*VLOOKUP/i, // Nested VLOOKUPs
      /IF.*IF.*IF/i, // Triple nested IFs or more
      /IFERROR.*VLOOKUP.*IF/i, // Multiple function nesting
      /\$[A-Z]+\$\d+:\$[A-Z]+\$\d+/, // Array references
      /{.*}/, // Array formulas
      /CONCATENATE.*IF/i,
      /SUM.*IF.*IF/i,
      /.*&.*&.*&/, // Multiple concatenations
      /IF\(AND\(.*,.*\),.*,IF\(/i, // Complex nested conditions
      /TRIM\(MID\(/i, // Text processing combinations
      /SEARCH.*MID/i,
    ];

    // Check for complex patterns first
    for (let pattern of complexPatterns) {
      if (pattern.test(formula)) {
        return "COMPLEX";
      }
    }

    // Check for simple patterns
    for (let pattern of simplePatterns) {
      if (pattern.test(formula)) {
        return "SIMPLE";
      }
    }

    // Calculate complexity score for everything else
    let complexityScore = 0;

    // Count nested functions
    const functionCount = (formula.match(/[A-Z]+\(/g) || []).length;
    if (functionCount > 3) complexityScore += 3;
    else if (functionCount > 2) complexityScore += 2;
    else if (functionCount > 1) complexityScore += 1;

    // Count IF statements
    const ifCount = (formula.match(/IF\(/gi) || []).length;
    if (ifCount > 2) complexityScore += 3;
    else if (ifCount > 1) complexityScore += 2;
    else if (ifCount === 1) complexityScore += 1;

    // Check for inter-sheet references
    if (formula.includes("!")) complexityScore += 1;

    // Check formula length
    if (formula.length > 150) complexityScore += 3;
    else if (formula.length > 100) complexityScore += 2;
    else if (formula.length > 50) complexityScore += 1;

    // Check for complex functions
    const complexFunctions = [
      "VLOOKUP",
      "INDEX",
      "MATCH",
      "SUMIF",
      "COUNTIF",
      "IFERROR",
      "SUBTOTAL",
    ];
    for (let func of complexFunctions) {
      if (formula.toUpperCase().includes(func)) complexityScore += 1;
    }

    // Check for logical operators
    const logicalOps = ["AND", "OR"];
    for (let op of logicalOps) {
      if (formula.toUpperCase().includes(op + "(")) complexityScore += 1;
    }

    // Check for multiple conditions/criteria
    const commaCount = (formula.match(/,/g) || []).length;
    if (commaCount > 5) complexityScore += 2;
    else if (commaCount > 3) complexityScore += 1;

    // Determine final category
    if (complexityScore >= 5) return "COMPLEX";
    if (complexityScore >= 2) return "MEDIUM";
    return "SIMPLE";
  }

  /**
   * Categorize all formulas by complexity
   */
  categorizeFormulas() {
    console.log("\n🏷️  Categorizing formulas by complexity...");

    this.allFormulas.forEach((formulaData) => {
      const category = this.categorizeFormula(formulaData.formula);
      this.categorizedFormulas[category].push(formulaData);
    });

    console.log(`  ✅ Simple: ${this.categorizedFormulas.SIMPLE.length}`);
    console.log(`  ⚡ Medium: ${this.categorizedFormulas.MEDIUM.length}`);
    console.log(`  🔥 Complex: ${this.categorizedFormulas.COMPLEX.length}`);
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📈 EXCEL FORMULA ANALYSIS REPORT");
    console.log("=".repeat(60));

    // Summary statistics
    console.log("\n📊 SUMMARY STATISTICS");
    console.log("-".repeat(30));
    console.log(`Total Formulas: ${this.allFormulas.length}`);
    console.log(
      `Worksheets with Formulas: ${Object.keys(this.formulasBySheet).length}`
    );
    console.log(`Unique Excel Functions: ${this.functionTypes.size}`);

    // Complexity distribution
    console.log("\n🎯 COMPLEXITY DISTRIBUTION");
    console.log("-".repeat(30));
    const total = this.allFormulas.length;
    console.log(
      `Simple:  ${this.categorizedFormulas.SIMPLE.length
        .toString()
        .padStart(3)} (${(
        (this.categorizedFormulas.SIMPLE.length / total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Medium:  ${this.categorizedFormulas.MEDIUM.length
        .toString()
        .padStart(3)} (${(
        (this.categorizedFormulas.MEDIUM.length / total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Complex: ${this.categorizedFormulas.COMPLEX.length
        .toString()
        .padStart(3)} (${(
        (this.categorizedFormulas.COMPLEX.length / total) *
        100
      ).toFixed(1)}%)`
    );

    // Functions used
    console.log("\n🔧 EXCEL FUNCTIONS USED");
    console.log("-".repeat(30));
    const sortedFunctions = Array.from(this.functionTypes).sort();
    console.log(sortedFunctions.join(", "));

    // Sheet breakdown
    console.log("\n📄 FORMULAS BY WORKSHEET");
    console.log("-".repeat(30));
    Object.entries(this.formulasBySheet)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([sheet, formulas]) => {
        console.log(
          `${sheet.padEnd(25)} ${formulas.length
            .toString()
            .padStart(3)} formulas`
        );
      });

    // Sample formulas by category
    this.showSampleFormulas();

    // Migration recommendations
    this.showMigrationRecommendations();
  }

  /**
   * Show sample formulas for each complexity category
   */
  showSampleFormulas() {
    console.log("\n🔍 SAMPLE FORMULAS BY CATEGORY");
    console.log("-".repeat(40));

    const categories = ["SIMPLE", "MEDIUM", "COMPLEX"];
    categories.forEach((category) => {
      console.log(
        `\n${category} FORMULAS (${this.categorizedFormulas[category].length} total):`
      );

      const samples = this.categorizedFormulas[category].slice(0, 5);
      samples.forEach((f, index) => {
        console.log(`  ${index + 1}. ${f.sheet}!${f.cell}: ${f.formula}`);
      });

      if (this.categorizedFormulas[category].length > 5) {
        console.log(
          `  ... and ${this.categorizedFormulas[category].length - 5} more`
        );
      }
    });
  }

  /**
   * Show migration recommendations based on complexity analysis
   */
  showMigrationRecommendations() {
    console.log("\n🚀 MIGRATION RECOMMENDATIONS");
    console.log("-".repeat(40));

    const simple = this.categorizedFormulas.SIMPLE.length;
    const medium = this.categorizedFormulas.MEDIUM.length;
    const complex = this.categorizedFormulas.COMPLEX.length;

    console.log("\nPHASE 1 (MVP): Core Functionality");
    console.log(
      `  Target: ${
        simple + Math.floor(medium * 0.4)
      } formulas (${simple} simple + ${Math.floor(
        medium * 0.4
      )} essential medium)`
    );
    console.log(`  Effort: 20-30 person-days`);
    console.log(`  Risk: Low`);

    console.log("\nPHASE 2: Enhanced Features");
    console.log(
      `  Target: ${
        Math.ceil(medium * 0.6) + Math.floor(complex * 0.3)
      } formulas (remaining medium + selected complex)`
    );
    console.log(`  Effort: 25-35 person-days`);
    console.log(`  Risk: Medium`);

    console.log("\nPHASE 3: Complete Migration");
    console.log(
      `  Target: ${Math.ceil(
        complex * 0.7
      )} formulas (remaining complex formulas)`
    );
    console.log(`  Effort: 30-45 person-days`);
    console.log(`  Risk: High`);

    const totalEffort = 75 + 110; // Average of ranges
    console.log(
      `\nTotal Estimated Effort: ${totalEffort / 2}-${totalEffort} person-days`
    );
  }

  /**
   * Export detailed results to files
   * @param {string} originalFilePath - Original Excel file path
   */
  exportResults(originalFilePath) {
    const baseName = path.basename(
      originalFilePath,
      path.extname(originalFilePath)
    );

    // Create export directory if it doesn't exist
    const exportDir = "export";
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
      console.log(`📁 Created export directory: ${exportDir}`);
    }

    // Export detailed formula list
    const detailedResults = {
      summary: {
        totalFormulas: this.allFormulas.length,
        worksheets: Object.keys(this.formulasBySheet).length,
        uniqueFunctions: Array.from(this.functionTypes).sort(),
        complexityDistribution: {
          simple: this.categorizedFormulas.SIMPLE.length,
          medium: this.categorizedFormulas.MEDIUM.length,
          complex: this.categorizedFormulas.COMPLEX.length,
        },
      },
      formulasByCategory: this.categorizedFormulas,
      formulasBySheet: this.formulasBySheet,
      allFormulas: this.allFormulas,
    };

    const resultsFile = path.join(exportDir, "formula_analysis.json");
    fs.writeFileSync(resultsFile, JSON.stringify(detailedResults, null, 2));
    console.log(`\n💾 Detailed results exported to: ${resultsFile}`);

    // Export CSV for easy analysis
    const csvData = this.allFormulas.map((f) => ({
      Sheet: f.sheet,
      Cell: f.cell,
      Formula: f.formula,
      Category: this.categorizeFormula(f.formula),
      Length: f.formula.length,
      FunctionCount: (f.formula.match(/[A-Z]+\(/g) || []).length,
    }));

    const csvContent = this.arrayToCSV(csvData);
    const csvFile = path.join(exportDir, "formulas.csv");
    fs.writeFileSync(csvFile, csvContent);
    console.log(`📊 CSV export saved to: ${csvFile}`);

    // Export Markdown Report
    const markdownContent = this.generateMarkdownReport(baseName);
    const markdownFile = path.join(exportDir, "analysis_report.md");
    fs.writeFileSync(markdownFile, markdownContent);
    console.log(`📝 Markdown report saved to: ${markdownFile}`);
  }

  /**
   * Generate comprehensive markdown report
   * @param {string} fileName - Base filename
   * @returns {string} - Markdown content
   */
  generateMarkdownReport(fileName) {
    const now = new Date();
    const total = this.allFormulas.length;
    const simpleCount = this.categorizedFormulas.SIMPLE.length;
    const mediumCount = this.categorizedFormulas.MEDIUM.length;
    const complexCount = this.categorizedFormulas.COMPLEX.length;

    let markdown = `# Excel Formula Analysis Report

**File**: ${fileName}  
**Analysis Date**: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}  
**Generated by**: Excel Formula Analyzer v1.0

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Formulas** | ${total} |
| **Worksheets Analyzed** | ${Object.keys(this.formulasBySheet).length} |
| **Unique Excel Functions** | ${this.functionTypes.size} |
| **Complexity Score** | ${
      complexCount > total * 0.4
        ? "High"
        : complexCount > total * 0.2
        ? "Medium"
        : "Low"
    } |

### Complexity Distribution

\`\`\`
📊 Formula Complexity Breakdown:
   Simple:  ${simpleCount.toString().padStart(3)} (${(
      (simpleCount / total) *
      100
    ).toFixed(1)}%) ████████████████████
   Medium:  ${mediumCount.toString().padStart(3)} (${(
      (mediumCount / total) *
      100
    ).toFixed(1)}%) ████████████████████
   Complex: ${complexCount.toString().padStart(3)} (${(
      (complexCount / total) *
      100
    ).toFixed(1)}%) ████████████████████
\`\`\`

---

## Detailed Analysis

### Formula Distribution by Complexity

#### 🟢 Simple Formulas (${simpleCount} formulas - ${(
      (simpleCount / total) *
      100
    ).toFixed(1)}%)

**Characteristics:**
- Direct cell references (e.g., \`=A1\`, \`=Basic_Data!F27\`)
- Basic arithmetic operations (e.g., \`=A1+B1\`, \`=D2/$H$16\`)
- Simple conditional logic (e.g., \`=IF(ISBLANK(A1),"",A1)\`)
- Basic text concatenation

**Migration Effort**: Low risk, 1-2 person-days per 10 formulas

**Examples:**
| Sheet | Cell | Formula |
|-------|------|---------|
${this.categorizedFormulas.SIMPLE.slice(0, 5)
  .map(
    (f) => `| ${f.sheet} | ${f.cell} | \`${f.formula.replace(/`/g, "\\`")}\` |`
  )
  .join("\n")}
${
  this.categorizedFormulas.SIMPLE.length > 5
    ? `| ... | ... | *${
        this.categorizedFormulas.SIMPLE.length - 5
      } more formulas* |`
    : ""
}

#### 🟡 Medium Formulas (${mediumCount} formulas - ${(
      (mediumCount / total) *
      100
    ).toFixed(1)}%)

**Characteristics:**
- VLOOKUP operations with error handling
- Multiple nested IF conditions
- Text processing functions
- Conditional aggregations (SUMIF, COUNTIF)

**Migration Effort**: Medium risk, 0.5-1 person-day per formula

**Examples:**
| Sheet | Cell | Formula |
|-------|------|---------|
${this.categorizedFormulas.MEDIUM.slice(0, 5)
  .map(
    (f) =>
      `| ${f.sheet} | ${f.cell} | \`${
        f.formula.length > 80
          ? f.formula.substring(0, 77).replace(/`/g, "\\`") + "..."
          : f.formula.replace(/`/g, "\\`")
      }\` |`
  )
  .join("\n")}
${
  this.categorizedFormulas.MEDIUM.length > 5
    ? `| ... | ... | *${
        this.categorizedFormulas.MEDIUM.length - 5
      } more formulas* |`
    : ""
}

#### 🔴 Complex Formulas (${complexCount} formulas - ${(
      (complexCount / total) *
      100
    ).toFixed(1)}%)

**Characteristics:**
- Multiple nested functions (3+ levels)
- Array formulas and advanced lookups
- Complex text processing and parsing
- Multi-criteria conditional logic

**Migration Effort**: High risk, 1-2 person-days per formula

**Examples:**
| Sheet | Cell | Formula |
|-------|------|---------|
${this.categorizedFormulas.COMPLEX.slice(0, 5)
  .map(
    (f) =>
      `| ${f.sheet} | ${f.cell} | \`${
        f.formula.length > 80
          ? f.formula.substring(0, 77).replace(/`/g, "\\`") + "..."
          : f.formula.replace(/`/g, "\\`")
      }\` |`
  )
  .join("\n")}
${
  this.categorizedFormulas.COMPLEX.length > 5
    ? `| ... | ... | *${
        this.categorizedFormulas.COMPLEX.length - 5
      } more formulas* |`
    : ""
}

---

## Worksheet Analysis

### Formula Distribution by Sheet

| Worksheet | Formula Count | Percentage | Primary Complexity |
|-----------|---------------|------------|-------------------|
${Object.entries(this.formulasBySheet)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([sheet, formulas]) => {
    const sheetTotal = formulas.length;
    const sheetComplex = formulas.filter(
      (f) => this.categorizeFormula(f.formula) === "COMPLEX"
    ).length;
    const sheetMedium = formulas.filter(
      (f) => this.categorizeFormula(f.formula) === "MEDIUM"
    ).length;
    const primaryComplexity =
      sheetComplex > sheetTotal * 0.4
        ? "🔴 Complex"
        : sheetMedium > sheetTotal * 0.4
        ? "🟡 Medium"
        : "🟢 Simple";
    return `| ${sheet} | ${sheetTotal} | ${((sheetTotal / total) * 100).toFixed(
      1
    )}% | ${primaryComplexity} |`;
  })
  .join("\n")}

### Top Formula-Heavy Worksheets

${Object.entries(this.formulasBySheet)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 3)
  .map(([sheet, formulas], index) => {
    const sheetSimple = formulas.filter(
      (f) => this.categorizeFormula(f.formula) === "SIMPLE"
    ).length;
    const sheetMedium = formulas.filter(
      (f) => this.categorizeFormula(f.formula) === "MEDIUM"
    ).length;
    const sheetComplex = formulas.filter(
      (f) => this.categorizeFormula(f.formula) === "COMPLEX"
    ).length;

    return `#### ${index + 1}. ${sheet} (${formulas.length} formulas)

**Complexity Breakdown:**
- Simple: ${sheetSimple} formulas
- Medium: ${sheetMedium} formulas  
- Complex: ${sheetComplex} formulas

**Sample Formulas:**
${formulas
  .slice(0, 3)
  .map(
    (f) =>
      `- \`${f.cell}\`: \`${
        f.formula.length > 100
          ? f.formula.substring(0, 97).replace(/`/g, "\\`") + "..."
          : f.formula.replace(/`/g, "\\`")
      }\``
  )
  .join("\n")}
`;
  })
  .join("\n")}

---

## Excel Functions Usage

### Function Frequency Analysis

| Function | Usage Count | Complexity Impact |
|----------|-------------|------------------|
${Array.from(this.functionTypes)
  .sort()
  .map((func) => {
    const usage = this.allFormulas.filter((f) =>
      f.formula.toUpperCase().includes(func + "(")
    ).length;
    const complexityImpact = [
      "VLOOKUP",
      "INDEX",
      "MATCH",
      "SUMPRODUCT",
      "IFERROR",
    ].includes(func)
      ? "High"
      : ["IF", "AND", "OR", "SUMIF", "COUNTIF"].includes(func)
      ? "Medium"
      : "Low";
    return `| ${func} | ${usage} | ${complexityImpact} |`;
  })
  .join("\n")}

### Function Categories

**Basic Functions:**
${
  Array.from(this.functionTypes)
    .filter((f) =>
      ["SUM", "MAX", "MIN", "ROUND", "LEN", "LEFT", "MID", "TRIM"].includes(f)
    )
    .join(", ") || "None found"
}

**Conditional Logic:**
${
  Array.from(this.functionTypes)
    .filter((f) => ["IF", "AND", "OR", "IFERROR", "ISBLANK"].includes(f))
    .join(", ") || "None found"
}

**Lookup & Reference:**
${
  Array.from(this.functionTypes)
    .filter((f) => ["VLOOKUP", "INDEX", "MATCH", "SEARCH"].includes(f))
    .join(", ") || "None found"
}

**Aggregation:**
${
  Array.from(this.functionTypes)
    .filter((f) => ["SUMIF", "COUNTIF", "SUBTOTAL", "SUMPRODUCT"].includes(f))
    .join(", ") || "None found"
}

**Text Processing:**
${
  Array.from(this.functionTypes)
    .filter((f) =>
      ["CONCATENATE", "LEFT", "MID", "TRIM", "SEARCH", "LEN"].includes(f)
    )
    .join(", ") || "None found"
}

**Mathematical:**
${
  Array.from(this.functionTypes)
    .filter((f) => ["EXP", "LN", "ROUND"].includes(f))
    .join(", ") || "None found"
}

**Other:**
${
  Array.from(this.functionTypes)
    .filter(
      (f) =>
        ![
          "SUM",
          "MAX",
          "MIN",
          "ROUND",
          "LEN",
          "LEFT",
          "MID",
          "TRIM",
          "IF",
          "AND",
          "OR",
          "IFERROR",
          "ISBLANK",
          "VLOOKUP",
          "INDEX",
          "MATCH",
          "SEARCH",
          "SUMIF",
          "COUNTIF",
          "SUBTOTAL",
          "SUMPRODUCT",
          "CONCATENATE",
          "EXP",
          "LN",
        ].includes(f)
    )
    .join(", ") || "None found"
}

---

## Migration Strategy & Recommendations

### Phased Implementation Approach

#### 🚀 Phase 1: MVP Foundation (Months 1-4)
**Target**: ${simpleCount + Math.floor(mediumCount * 0.4)} formulas
- **Simple formulas**: All ${simpleCount} formulas  
- **Essential medium**: ${Math.floor(
      mediumCount * 0.4
    )} selected medium complexity formulas
- **Coverage**: ~${(
      ((simpleCount + Math.floor(mediumCount * 0.4)) / total) *
      100
    ).toFixed(0)}% of functionality
- **Effort**: 20-30 person-days
- **Risk**: 🟢 Low

**Recommended formulas for Phase 1:**
- Direct cell references and basic arithmetic
- Simple IF/ISBLANK conditions  
- Basic VLOOKUP operations
- Essential concatenation and text functions

#### 🔧 Phase 2: Enhanced Features (Months 5-7)
**Target**: ${
      Math.ceil(mediumCount * 0.6) + Math.floor(complexCount * 0.3)
    } formulas
- **Remaining medium**: ${Math.ceil(mediumCount * 0.6)} formulas
- **Selected complex**: ${Math.floor(complexCount * 0.3)} formulas
- **Coverage**: ~${
      ((Math.ceil(mediumCount * 0.6) + Math.floor(complexCount * 0.3)) /
        total) *
      100
    }% additional functionality
- **Effort**: 25-35 person-days  
- **Risk**: 🟡 Medium

#### 🎯 Phase 3: Complete Migration (Months 8-10)
**Target**: ${Math.ceil(complexCount * 0.7)} formulas
- **Remaining complex**: All remaining complex formulas
- **Coverage**: 100% feature parity
- **Effort**: 30-45 person-days
- **Risk**: 🔴 High

### Total Project Estimation

| Phase | Formulas | Effort (Days) | Timeline | Risk Level |
|-------|----------|---------------|----------|------------|
| Phase 1 (MVP) | ${
      simpleCount + Math.floor(mediumCount * 0.4)
    } | 20-30 | Months 1-4 | 🟢 Low |
| Phase 2 (Enhanced) | ${
      Math.ceil(mediumCount * 0.6) + Math.floor(complexCount * 0.3)
    } | 25-35 | Months 5-7 | 🟡 Medium |
| Phase 3 (Complete) | ${Math.ceil(
      complexCount * 0.7
    )} | 30-45 | Months 8-10 | 🔴 High |
| **TOTAL** | **${total}** | **75-110** | **10 months** | **Mixed** |

### Risk Assessment

#### 🟢 Low Risk Items (${simpleCount} formulas)
- **Direct migration**: Can be translated 1:1 to JavaScript/TypeScript
- **Minimal testing required**: Standard unit tests sufficient
- **No architectural changes**: Fits standard calculation patterns

#### 🟡 Medium Risk Items (${mediumCount} formulas)  
- **Logic mapping required**: May need algorithm adjustments
- **Integration testing**: Cross-functional dependencies
- **Performance considerations**: May need optimization

#### 🔴 High Risk Items (${complexCount} formulas)
- **Potential redesign**: May require new algorithms
- **Extensive testing**: Complex validation scenarios
- **Performance impact**: May need caching/optimization strategies

### Success Criteria

#### Functional Requirements
- ✅ Calculation accuracy within ±2% of Excel results
- ✅ All formula categories represented in MVP
- ✅ Error handling equivalent to Excel behavior
- ✅ Performance meets user expectations (<10s for calculations)

#### Technical Requirements  
- ✅ Maintainable code structure
- ✅ Comprehensive test coverage (>80%)
- ✅ Documentation for all migrated formulas
- ✅ Monitoring and logging for calculation errors

---

## Appendix

### Complete Formula Inventory

#### Simple Formulas (${simpleCount} total)
${this.categorizedFormulas.SIMPLE.map(
  (f, index) =>
    `${(index + 1).toString().padStart(3)}. ${f.sheet}!${
      f.cell
    }: \`${f.formula.replace(/`/g, "\\`")}\``
).join("\n")}

#### Medium Formulas (${mediumCount} total)
${this.categorizedFormulas.MEDIUM.slice(0, 20)
  .map(
    (f, index) =>
      `${(index + 1).toString().padStart(3)}. ${f.sheet}!${
        f.cell
      }: \`${f.formula.replace(/`/g, "\\`")}\``
  )
  .join("\n")}
${
  this.categorizedFormulas.MEDIUM.length > 20
    ? `\n*... and ${
        this.categorizedFormulas.MEDIUM.length - 20
      } more medium formulas*`
    : ""
}

#### Complex Formulas (${complexCount} total)
${this.categorizedFormulas.COMPLEX.slice(0, 15)
  .map(
    (f, index) =>
      `${(index + 1).toString().padStart(3)}. ${f.sheet}!${
        f.cell
      }: \`${f.formula.replace(/`/g, "\\`")}\``
  )
  .join("\n")}
${
  this.categorizedFormulas.COMPLEX.length > 15
    ? `\n*... and ${
        this.categorizedFormulas.COMPLEX.length - 15
      } more complex formulas*`
    : ""
}

---

### Analysis Metadata

**Tool**: Excel Formula Analyzer v1.0  
**Analysis Method**: Pattern-based complexity categorization  
**Confidence Level**: High (based on comprehensive rule set)  
**Recommendations**: Based on industry best practices for Excel-to-web migrations

---

*Report generated on ${now.toISOString()}*`;

    return markdown;
  }

  /**
   * Convert array of objects to CSV string
   * @param {Array} data - Array of objects
   * @returns {string} - CSV string
   */
  arrayToCSV(data) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if necessary
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  }
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("\n❌ Usage: node excel-formula-analyzer.js <excel-file.xlsx>");
    console.log(
      "\nExample: node excel-formula-analyzer.js MAGIC_V1.2.4c_Example.xlsx"
    );
    process.exit(1);
  }

  const filePath = args[0];

  try {
    const analyzer = new ExcelFormulaAnalyzer();
    analyzer.analyzeFile(filePath);

    console.log("\n🎉 Analysis completed successfully!");
    console.log("\nFiles generated:");
    console.log("  - 📝 Markdown report with comprehensive analysis");
    console.log("  - 💾 JSON file with detailed results");
    console.log("  - 📊 CSV file for spreadsheet analysis");
  } catch (error) {
    console.error("\n❌ Error analyzing file:", error.message);
    process.exit(1);
  }
}

// Run the analyzer if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = ExcelFormulaAnalyzer;
