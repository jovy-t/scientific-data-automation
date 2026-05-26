//---------------------------------------------------
// Calibration Standards
//---------------------------------------------------

/*
Example reference values used to build a calibration curve.
*/

const CALIBRATION_STANDARDS = [
  0,
  0.10,
  0.25,
  0.50,
  1.00,
  2.00,
  5.00,
  10.00,
  20.00
];

//---------------------------------------------------
// Regression Quality
//---------------------------------------------------

/*
Minimum acceptable coefficient of determination.
Used to validate calibration quality.
*/

const MINIMUM_R2 = 0.985;

//---------------------------------------------------
// Reporting Thresholds
//---------------------------------------------------

/*
Limit of Detection:
Smallest measurable signal.

Limit of Quantification:
Smallest value that can be reported reliably.
*/

const LIMIT_OF_DETECTION_MULTIPLIER = 3.3;

const LIMIT_OF_QUANTIFICATION_MULTIPLIER = 10;

//---------------------------------------------------
// Instrument Constraints
//---------------------------------------------------

/*
Example maximum supported absorbance.
Used to flag values that should be reviewed.
*/

const MAXIMUM_ABSORBANCE = 1.0;

//---------------------------------------------------
// Reporting Conversion
//---------------------------------------------------

/*
Example reporting conversion factor.
*/

const REPORTING_TRANSFORMATION_FACTOR = 50;

const SHEETS = {
  calibration: "Calibration",
  concentration: "Concentration",
  calibrationHistory: "CalibrationHistory",
  concentrationHistory: "ConcentrationHistory"
};

//---------------------------------------------------
// Duplicate Detection
//---------------------------------------------------

const DUPLICATE_TOLERANCE = 1e-6;
