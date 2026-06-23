"""
--------------------------------------------------
Sample Grouping Utilities
--------------------------------------------------

Purpose
-------
Incoming data packages may contain reports,
instrument exports, spreadsheets, and other
supporting files.

This module helps ensure all files associated
with a sample end up in the same location.

Business Value
--------------
Reduces repetitive file sorting and creates
a consistent structure for downstream review.
"""

import os


def create_directory(folder_path):
    """
    Create a directory if it does not already exist.

    Returns the directory path so it can be used
    immediately by the calling workflow.
    """

    os.makedirs(
        folder_path,
        exist_ok=True
    )

    return folder_path


def match_files_to_reports(
    sample_files,
    metadata_table
):
    """
    Match sample files to their corresponding PDF
    reports using extracted identifiers.

    Returns
    -------
    List of tuples:

    (
        sample_file,
        report_file
    )
    """

    matched_files = []

    for sample_file in sample_files:

        for _, row in metadata_table.iterrows():

            if (
                sample_file ==
                row["Sample ID"]
            ):

                matched_files.append(
                    (
                        sample_file,
                        row["Report File"]
                    )
                )

                break

    return matched_files
