# Spectrophotometer Data Processing Automation

An automation solution built using Google Apps Script (JavaScript) to streamline, standardize, and accelerate laboratory data workflows. This project replaces an error-prone, formula-heavy manual spreadsheet with a robust, one-click engineering workflow featuring automated statistical regression, dynamic data validation, and automated historical logging.

## The Challenge & Business Context
In laboratory environments, research scientists frequently design complex analytical frameworks inside spreadsheets. While scientifically sound, these manual sheets present operational risks:
* **Manual Bottlenecks:** Lab technicians spent time copying values, configuring scatter plots, and manually checking statistical variances.
* **Risk of Formula Alteration:** Open spreadsheet formulas are highly susceptible to accidental edits or deletions.
* **Lack of Data Integrity:** No standardized method existed to maintain data persistence or track historical instrument calibrations across shifts.

## The Solution
This automation completely wraps the scientific methodology into an event-driven, button-triggered macro application. The software executes linear regressions, manages statistical outliers, calculates critical analytical indicators, enforces quality thresholds, and maintains data persistence across sheets.

---
## Workflow Architecture

```text
[ Lab Technician Enters Absorbance Values ]
                 │
                 ▼
     ┌───────────────────────┐
     │  Perform Calibration  │ ──► Run Ordinary Least Squares (OLS) Regression
     └───────────────────────┘
                 │
                 ├─► R² Check: If < 0.985, run automated outlier analysis
                 │   ├─► Single Outlier? Auto-purge, alert user, and recalculate.
                 │   └─► Multi-Outlier? Flag fail, halt execution.
                 │
                 ├─► Generate Dynamic Trend Chart & Calculate LOD / LOQ
                 └─► Log to Permanent Calibration History Database
                 │
                 ▼
     ┌───────────────────────┐
     │ Calculate Data Matrix │ ──► Map sample inputs against latest calibration metrics
     └───────────────────────┘
                 │
                 ├─► Boundary Checks (e.g., Absorbance >= 1.0 triggers dilution warning)
                 ├─► Boundary Filters (Classify outputs as "ND" or "Below LOQ")
                 └─► Push & Archive Clean Batches to Long-Term Storage Data Logs
```

---
## Features & Implementation Details
### Global parameters (`config.js`)
* Holds calibration standard constraints, reporting conversion multipliers, and sheet names, entirely decoupling core application parameters from functional business logic.
### System Calibration (`calibration.js`)
* **Mathematical Precision:** Performs an Ordinary Least Squares (OLS) linear regression to map absorbance values against predefined standard controls.
* ** Outlier Optimization:** If the coefficient of determination ($R^2$) falls below a strict quality threshold (`MINIMUM_R2 = 0.985`), the script uses residual distance analysis to isolate statistical anomalies. If exactly one outlier is found, it purges the anomaly, alerts the operator via a UI notification, and rebuilds the curve.
* **Automated Data Persistence:** Generates an updated regression scatter plot and saves successful metrics to a permanent `CalibrationHistory` ledger.

### Analytical Calculations & Boundary Constraints (`concentration_calc.js`)
* **Dynamic Formula Scaling:** Automatically matches raw data against the latest valid calibration run to calculate absolute concentrations.
* **Instrument Boundary Safety Guards:** Flags samples exceeding linear operating limitations (`Absorbance >= 1.0`) and explicitly instructs technicians to perform a dilution run.
* **Analytical Categorization:** Automatically processes values relative to the Limit of Detection (LOD) and Limit of Quantification (LOQ):
  * **$<$ LOD:** Sets values to **ND** (Not Detected) and flags the error column.
  * **$<$ LOQ:** Appends an estimated concentration alongside an analytical warning flag.

---
## System in Action
### Outlier Detection & Dynamic Charting
When a technician inputs a control set containing a skewed plot point, the application detects the variance, strips the point out to salvage the analytical run, dynamically re-renders the trendlines, and presents an interactive prompt to the operator:
<img width="1440" height="710" alt="calibration_ui_alert" src="https://github.com/user-attachments/assets/c9e0a5fd-5a68-446b-b039-3defb8d0528a" />

### Data Validation & Operations View
System logic handles all data calculation and range validation, eliminating manual spot checks:
<img width="1431" height="464" alt="concentration_dashboard" src="https://github.com/user-attachments/assets/5cf61d53-f957-4acd-9db9-2aec8e13e028" />


