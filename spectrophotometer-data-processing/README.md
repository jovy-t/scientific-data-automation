# Spectrophotometric Analysis Automation

Automation workflow for converting spectrophotometer absorbance measurements into concentration estimates using calibration-based processing.

## Overview

This project demonstrates how spreadsheet automation can reduce manual laboratory calculations and improve reproducibility.

The workflow accepts absorbance values, generates calibration statistics, evaluates quality metrics, and produces concentration outputs.

This implementation uses generalized scientific processing concepts and synthetic data for demonstration purposes.

---

## Features

- Automated calibration generation
- Linear regression
- Quality validation
- Detection and quantification thresholds
- Concentration estimation
- Historical result logging
- Visualization of calibration behavior

---

## Workflow

1. Import absorbance measurements
2. Generate calibration model
3. Evaluate calibration quality
4. Estimate sample concentrations
5. Apply reporting thresholds
6. Store historical outputs

---

## Architecture

```text
Spectrophotometer
      ↓
Google Sheets
      ↓
Apps Script
      ↓
Calibration Engine
      ↓
Concentration Estimator
      ↓
Results + History
```

---

## Tech Stack

- Google Apps Script (JavaScript)
- Google Sheets
