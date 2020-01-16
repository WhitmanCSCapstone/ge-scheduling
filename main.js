/*globals SpreadsheetApp, Logger, Matcher */

var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;

// Column indicies of workshop info for the workshop class
var COLUMN_WORKSHOP_NAME = 2;
var COLUMN_WORKSHOP_CAPACITY = 6;

// Column indices of student preferences in order from most preferred to least
var PREFERENCE_COLUMNS = [1, 2, 3, 4, 5, 6];

// Column indices of student enrollments in order of session time
var ENROLLED = [2, 3, 4];

var HEADERS = [
    "First name",
    "Last name",
    "Session 1",
    "Session 2",
    "Session 3"
];

//VARIABLES FOR RESPONSE SPREADSHEET INDICES
var RESPONSE_SHEET_INDEX = 0;
var OUTPUT_SHEET_INDEX = 1;
var PREASSIGNMENT_SHEET_INDEX = 2;

// Formattin workshop variables
var WORKSHOP_SPREADSHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

var RESPONSE_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Response Data
var RESPONSE_SHEET = RESPONSE_SPREADSHEET.getSheets()[RESPONSE_SHEET_INDEX];
var responseData = RESPONSE_SHEET.getDataRange().getValues();

// Workshop Sheet
var WORKSHOP_SHEET = SpreadsheetApp.openById(WORKSHOP_SPREADSHEET_ID);
var workshopData = WORKSHOP_SHEET.getDataRange().getValues();

// Output Sheet
var outputSheet = RESPONSE_SPREADSHEET.getSheets()[OUTPUT_SHEET_INDEX];
//var outputData = outputSheet.getDataRange().getValues(); Only needed for reading data
//Clear the current output sheet
outputSheet.clear();
// Recreate headers
outputSheet.appendRow(HEADERS);

//Pre-Assignment Sheet
var preAssignmentSheet = RESPONSE_SPREADSHEET.getSheets()[
    PREASSIGNMENT_SHEET_INDEX
];
var preAssignmentData = preAssignmentSheet.getDataRange().getValues();
/**
 * Automatically runs when sheet is opened.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Great Explorations")
        .addItem("Match Girls to Workshops", "matchGirls")
        .addToUi();
}

/**
 * It's the main function, what more do you need to know.
 */
function main() {
    var matcher = new Matcher();

    for (var i = 1; i < workshopData.length; i++) {
        // for all workshops i
        var name = workshopData[i][COLUMN_WORKSHOP_NAME];
        var number = i;
        var capacity = workshopData[i][COLUMN_WORKSHOP_CAPACITY];

        matcher.addNewWorkshop(name, number, capacity);
    }

    for (var j = 1; j < responseData.length; j++) {
        // for all students j
        var firstName = responseData[j][COLUMN_FIRST_NAME];
        var lastName = responseData[j][COLUMN_LAST_NAME];

        var preferenceNums = [];

        for (var k = 0; k < PREFERENCE_COLUMNS.length; k++) {
            // for all student preferences k
            var preferredWorkshop = responseData[j][PREFERENCE_COLUMNS[k]];
            var workshopNum = parseInt(
                preferredWorkshop.slice(
                    preferredWorkshop.indexOf("(") + 1,
                    preferredWorkshop.indexOf(")")
                )
            );
            if (preferenceNums.indexOf(workshopNum) === -1) {
                preferenceNums.push(workshopNum);
            }
        }
        matcher.addNewStudent(firstName, lastName, preferenceNums);
    }

    populateSheet(outputSheet, matcher);
}

/**
 * Output the results of the matcher to the given sheet.
 */
function populateSheet(outputSheet, matcher) {
    outputSheet.clear();
    outputSheet.appendRow(HEADERS);

    for (var i = 0; i < matcher.allStudents.length; i++) {
        var student = matcher.allStudents[i];
        var studentLine = [];
        studentLine.push(student.firstName);
        studentLine.push(student.lastName);

        // List the student's preferences in the row
        for (var j = 0; j < student.preferences; j++) {
            var workshop = student.preferences[j];
            studentLine.push(workshop.toString());
        }

        outputSheet.appendRow(studentLine);
    }
}
