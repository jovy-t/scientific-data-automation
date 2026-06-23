import os
import shutil
import pandas as pd
import zipfile

from pdf_matching import (
    extract_identifier_from_pdf
)

from sample_grouping import (
    create_directory,
    match_files_to_reports
)


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------

def ensure_extraction(
    archive_path,
    extract_to
):
    """
    Extract ZIP archives when necessary.

    If files have already been extracted,
    reuse the existing folder to avoid
    duplicate work.
    """

    archive_file = f"{archive_path}.zip"

    if (
        not os.path.exists(extract_to)
        and
        os.path.exists(archive_file)
    ):

        with zipfile.ZipFile(
            archive_file,
            "r"
        ) as archive:

            archive.extractall(
                extract_to
            )

        print(
            f"Extracted: {archive_file}"
        )


def find_working_folder(
    base_folder
):
    """
    ZIP extraction on Windows frequently creates
    an additional top-level folder before the
    actual data files.

    This helper returns the folder that contains
    the files needed for processing.
    """

    contents = os.listdir(base_folder)

    if (
        len(contents) == 1
        and
        os.path.isdir(
            os.path.join(
                base_folder,
                contents[0]
            )
        )
    ):

        return os.path.join(
            base_folder,
            contents[0]
        )

    return base_folder


# -------------------------------------------------
# Main Workflow
# -------------------------------------------------

base_path = r"C:\Data"

package_name = "Example_Package"

package_folder = os.path.join(
    base_path,
    package_name
)

ensure_extraction(
    package_folder,
    package_folder
)

working_folder = find_working_folder(
    package_folder
)

output_folder = os.path.join(
    base_path,
    "Organized_Data"
)

os.makedirs(
    output_folder,
    exist_ok=True
)

all_files = os.listdir(
    working_folder
)

pdf_files = [
    file
    for file in all_files
    if file.lower().endswith(".pdf")
]

spreadsheet_files = [
    file
    for file in all_files
    if file.lower().endswith(
        (".xls", ".xlsx")
    )
]

sample_files = [
    file
    for file in all_files
    if file.lower().endswith(".smp")
]

# -------------------------------------------------
# Extract Sample Identifiers
# -------------------------------------------------

metadata = []

for pdf_file in pdf_files:

    pdf_path = os.path.join(
        working_folder,
        pdf_file
    )

    sample_id = (
        extract_identifier_from_pdf(
            pdf_path
        )
    )

    metadata.append({
        "Report File": pdf_file,
        "Sample ID": sample_id
    })

metadata_table = pd.DataFrame(
    metadata
)

# -------------------------------------------------
# Organize Reports
# -------------------------------------------------

for pdf_file in pdf_files:

    sample_folder = os.path.join(
        output_folder,
        os.path.splitext(pdf_file)[0]
    )

    create_directory(
        sample_folder
    )

    shutil.move(
        os.path.join(
            working_folder,
            pdf_file
        ),
        os.path.join(
            sample_folder,
            pdf_file
        )
    )

# -------------------------------------------------
# Match Sample Files
# -------------------------------------------------

matched_files = match_files_to_reports(
    sample_files,
    metadata_table
)

for sample_file, report_file in matched_files:

    destination_folder = os.path.join(
        output_folder,
        os.path.splitext(report_file)[0]
    )

    shutil.move(
        os.path.join(
            working_folder,
            sample_file
        ),
        os.path.join(
            destination_folder,
            sample_file
        )
    )

print(
    "Data package organized successfully."
)
