/*globals SpreadsheetApp, Logger */

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

var OUTPUT_SHEET_ID = "13K10UA0ZNjCDGTbVbO104CdW97DJgm3MaK2TZpiRytw";
var WORKSHOP_SHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

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
    var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
    var workshopData = workshopSheet.getDataRange().getValues();

    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var matcher = new Matcher();

    for (var i = 1; i < workshopData.length; i++) {
        var name = workshopData[i][COLUMN_WORKSHOP_NAME];
        var number = i;
        var capacity = workshopData[i][COLUMN_WORKSHOP_CAPACITY];

        matcher.addNewWorkshop(name, number, capacity);
    }

    for (var i = 1; i < responseData.length; i++) {
        // for all students i
        var firstName = responseData[i][COLUMN_FIRST_NAME];
        var lastName = responseData[i][COLUMN_LAST_NAME];

        var preferenceNums = [];

        for (var j = 0; j < PREFERENCE_COLUMNS.length; j++) {
            // for all student preferences j
            var preferredWorkshop = responseData[i][PREFERENCE_COLUMNS[j]];
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
