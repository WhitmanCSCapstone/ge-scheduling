/*globals SpreadsheetApp, Logger, Matcher, workshopInputChecker,
studentInputChecker, preferenceInputChecker */

const COLUMN_FIRST_NAME = 10;
const COLUMN_LAST_NAME = 11;
const COLUMN_GRADE = 17;

// Column indicies of workshop info for the workshop class
const COLUMN_WORKSHOP_NAME = 2;
const COLUMN_WORKSHOP_CAPACITY = 6;
const COLUMN_WORKSHOP_BUILDING = 4;
const COLUMN_WORKSHOP_ROOM = 5;

// Column indicies for the Data Sheet
const COLUMN_WORKSHOP_NUMBER = 1;
const COLUMN_SLOTS_TAKEN = 2;
const COLUMN_TOTAL_SLOTS = 3;

// Column indices of student preferences in order from most preferred to least
const PREFERENCE_COLUMNS = [1, 2, 3, 4, 5, 6];

// Column indices of student enrollments in order of session time
const ENROLLED = [2, 3, 4];

const OUTPUT_SHEET_HEADERS = [
    "First name",
    "Last name",
    "Grade",
    "Workshop #",
    "Workshop Section A",
    "Workshop Location",
    "Workshop #",
    "Workshop Section B",
    "Workshop Location",
    "Workshop #",
    "Workshop Section C",
    "Workshop Location"
];

const DATA_SHEET_HEADER1 = [
    "Workshop Name",
    "Workshop #",
    "Slots Taken",
    "Total Slots"
];

const DATA_SHEET_HEADER2 = [
    "# of First Preferences",
    "# of Second Preferences",
    "# of Third Preferences",
    "# of Fourth Preferences",
    "# of Fifth Preferences",
    "# of Sixth Preferences",
    "# of Not Preferenced"
];

// Variables for response spreadsheet indices
const RESPONSE_SHEET_INDEX = 0;
const OUTPUT_SHEET_INDEX = 1;
const PREASSIGNMENT_SHEET_INDEX = 2;
const DATA_SHEET_INDEX = 3;

// Formatting workshop variables
const WORKSHOP_SPREADSHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

const RESPONSE_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Response Data
const RESPONSE_SHEET = RESPONSE_SPREADSHEET.getSheets()[RESPONSE_SHEET_INDEX];
const RESPONSE_DATA = RESPONSE_SHEET.getDataRange().getValues();

// Workshop Sheet
const WORKSHOP_SHEET = SpreadsheetApp.openById(WORKSHOP_SPREADSHEET_ID);
const WORKSHOP_DATA = WORKSHOP_SHEET.getDataRange().getValues();

// Output Sheet
const outputSheet = RESPONSE_SPREADSHEET.getSheets()[OUTPUT_SHEET_INDEX];

// Pre-Assignment Sheet
const PRE_ASSIGNMENT_SHEET = RESPONSE_SPREADSHEET.getSheets()[
    PREASSIGNMENT_SHEET_INDEX
];
const PRE_ASSIGNMENT_DATA = PRE_ASSIGNMENT_SHEET.getDataRange().getValues();

// Assignment Data Sheet
const DATA_SHEET = RESPONSE_SPREADSHEET.getSheets()[DATA_SHEET_INDEX];

/**
 * Automatically runs when sheet is opened.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Great Explorations")
        .addItem("Match Girls to Workshops", "main")
        .addToUi();
}

/**
 * It's the main function, what more do you need to know.
 */
