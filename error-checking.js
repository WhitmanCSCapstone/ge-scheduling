/*globals COLUMN_WORKSHOP_NAME, COLUMN_WORKSHOP_CAPACITY, COLUMN_FIRST_NAME,
 * COLUMN_LAST_NAME, COLUMN_GRADE, PREFERENCE_COLUMNS, Logger */
// Functions that check the inputs for valid types can be extended to check for other params

//Current Version only checks if the correct type in the correct column. Really only makes sure that integers//
// are where they should be and gives row and column of incorrect input. In order to test put a string where an //
//integer should be in the spreadsheet //

function workshop_input_checker(name, capacity, location, i) {
    if (typeof name !== "string") {
        throw new Error(
            "Invalid input at row " + i + " column " + COLUMN_WORKSHOP_NAME
        );
    }
    if (typeof capacity !== "number" || isNaN(capacity)) {
        throw new Error(
            "Invalid input at row " + i + " column " + COLUMN_WORKSHOP_CAPACITY
        );
    }
}

function student_input_checker(firstName, lastName, grade, workshopNum, j) {
    if (typeof firstName !== "string") {
        throw new Error(
            "Invalid input at row " + j + " column " + COLUMN_FIRST_NAME
        );
    }
    if (typeof lastName !== "string") {
        throw new Error(
            "Invalid input at row " + j + " column " + COLUMN_LAST_NAME
        );
    }
    if (typeof grade !== "string") {
        throw new Error(
            "Invalid input at row " + j + " column " + COLUMN_GRADE
        );
    }
}

function preference_input_checker(workshopNum, j, k) {
    Logger.log("Checking preferred workshop with type " + typeof workshopNum);
    if (typeof workshopNum !== "number" || isNaN(workshopNum)) {
        throw new Error(
            "Invalid input at row " + j + " column " + PREFERENCE_COLUMNS[k]
        );
    }
}
