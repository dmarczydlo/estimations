# Excel Formula Analyzer

A powerful tool to analyze and categorize Excel formulas by complexity for migration planning.

## Features

- 🔍 **Extract all formulas** from Excel workbooks (.xlsx, .xls)
- 🏷️ **Categorize by complexity**: Simple, Medium, Complex
- 📊 **Detailed analysis**: Function usage, distribution, samples
- 💾 **Export results**: JSON and CSV formats
- 🚀 **Migration planning**: Effort estimation and phasing recommendations

## Quick Start

### 1. Setup

```bash
# Create project directory
mkdir excel-analyzer
cd excel-analyzer

# Initialize project (copy the provided files)
# - excel-formula-analyzer.js
# - package.json

# Install dependencies
npm install
```

### 2. Usage

```bash
# Analyze your Excel file
node excel-formula-analyzer.js your-file.xlsx

# Example
node excel-formula-analyzer.js ./input/MAGIC_V1.2.4c_Example.xlsx
```

### 3. Output

The script generates files in the `export/` directory:

- **Console report**: Detailed analysis with statistics
- **JSON file** (`export/formula_analysis.json`): Complete data for programmatic access
- **CSV file** (`export/formulas.csv`): Spreadsheet-friendly format for further analysis
- **Markdown report** (`export/analysis_report.md`): Comprehensive analysis report

## Sample Output

```
🔍 Analyzing Excel file: MAGIC_V1.2.4c_Example.xlsx
============================================================
📊 Found 13 worksheets
  📄 Sheet "Input": 301 formulas
  📄 Sheet "Input_Detail": 180 formulas
  📄 Sheet "Output_Data": 160 formulas
  📄 Sheet "Calculation_oven(hidden)": 115 formulas

✅ Total formulas extracted: 756

🏷️  Categorizing formulas by complexity...
  ✅ Simple: 189
  ⚡ Medium: 269
  🔥 Complex: 298

============================================================
📈 EXCEL FORMULA ANALYSIS REPORT
============================================================

📊 SUMMARY STATISTICS
------------------------------
Total Formulas: 756
Worksheets with Formulas: 8
Unique Excel Functions: 22

🎯 COMPLEXITY DISTRIBUTION
------------------------------
Simple:  189 (25.0%)
Medium:  269 (35.6%)
Complex: 298 (39.4%)

🔧 EXCEL FUNCTIONS USED
------------------------------
AND, CELL, CONCATENATE, COUNTIF, EXP, HYPERLINK, IF, IFERROR,
ISBLANK, LEFT, LEN, LN, MAX, MID, OR, ROUND, SEARCH, SUBTOTAL,
SUM, SUMIF, TRIM, VLOOKUP

🚀 MIGRATION RECOMMENDATIONS
----------------------------------------

PHASE 1 (MVP): Core Functionality
  Target: 296 formulas (189 simple + 107 essential medium)
  Effort: 20-30 person-days
  Risk: Low

PHASE 2: Enhanced Features
  Target: 251 formulas (remaining medium + selected complex)
  Effort: 25-35 person-days
  Risk: Medium

PHASE 3: Complete Migration
  Target: 209 formulas (remaining complex formulas)
  Effort: 30-45 person-days
  Risk: High

Total Estimated Effort: 75-110 person-days

💾 Detailed results exported to: export/formula_analysis.json
📊 CSV export saved to: export/formulas.csv
📝 Markdown report saved to: export/analysis_report.md
```

## Formula Complexity Categories

### Simple Formulas (25%)

- Direct cell references: `=A1`, `=Basic_Data!F27`
- Basic arithmetic: `=A1+B1`, `=D2/$H$16`
- Simple IF conditions: `=IF(ISBLANK(A1),"",A1)`
- Basic concatenation: `="Text"&A1`

### Medium Formulas (35.5%)

