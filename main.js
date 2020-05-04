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
        preAssignment: 2
    };

    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

    return {
        responses: sheets[sheetIndices.responses],
        output: sheets[sheetIndices.output],
        preAssignment: sheets[sheetIndices.preAssignment],
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

    for (let l = 1; l < PRE_ASSIGNMENT_DATA.length; l++) {
        // For all preassignements l
        const firstName = PRE_ASSIGNMENT_DATA[l][COLUMN_FIRST_NAMEP];
        const lastName = PRE_ASSIGNMENT_DATA[l][COLUMN_LAST_NAMEP];
        const grade = PRE_ASSIGNMENT_DATA[l][COLUMN_GRADEP];
        const assignments = [];
        for (let m = 0; m < COLUMN_ASSIGNMENTS.length; m++) {
            //for each Assignment m
            assignments.push(PRE_ASSIGNMENT_DATA[l][COLUMN_ASSIGNMENTS[m]]);
        }

        matcher.addPreassignedStudent(firstName, lastName, grade, assignments);
    }

    populateSheet(sheets.output, matcher);
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

    for (const student of matcher.preAssignedStudents) {
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
