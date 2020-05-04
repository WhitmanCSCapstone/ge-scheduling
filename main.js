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

const META_SHEET_HEADER1 = [
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

const META_SHEET_HEADER2 = [
    "# of First Preferences",
    "# of Second Preferences",
    "# of Third Preferences",
    "# of Fourth Preferences",
    "# of Fifth Preferences",
    "# of Sixth Preferences",
    "# of Not Preferenced"
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
        preAssignment: 2,
        meta: 3
    };

    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

    return {
        responses: sheets[sheetIndices.responses],
        output: sheets[sheetIndices.output],
        preAssignment: sheets[sheetIndices.preAssignment],
        meta: sheets[sheetIndices.meta],
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
    populateMetaSheet(sheets.meta, matcher);
}

function outputRows(sheet, lines) {
    const rowCount = lines.length;
    const columnCount = lines[0].length;
    sheet
        .getRange(sheet.getLastRow() + 1, 1, rowCount, columnCount)
        .setValues(lines);
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

    outputRows(outputSheet, studentLines);
}

/**
 * Output information about the matching results to the given sheet.
 */
function populateMetaSheet(metaSheet, matcher) {
    metaSheet.clear();
    const metaLines = [];
    metaSheet.appendRow(META_SHEET_HEADER1);
    Logger.log(matcher.workshopsByPopularity.length);
    for (let i = 1; i < matcher.workshopsByPopularity.length + 1; i++) {
        const workshopLine = [];
        const workshop = matcher.workshopsByNumber[i];
        workshopLine.push(workshop.name);
        workshopLine.push(workshop.number);
        let sectionNumber = 1;
        for (const session of workshop.sessions) {
            workshopLine.push(sectionNumber);
            workshopLine.push(session.slotsFilled);
            workshopLine.push(session.capacity);
            sectionNumber++;
        }
        metaLines.push(workshopLine);
    }

    outputRows(metaSheet, metaLines);

    // Header 2 is not yet used
    //metaSheet.appendRow(META_SHEET_HEADER2);
}
