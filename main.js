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

// Column indicies of the Pre-assignment Sheet
const COLUMN_FIRST_NAMEP = 0;
const COLUMN_LAST_NAMEP = 1;
const COLUMN_GRADEP = 2;
const COLUMN_ASSIGNMENTS = [3, 4, 5];

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

    populateSheet(outputSheet, matcher);

    // DEBUG
    checkCapacity(matcher);
}

/**
 * Output the results of the matcher to the given sheet.
 */
function populateSheet(outputSheet, matcher) {
    outputSheet.clear();
    outputSheet.appendRow(OUTPUT_SHEET_HEADERS);
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

function checkCapacity(matcher) {
    for (const workshop of Object.values(matcher.workshopsByNumber)) {
        //console.log("Workshop: " + workshop.toString());
        for (const [i, session] of workshop.sessions.entries()) {
            //console.log("Session " + i.toString());
            //console.log("with " + session.studentsAssigned.length.toString() + " students assigned");
            //console.log(session.slotsFilled + " slots filled");
            //console.log("and capacity of " + session.capacity.toString());

            if (
                session.slotsFilled !== session.studentsAssigned.length ||
                session.capacity * 3 !== workshop.totalBaseCapacity
            ) {
                console.log(
                    "Session " +
                        i.toString() +
                        " of workshop " +
                        workshop.toString +
                        " has a discrepancy!"
                );
            }
            if (session.slotsFilled > session.capacity) {
                console.log(
                    "Session " +
                        i.toString() +
                        " of workshop " +
                        workshop.toString +
                        " is overfull!"
                );
            }
        }
    }

    for (let i = 0; i < 3; i++) {
        // console.log(
        //     "Workshop 'filledness' according to Students for session " +
        //         i.toString()
        // );

        // Workshop:studentCount pairs
        const workshopFilledness = {};
        for (const workshop of Object.values(matcher.workshopsByNumber)) {
            workshopFilledness[workshop.name] = 0;

            // Count up all the student assignments
            for (const student of matcher.allStudents) {
                if (student.assignedWorkshops[i] === workshop) {
                    workshopFilledness[workshop.name] += 1;
                }
            }

            const filledness = workshopFilledness[workshop.name];
            if (filledness !== workshop.sessions[i].studentsAssigned.length) {
                /* FIXME
                 * This is the big scheduling issue. The Workshops' list of
                 * assigned Students and their redundant count of assigned
                 * Students are both equal, but they differ from the number of
                 * Students who list the Workshop in one of their time slots.
                 *
                 * Note that the discrepancies go both ways; Some workshops
                 * have more students than they recognize, while others have
                 * fewer.
                 *
                 * Check logs to see the list of problematic workshop sessions.
                 *
                 * Once fixed, we may find that our performance estimates were
                 * inflated. The algorithm may perform worse than we expected.
                 */
                console.log(
                    workshop.name +
                        " has " +
                        filledness.toString() +
                        " students claiming to be in session " +
                        i.toString() +
                        " but the workshop knows of exactly " +
                        workshop.sessions[i].studentsAssigned.length +
                        " students assigned to it."
                );
            }
        }
    }
}