function main() {
    const matcher = new Matcher();

    for (let i = 1; i < WORKSHOP_DATA.length; i++) {
        // for all workshops i
        const name = WORKSHOP_DATA[i][COLUMN_WORKSHOP_NAME];
        const number = i;
        const capacity = WORKSHOP_DATA[i][COLUMN_WORKSHOP_CAPACITY];
        const location =
            WORKSHOP_DATA[i][COLUMN_WORKSHOP_BUILDING] +
            " " +
            WORKSHOP_DATA[i][COLUMN_WORKSHOP_ROOM];

        workshopInputChecker(name, capacity, location, i);

        matcher.addNewWorkshop(name, number, capacity, location);
    }

    for (let j = 1; j < RESPONSE_DATA.length; j++) {
        // for all students j
        const firstName = RESPONSE_DATA[j][COLUMN_FIRST_NAME];
        const lastName = RESPONSE_DATA[j][COLUMN_LAST_NAME];
        const grade = RESPONSE_DATA[j][COLUMN_GRADE];
        studentInputChecker(firstName, lastName, grade, j);

        const preferenceNums = [];

        for (let k = 0; k < PREFERENCE_COLUMNS.length; k++) {
            // for all student preferences k
            const preferredWorkshop = RESPONSE_DATA[j][PREFERENCE_COLUMNS[k]];
            const workshopNum = parseInt(
                preferredWorkshop.slice(
                    preferredWorkshop.indexOf("(") + 1,
                    preferredWorkshop.indexOf(")")
                ),
                10 // base 10
            );
            preferenceInputChecker(workshopNum, j, k);

            if (preferenceNums.indexOf(workshopNum) === -1) {
                preferenceNums.push(workshopNum);
            }
        }
        matcher.addNewStudent(firstName, lastName, preferenceNums, grade);
    }

    Logger.log(matcher.allStudents[0].firstName);
    Logger.log(matcher.allStudents[0].preferences[0].name);

    populateSheet(outputSheet, DATA_SHEET, matcher);
}

/**
 * Output the results of the matcher to the given sheet.
 */
function populateSheet(outputSheet, DATA_SHEET, matcher) {
    // Formats the sheets before writing to them.
    outputSheet.clear();
    outputSheet.appendRow(OUTPUT_SHEET_HEADERS);
    outputSheet.setFrozenRows(1);

    DATA_SHEET.clear();
    DATA_SHEET.appendRow(DATA_SHEET_HEADER1);
    outputSheet.setFrozenRows(1);

    matcher.fixStudentPreferences();
    matcher.matchGirls();

    // All student lines to output
    const studentLines = [];

    const results = [0, 0, 0, 0, 0, 0, 0];

    for (const student of matcher.allStudents) {
        const prefnums = student.checkPreferenceNumbers();

        // Record the the number of times a student has # preference in their preference list
        for (const n of prefnums) {
            results[n]++;
        }

        const studentLine = [];
        studentLine.push(student.firstName);
        studentLine.push(student.lastName);
        studentLine.push(student.grade);

        // List the student's assigned workshops in the row
        for (const workshop of student.assignedWorkshops) {
            if (workshop === null) {
                studentLine.push("", "", "");
            } else {
                studentLine.push(workshop.number);
                studentLine.push(workshop.name);
                studentLine.push(workshop.location);
            }
        }
        studentLines.push(studentLine);
    }

    const dataInfoFull = [];
    for (const workshop of matcher.workshopsByPopularity) {
        const dataInfo = [];

        dataInfo.push(workshop.name);
        dataInfo.push(workshop.number);
        dataInfo.push(workshop.slotsFilled);
        dataInfo.push(workshop.totalBaseCapacity);
        dataInfoFull.push(dataInfo);
    }

    const dataInfoRows = dataInfoFull.length;
    const dataInfoColumns = dataInfoFull[0].length;
    DATA_SHEET.getRange(
        DATA_SHEET.getLastRow() + 1,
        1,
        dataInfoRows,
        dataInfoColumns
    ).setValues(dataInfoFull);

    DATA_SHEET.appendRow(DATA_SHEET_HEADER2);
    DATA_SHEET.appendRow(results);

    const rowCount = studentLines.length;
    const columnCount = studentLines[0].length;
    outputSheet
        .getRange(outputSheet.getLastRow() + 1, 1, rowCount, columnCount)
        .setValues(studentLines);
}
