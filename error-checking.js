/*globals COLUMN_WORKSHOP_NAME, COLUMN_WORKSHOP_CAPACITY, COLUMN_FIRST_NAME,
 * COLUMN_LAST_NAME, COLUMN_GRADE, PREFERENCE_COLUMNS, Logger */
// Functions that check the inputs for valid types. Can be extended to check
// for other params.

// Current version only checks if the correct type in the correct column.
// Really only makes sure that integers are where they should be and gives row
// and column of incorrect input.

function workshopInputChecker(name, capacity, location, row) {
    // Increment the row number to make it match the sheet's row numbers
    row++;

    if (typeof name !== "string") {
        throw new Error(
            "Invalid workshop at row " +
                row +
                " column " +
                COLUMN_WORKSHOP_NAME +
                " in workshop sheet"
        );
    }
    if (typeof capacity !== "number" || isNaN(capacity)) {
        throw new Error(
            "Invalid workshop capacity at row " +
                row +
                " column " +
                COLUMN_WORKSHOP_CAPACITY +
                " in workshop sheet"
        );
    }
}

function studentInputChecker(firstName, lastName, grade, row) {
    // Increment the row number to make it match the sheet's row numbers
    row++;

    if (typeof firstName !== "string") {
        throw new Error(
            "Invalid first name at row " + row + " column " + COLUMN_FIRST_NAME
        );
    }
    if (typeof lastName !== "string") {
        throw new Error(
            "Invalid last name at row " + row + " column " + COLUMN_LAST_NAME
        );
    }
    if (typeof grade !== "string") {
        throw new Error(
            "Invalid grade at row " + row + " column " + COLUMN_GRADE
        );
    }
}

function preferenceInputChecker(workshopNum, row, preferenceNumber) {
    // Increment the row number to make it match the sheet's row numbers
    row++;

    if (typeof workshopNum !== "number" || isNaN(workshopNum)) {
        var columnLetterCodepoint = 65 + PREFERENCE_COLUMNS[preferenceNumber];
        var columnLetter = String.fromCharCode(columnLetterCodepoint);
        throw new Error(
            "Invalid workshop number at row " + row + " column " + columnLetter
        );
    }
}