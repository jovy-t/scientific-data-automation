"""
--------------------------------------------------
PDF Metadata Extraction
--------------------------------------------------

Purpose
-------
This module extracts identifying information
from PDF reports so related files can be grouped
automatically.

Business Value
--------------
Reduces manual review of reports and eliminates
the need to open each PDF when organizing data.
"""

import re
import PyPDF2


def extract_identifier_from_pdf(pdf_path):
    """
    Extract a sample identifier from the first page
    of a PDF report.

    The identifier is later used to match related
    files that belong to the same sample.
    """

    try:

        with open(pdf_path, "rb") as file:

            reader = PyPDF2.PdfReader(file)

            first_page_text = (
                reader
                .pages[0]
                .extract_text()
            )

            match = re.search(
                r"File:.*[\\/](\S+\.SMP)",
                first_page_text
            )

            if match:
                return match.group(1)

    except Exception as error:

        print(
            f"Unable to read PDF: "
            f"{pdf_path}\n{error}"
        )

    return None
