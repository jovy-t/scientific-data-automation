/**
 * Main execution function to orchestrate the calibration curve processing.
 * Reads data, calculates regression parameters, checks quality, and updates history.
 */
function performCalibration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const calSheet = ss.getSheetByName(SHEETS.calibration);
  
  // 1. Fetch and preprocess absorbance data
  const dataRange = calSheet.getRange("A2:A10"); 
  const absorbanceValues = dataRange.getValues().map(row => Math.abs(row[0]));
  
  // Clone baseline standards array from config to allow dynamic manipulation (e.g., outlier removal)
  let concentrations = [...CALIBRATION_STANDARDS];

  // 2. Perform initial linear regression calculations
  let regression = calculateLinearRegression(absorbanceValues, concentrations);
  let { slope, intercept, r2, stdDevIntercept } = regression;

  console.log(`Initial Regression Analysis -> R²: ${r2.toFixed(4)}, Intercept SD: ${stdDevIntercept}`);

  // 3. Handle low-quality regression fits via outlier detection
  let lod = calculateLOD(stdDevIntercept, slope, absorbanceValues.length);
  let loq = calculateLOQ(stdDevIntercept, slope, absorbanceValues.length);

  if (r2 < MINIMUM_R2) {
    const outliers = identifyOutliers(absorbanceValues, concentrations, slope, intercept, stdDevIntercept);
    
    // Safely remove a single statistical outlier to salvage the calibration curve
    if (outliers.length === 1) {
      const outlierIndex = absorbanceValues.indexOf(outliers[0].absorbance);
      
      absorbanceValues.splice(outlierIndex, 1);
      concentrations.splice(outlierIndex, 1);

      // Recalculate metrics with sanitized data array
      regression = calculateLinearRegression(absorbanceValues, concentrations);
      ({ slope, intercept, r2, stdDevIntercept } = regression);
      
      lod = calculateLOD(stdDevIntercept, slope, absorbanceValues.length);
      loq = calculateLOQ(stdDevIntercept, slope, absorbanceValues.length);

      Browser.msgBox(`Outlier optimized. Removed point [Abs: ${outliers[0].absorbance}, Conc: ${outliers[0].concentration}].`);
    } else {
      Browser.msgBox(`Calibration failed: R² (${r2.toFixed(4)}) is below threshold (${MINIMUM_R2}) and clear single outlier could not be isolated. Please re-run.`);
      return;
    }
  }

  // 4. Plot visual trends
  generateCalibrationChart(calSheet, concentrations, absorbanceValues);

  // 5. Commit metrics back to active layout and long-term history
  const formattedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  writeCalibrationSummary(calSheet, { slope, intercept, r2, lod, loq, formattedDate });
  logToCalibrationHistory(ss, { formattedDate, slope, intercept, r2, lod, loq });
}

//---------------------------------------------------
// Helper Functions
//---------------------------------------------------

/**
 * Executes a standard ordinary least squares (OLS) linear regression.
 */
function calculateLinearRegression(y, x) {
  const n = y.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const r2 = Math.pow((n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)), 2);

  const residuals = y.map((val, i) => val - (slope * x[i] + intercept));
  const residualSumOfSquares = residuals.reduce((sum, r) => sum + r * r, 0);
  const residualVariance = residualSumOfSquares / (n - 2);
  const meanX = sumX / n;
  const sxx = sumX2 - n * meanX * meanX;
  const stdDevIntercept = Math.sqrt(residualVariance * ((1 / n) + (meanX * meanX / sxx)));

  return { slope, intercept, r2, stdDevIntercept };
}

function calculateLOD(sdIntercept, slope, sampleCount) {
  return LIMIT_OF_DETECTION_MULTIPLIER * (sdIntercept / (slope * Math.sqrt(sampleCount)));
}

function calculateLOQ(sdIntercept, slope, sampleCount) {
  return LIMIT_OF_QUANTIFICATION_MULTIPLIER * (sdIntercept / (slope * Math.sqrt(sampleCount)));
}

/**
 * Identifies mathematical data outliers using standard residual distance analysis.
 */
function identifyOutliers(absorbance, concentrations, slope, intercept, stdDevIntercept) {
  const residuals = absorbance.map((obs, i) => Math.abs(obs - (slope * concentrations[i] + intercept)));
  const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
  const outlierThreshold = meanResidual + (2 * stdDevIntercept);

  return residuals.map((residual, i) => ({
    absorbance: absorbance[i],
    concentration: concentrations[i],
    residual
  })).filter(r => r.residual > outlierThreshold);
}

function generateCalibrationChart(sheet, concentrations, absorbance) {
  const existingCharts = sheet.getCharts();
  existingCharts.forEach(chart => sheet.removeChart(chart));

  const numRows = concentrations.length;
  const dataRange = sheet.getRange("J1:K" + (numRows + 1));
  const headers = [["Concentration (Units)", "Absorbance"]];
  const chartData = concentrations.map((conc, i) => [conc, absorbance[i]]);
  
  dataRange.clear();
  dataRange.offset(0, 0, 1, 2).setValues(headers);
  dataRange.offset(1, 0, numRows, 2).setValues(chartData);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(sheet.getRange("J1:K" + (numRows + 1)))
    .setPosition(6, 10, 0, 0)
    .setOption('title', 'System Calibration Curve')
    .setOption('hAxis', {title: 'Concentration'})
    .setOption('vAxis', {title: 'Absorbance'})
    .setOption('legend', {position: 'none'})
    .setOption('trendlines', {0: {type: 'linear', showR2: true, visibleInLegend: true}})
    .build();
    
  sheet.insertChart(chart);
}

function writeCalibrationSummary(sheet, metrics) {
  const headers = [["Slope", "Intercept", "R²", "LOD", "LOQ", "Date"]];
  const data = [[metrics.slope, metrics.intercept, metrics.r2, metrics.lod, metrics.loq, metrics.formattedDate]];
  
  sheet.getRange("D1:I1").setValues(headers);
  sheet.getRange("D2:I2").setValues(data);
}

function logToCalibrationHistory(ss, metrics) {
  let historySheet = ss.getSheetByName(SHEETS.calibrationHistory);
  if (!historySheet) {
    historySheet = ss.insertSheet(SHEETS.calibrationHistory);
    historySheet.appendRow(["Date", "Slope", "Intercept", "R²", "LOD", "LOQ"]);
  }

  const historyData = historySheet.getDataRange().getValues();
  const looksLikeDuplicate = historyData.some(row => 
    row[1] == metrics.slope && row[2] == metrics.intercept && row[3] == metrics.r2
  );
  
  if (!looksLikeDuplicate) {
    historySheet.appendRow([metrics.formattedDate, metrics.slope, metrics.intercept, metrics.r2, metrics.lod, metrics.loq]);
  }
}
