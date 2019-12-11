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

// Formatting workshop variables

var WORKSHOP_SHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";
var RESPONSE_SHEET_ID = "1YcO_lYO1hp9j3fBxWm-4AF_AfYCPExeuVyaJzw0Yktk";

var RESPONSE_SPREADSHEET = SpreadsheetApp.openById(RESPONSE_SHEET_ID);



// Response Data
var responseSheet = RESPONSE_SPREADSHEET.getSheets()[0];
var responseData = responseSheet.getDataRange().getValues();

// Workshop Sheet
var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
var workshopData = workshopSheet.getDataRange().getValues();

// Output Sheet
var outputSheet = RESPONSE_SPREADSHEET.getSheets()[1];
//var outputData = outputSheet.getDataRange().getValues(); Only needed for reading data
//Clear the current output sheet
outputSheet.clear();
// Recreate headers
outputSheet.appendRow(HEADERS);


//Pre-Assignment Sheet
var preAssignmentSheet = RESPONSE_SPREADSHEET.getSheets()[2];
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
}
