## Overview

Scientific instruments often generate exports intended for human review rather than direct integration with cloud analytics platforms.

This project demonstrates an automated workflow that retrieves instrument-generated data files, extracts metadata and measurement data, normalizes the results into a structured format, and uploads the processed dataset to cloud storage.

The goal was to reduce manual processing and enable downstream reporting and analytics workflows.

## Problem

Instrument software exports frequently contain:

* Metadata mixed with experimental data
* Variable file structure
* Repeated header rows
* Blank lines
* Missing optional fields

## Solution

This workflow automatically:

1. Retrieves newly available instrument exports
2. Extracts metadata from semi-structured files
3. Identifies the beginning of measurement data
4. Validates records
5. Removes non-data rows
6. Converts measurements into a normalized tabular structure
7. Uploads processed results to cloud storage

## Workflow

Instrument Export

→ Metadata Extraction
→ Data Validation
→ Measurement Parsing
→ Dataset Normalization
→ Cloud Storage
→ Analytics Platform

## Engineering Challenges

### Semi-Structured Instrument Exports

The source files combined metadata and experimental measurements within a single export.

The workflow identifies metadata fields separately from measurement data and converts the information into a structured dataset.

### Variable File Quality

The pipeline validates required metadata, skips malformed rows, and continues processing when individual files contain issues.

### Analytics Integration

Instrument exports were transformed into a normalized format suitable for cloud storage and downstream analytics workflows.
