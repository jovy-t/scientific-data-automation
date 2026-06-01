/**
 * Evaluates individual sample micro-volume raw absorbance inputs against 
 * historical system calibration algorithms to parse out target mass weights.
 */
function calculateConcentration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sampleSheet = ss.getSheetByName(SHEETS.concentration);

  const lastRow = sampleSheet.getLastRow();
  if (lastRow <= 1) return; // Exit if sheet contains no raw data rows

  const dataRange = sampleSheet.getRange(2, 1, lastRow - 1, 7); 
  const data = dataRange.getValues();
  
  const calibrationData = ss.getSheetByName(SHEETS.calibrationHistory).getDataRange().getValues();
  const latestCal = extractLatestCalibration(calibrationData);

  if (!latestCal) {
    Browser.msgBox("Error: No active system historical calibration records found.");
    return;
  }

  // Iterate over data rows to compute analytical matrix metrics
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const [sampleId, absorbance, dilutionRatio, dissolutionVolume, massOfSample, sampleType] = row;
    
    const targetRowIndex = i + 2;

    // Boundary check: skip partial row lines
    if (!sampleId || absorbance === "" || !dilutionRatio || !dissolutionVolume || !massOfSample) {
      continue;
    }

    // High absorbance trigger check
    if (absorbance >= MAXIMUM_ABSORBANCE) {
      sampleSheet.getRange(targetRowIndex, 8).setValue("Absorbance exceeds max linear range. Dilute and re-run.");
      continue;
    }

    // Step-down calculation formulas utilizing global scaling indicators
    const concentrationInCuvette = (absorbance - latestCal.intercept) / latestCal.slope;
    const concentrationPreDilution = dilutionRatio * concentrationInCuvette;
    
    // Normalized dilution value scaled using conversion metric from config
    const normalizedIntermediateValue = (concentrationPreDilution / 1000000) * REPORTING_TRANSFORMATION_FACTOR;
    const finalCalculatedConcentration = (normalizedIntermediateValue * (dissolutionVolume / 1000) * 1000) / (massOfSample / 1000);

    // Filter outputs safely against LOD / LOQ boundaries 
    if (concentrationInCuvette < latestCal.lod) {
      sampleSheet.getRange(targetRowIndex, 8).setValue("Concentration below LOD");
      sampleSheet.getRange(targetRowIndex, 7).setValue("ND"); 
    } else if (concentrationInCuvette < latestCal.loq) {
      sampleSheet.getRange(targetRowIndex, 8).setValue("Concentration below LOQ (Estimated value)");
      sampleSheet.getRange(targetRowIndex, 7).setValue(finalCalculatedConcentration);
    } else {
      sampleSheet.getRange(targetRowIndex, 7).setValue(finalCalculatedConcentration);
      sampleSheet.getRange(targetRowIndex, 8).setValue(""); // Clear older warnings if run is healthy
    }
  }
}

/**
 * Searches and extracts the most recent valid calibration run metrics.
 */
function extractLatestCalibration(historyData) {
  if (historyData.length <= 1) return null;

  let latestDate = new Date(0);
  let latestCal = null;

  for (let i = 1; i < historyData.length; i++) {
    const rowDate = new Date(historyData[i][0]);
    if (rowDate > latestDate) {
      latestDate = rowDate;
      latestCal = {
        slope: historyData[i][1],
        intercept: historyData[i][2],
        lod: historyData[i][4],
        loq: historyData[i][5]
      };
    }
  }
  return latestCal;
}

/**
 * Archives current calculated sample dataset runs directly to the database history log.
 */
function pushToConcentrationHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sampleSheet = ss.getSheetByName(SHEETS.concentration);
  
  const lastRow = sampleSheet.getLastRow();
  if (lastRow <= 1) return;

  const data = sampleSheet.getRange("A2:G" + lastRow).getValues().filter(row => row[0] !== "");

  let historySheet = ss.getSheetByName(SHEETS.concentrationHistory);
  if (!historySheet) {
    historySheet = ss.insertSheet(SHEETS.concentrationHistory);
    historySheet.appendRow(["Sample ID", "Absorbance", "Dilution Ratio", "Dissolution Volume", "Mass of Sample", "Sample Type", "Measured Concentration", "Archived Timestamp"]);
  }

  const historyData = historySheet.getDataRange().getValues();
  
  data.forEach(row => {
    const [sampleId, absorbance, dilutionRatio, dissolutionVolume, massOfSample, targetConc, sampleType] = row;
    
    // Check for existing duplicates within precision tolerance range
    const isDuplicate = historyData.slice(1).some(histRow => 
      histRow[0].toString().trim() === sampleId.toString().trim() &&
      Math.abs(histRow[1] - absorbance) < DUPLICATE_TOLERANCE &&
      Math.abs(histRow[6] - targetConc) < DUPLICATE_TOLERANCE
    );

    if (!isDuplicate) {
      // Archive values cleanly while appending execution tracking timestamp
      historySheet.appendRow([sampleId, absorbance, dilutionRatio, dissolutionVolume, massOfSample, sampleType, targetConc, new Date()]);
    }
  });

  // Clear original staging sheet inputs cleanly for subsequent automated batch operational entries
  sampleSheet.getRange("A2:B" + lastRow).clearContent();
  sampleSheet.getRange("E2:H" + lastRow).clearContent();
}
