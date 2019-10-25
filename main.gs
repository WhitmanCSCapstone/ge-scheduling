var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;

// Column indices of student preferences in order from most preferred to least
var PREFERENCES = [1, 2, 3, 4, 5, 6];

// Points given for workshop assignments from most preferred to least preferred
var POINTS = [1, 3, 5, 10, 11, 12];

// Column indices of student enrollments in order of session time
var ENROLLED = [2, 3, 4];

// Points to be added for each workshop a student didn't want
var UNPREFERRED_SCORE = 20;

var OUTPUT_SHEET_ID = "13K10UA0ZNjCDGTbVbO104CdW97DJgm3MaK2TZpiRytw";

/**
Automatically runs when sheet is opened.
*/
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Great Explorations')
        .addItem('Match Girls to Workshops', 'matchGirls')
        .addToUi();
}

/**
 * Assign each girl to their top 3 workshops.
 */
function matchGirls() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    outputSheet.getActiveSheet().clear();

    // Recreate headers
    outputSheet.appendRow(HEADERS);

    for (var i = 1; i < responseData.length; i++){
        var firstName = responseData[i][COLUMN_FIRST_NAME];
        var lastName = responseData[i][COLUMN_LAST_NAME];
        var preference_1 = responseData[i][PREFERENCES[0]];
        var preference_2 = responseData[i][PREFERENCES[1]];
        var preference_3 = responseData[i][PREFERENCES[2]];
        outputSheet.appendRow([firstName, lastName, preference_1, preference_2, preference_3]);
    }
}