- VLOOKUP operations: `=VLOOKUP(A1,Table,2,FALSE)`
- Multiple IF conditions: `=IF(A1="X",B1,IF(A1="Y",C1,D1))`
- Error handling: `=IFERROR(VLOOKUP(...),"")`
- Text processing: `=LEFT(A1,5)&MID(B1,2,3)`

### Complex Formulas (39.5%)

- Nested functions: `=IF(AND(A1>0,B1<10),VLOOKUP(...),...)`
- Array formulas: `=SUMPRODUCT(...)`
- Advanced text processing: `=TRIM(MID(SEARCH(...)))`
- Multi-level nesting: `=IF(IFERROR(VLOOKUP(...)),...)`

## Generated Files

All output files are saved in the `export/` directory and will replace previous results on each run.

### JSON Output (`export/formula_analysis.json`)

```json
{
  "summary": {
    "totalFormulas": 756,
    "worksheets": 8,
    "uniqueFunctions": ["AND", "IF", "VLOOKUP", ...],
    "complexityDistribution": {
      "simple": 189,
      "medium": 269,
      "complex": 298
    }
  },
  "formulasByCategory": {
    "SIMPLE": [...],
    "MEDIUM": [...],
    "COMPLEX": [...]
  }
}
```

### CSV Output (`export/formulas.csv`)

```csv
Sheet,Cell,Formula,Category,Length,FunctionCount
Input,B8,"=""Current Process: ""&IF(ISBLANK(Basic_Data!F27),"""",Basic_Data!F27)",MEDIUM,67,2
Input_Detail,C1,IF(ISBLANK(Basic_Data!F27),"",Basic_Data!F27),SIMPLE,42,2
```

### Markdown Report (`export/analysis_report.md`)

A comprehensive analysis report containing all statistics, formula samples, and migration recommendations in markdown format.

## Migration Planning Use Cases

### 1. Effort Estimation

- **Simple formulas**: 1-2 days per 10 formulas
- **Medium formulas**: 0.5-1 day per formula
- **Complex formulas**: 1-2 days per formula

### 2. Risk Assessment

- **Simple**: Low risk, direct translation
- **Medium**: Medium risk, requires logic mapping
- **Complex**: High risk, may need algorithm redesign

### 3. Phase Planning

- **Phase 1 (MVP)**: Simple + essential medium (60% coverage)
- **Phase 2**: Remaining medium + selected complex (30% coverage)
- **Phase 3**: All complex formulas (10% coverage)

## Requirements

- **Node.js**: Version 14.0.0 or higher
- **Excel files**: .xlsx and .xls formats supported
- **Memory**: Sufficient for loading entire Excel workbook

## Troubleshooting

### Common Issues

**File not found**

```bash
❌ Error analyzing file: File not found: your-file.xlsx
```

- Ensure the Excel file exists in the current directory
- Check the file name and extension

**Memory issues with large files**

```bash
❌ Error: JavaScript heap out of memory
```

- Increase Node.js memory limit: `node --max-old-space-size=4096 excel-formula-analyzer.js file.xlsx`

**Permission errors**

```bash
❌ Error: EACCES: permission denied
```

- Ensure you have read permissions for the Excel file
- Check if the file is open in Excel (close it first)

## Advanced Usage

### Batch Processing

```bash
# Analyze multiple files
for file in *.xlsx; do
  node excel-formula-analyzer.js "$file"
done
```

### Custom Analysis

The script exports a class that can be imported and extended:

```javascript
const ExcelFormulaAnalyzer = require("./excel-formula-analyzer");

const analyzer = new ExcelFormulaAnalyzer();
analyzer.analyzeFile("my-file.xlsx");

// Access results programmatically
console.log(analyzer.categorizedFormulas.COMPLEX.length);
```

## Contributing

Feel free to extend the analyzer with additional features:

- Custom complexity rules
- Additional export formats
- Integration with project management tools
- Web-based interface

## License

MIT License - feel free to use and modify for your projects.
