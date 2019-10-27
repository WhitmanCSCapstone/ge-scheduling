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
        var preference_1 = responseData[i][COLUMN_PREFERENCE_1];
        var preference_2 = responseData[i][COLUMN_PREFERENCE_2];
        var preference_3 = responseData[i][COLUMN_PREFERENCE_3];
        outputSheet.appendRow([firstName, lastName, preference_1, preference_2, preference_3]);
    }
}

/**
 * Compare each girl's workshop preferences to what they were assigned in the output sheet and return a score.
 */
function scorer() {
    var score = 0;
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();
    
    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    var outputData = outputSheet.getDataRange().getValues();

    for (var i = 1; i < outputData.length; i++) { // for every student i
        var studentMatches = [];
        for (var j = 0; j < PREFERENCES.length; j++) { // for every student's preference j
            tempScore = POINTS[j];
            var preferredWorkshop = responseData[i][PREFERENCES[j]]; // TODO: NEEDS HELPER FUNCTION TO EXTRACT WORKSHOP NUMBER
            for (var k = 0; k < ENROLLED.length; k++) {
                var enrolledWorkshop = outputData[i][ENROLLED[k]]; // for every student's assigned workshop k
                if (enrolledWorkshop == preferredWorkshop) {
                    if ((studentMatches.length < 3) && (studentMatches.indexOf(PREFERENCES[j]) == -1)) {
                        studentMatches.push(PREFERENCES[j].toString());
                        score += tempScore
                    }
                }
            }
        }
        studentMatches.sort();
        while (studentMatches.length < 3) {
            studentMatches.push("X");
            score += UNPREFERRED_SCORE;
        }
    }
    Logger.log('Score: ' + score);
}

/**
 * Compare each girl's workshop preferences to what they were assigned in the output sheet
 * Appends a list to the row of the girl describing the numbers of her preferences that she recieved
 * Appends "NO MATCHES" to the row of each girl who did not receive any of her top 6 preferences
 */
function checkMatches() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();
    
    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    var outputData = outputSheet.getDataRange().getValues();

    for (var i = 1; i < outputData.length; i++) { // for every student i
        var studentMatches = [];
        for (var j = 0; j < PREFERENCES.length; j++) { // for every student's preference j
            var preferredWorkshop = responseData[i][PREFERENCES[j]]; // TODO: NEEDS HELPER FUNCTION TO EXTRACT WORKSHOP NUMBER
            for (var k = 0; k < ENROLLED.length; k++) {
                var enrolledWorkshop = outputData[i][ENROLLED[k]]; // for every student's assigned workshop k
                if (enrolledWorkshop == preferredWorkshop) {
                    if ((studentMatches.length < 3) && (studentMatches.indexOf(PREFERENCES[j]) == -1)) {
                        studentMatches.push(PREFERENCES[j].toString());
                    }
                }
            }
        }
        studentMatches.sort();
        while (studentMatches.length < 3) {
            studentMatches.push("X");
        }
        
        var matchCell = "F".concat((i+1).toString());
        var warningCell = "G".concat((i+1).toString());

        outputSheet.getRange(matchCell).setValue(studentMatches.toString());

        if (studentMatches.toString() == ["X","X","X"].toString()) {
            outputSheet.getRange(warningCell).setValue("NO MATCHES");
            Logger.log("no matches");
        }
        else {
            outputSheet.getRange(warningCell).setValue(null);
        }
    }
}