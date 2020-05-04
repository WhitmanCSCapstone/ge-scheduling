/*globals SpreadsheetApp, Logger, Matcher, workshopInputChecker,
studentInputChecker, preferenceInputChecker */

// Column indices of workshop info for the workshop class
const WORKSHOP_COLUMNS = {
    name: 2,
    building: 4,
    room: 5,
    capacity: 6
};

// Column indices of student response data for the student class
const RESPONSE_COLUMNS = {
    firstName: 10,
    lastName: 11,
    grade: 17
};

// Column indicies of the Pre-assignment Sheet
const COLUMN_FIRST_NAMEP = 0;
const COLUMN_LAST_NAMEP = 1;
const COLUMN_GRADEP = 2;
const COLUMN_ASSIGNMENTS = [3, 4, 5];

// Column indices of student preferences in order from most preferred to least
const PREFERENCE_COLUMNS = [1, 2, 3, 4, 5, 6];

// Column indices of student enrollments in order of session time
const ENROLLED = [2, 3, 4];

const OUTPUT_SHEET_HEADER = [
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
    "Workshop Number",
    "Workshop Section",
    "Slots Taken",
    "Total Slots",
    "Workshop Section",
    "Slots Taken",
    "Total Slots",
    "Workshop Section",
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

// Formattin workshop variables
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

/**
 * Automatically runs when sheet is opened.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Great Explorations")
        .addItem("Match Girls to Workshops", "main")
        .addToUi();
}

function getSheets() {
    const workshopSpreadsheetId =
        "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

    const sheetIndices = {
        responses: 0,
        output: 1,
        preAssignment: 2,
        data: 3
    };

    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

    return {
        responses: sheets[sheetIndices.responses],
        output: sheets[sheetIndices.output],
        preAssignment: sheets[sheetIndices.preAssignment],
        data: sheets[sheetIndices.data],
        workshops: SpreadsheetApp.openById(workshopSpreadsheetId)
    };
}

function getSheetData(sheet) {
    return sheet.getDataRange().getValues();
}

/**
 * It's the main function, what more do you need to know.
 */
function main() {
    const sheets = getSheets();

    const matcher = new Matcher();

    const workshopData = getSheetData(sheets.workshops);

    for (let i = 1; i < workshopData.length; i++) {
        // for all workshops i
        const name = workshopData[i][WORKSHOP_COLUMNS.name];
        const number = i;
        const capacity = workshopData[i][WORKSHOP_COLUMNS.capacity];
        const location =
            workshopData[i][WORKSHOP_COLUMNS.building] +
            " " +
            workshopData[i][WORKSHOP_COLUMNS.room];

        workshopInputChecker(name, capacity, location, i);

        matcher.addNewWorkshop(name, number, capacity, location);
    }

    const responseData = getSheetData(sheets.responses);

    for (let j = 1; j < responseData.length; j++) {
        // for all students j
        const firstName = responseData[j][RESPONSE_COLUMNS.firstName];
        const lastName = responseData[j][RESPONSE_COLUMNS.lastName];
        const grade = responseData[j][RESPONSE_COLUMNS.grade];
        studentInputChecker(firstName, lastName, grade, j);

        const preferenceNums = [];

        for (let k = 0; k < PREFERENCE_COLUMNS.length; k++) {
            // for all student preferences k
            const preferredWorkshop = responseData[j][PREFERENCE_COLUMNS[k]];
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

    const preAssignmentData = getSheetData(sheets.preAssignment);

    for (let l = 1; l < preAssignmentData.length; l++) {
        // For all preassignements l
        const firstName = preAssignmentData[l][COLUMN_FIRST_NAMEP];
        const lastName = preAssignmentData[l][COLUMN_LAST_NAMEP];
        const grade = preAssignmentData[l][COLUMN_GRADEP];
        const assignments = [];
        for (let m = 0; m < COLUMN_ASSIGNMENTS.length; m++) {
            //for each Assignment m
            assignments.push(preAssignmentData[l][COLUMN_ASSIGNMENTS[m]]);
        }
        matcher.addPreassignedStudent(firstName, lastName, grade, assignments);
    }

    populateSheet(sheets.output, matcher);
    populateDataSheet(sheets.data, matcher);
}

/**
 * Output the results of the matcher to the given sheet.
 */
function populateSheet(outputSheet, matcher) {
    outputSheet.clear();
    outputSheet.appendRow(OUTPUT_SHEET_HEADER);
    outputSheet.setFrozenRows(1);

    matcher.fixStudentPreferences();
    matcher.matchGirls();

    // All student lines to output
    const studentLines = [];

    for (const student of matcher.allStudents) {
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

    const rowCount = studentLines.length;
    const columnCount = studentLines[0].length;
    outputSheet
        .getRange(outputSheet.getLastRow() + 1, 1, rowCount, columnCount)
        .setValues(studentLines);
}

/**
 * Output the results of the matcher to the given sheet.
 */
function populateDataSheet(dataSheet, matcher) {
    dataSheet.clear();
    dataSheet.appendRow(DATA_SHEET_HEADER1);
    Logger.log(matcher.workshopsByPopularity.length);
    for (let i = 1; i < matcher.workshopsByPopularity.length + 1; i++) {
        const workShopLine = [];
        const workshop = matcher.workshopsByNumber[i];
        workShopLine.push(workshop.name);
        workShopLine.push(workshop.number);
        let sectionNumber = 1;
        for (const session of workshop.sessions) {
            workShopLine.push(sectionNumber);
            workShopLine.push(session.slotsFilled);
            workShopLine.push(session.capacity);
            sectionNumber++;
        }
        dataSheet.appendRow(workShopLine);
    }

    dataSheet.appendRow(DATA_SHEET_HEADER2);
}
