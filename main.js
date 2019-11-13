/*globals SpreadsheetApp, Logger */

var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;
var COLUMN_PREFERENCE_1 = 1;
var COLUMN_PREFERENCE_2 = 2;
var COLUMN_PREFERENCE_3 = 3;

// Column indicies of workshop info for the workshop class
var COLUMN_WORKSHOP_NAME = 2;
var COLUMN_WORKSHOP_CAPACITY = 6;
var MINIMUM_WORKSHOP_FILL = 0.75;
var SESSIONS_PER_WORKSHOP = 3;

// Column indices of student preferences in order from most preferred to least
var PREFERENCES = [1, 2, 3, 4, 5, 6];

// Points given for workshop assignments from most preferred to least preferred
var POINTS = [1, 3, 5, 10, 11, 12];

// Points given for calculating workshop popularity based on what number preference the workshop is listed
var POPULARITY_POINTS = [1, 1, 1, 1, 1, 1];

// Column indices of student enrollments in order of session time
var ENROLLED = [2, 3, 4];

// Points to be added for each workshop a student didn't want
var UNPREFERRED_SCORE = 20;

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
Automatically runs when sheet is opened.
*/
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Great Explorations")
        .addItem("Match Girls to Workshops", "matchGirls")
        .addToUi();
}

/**
 * Returns an object made of Workshop objects based on the workshop sheet and response sheet.
 */
function makeAllWorkshops() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
    var workshopData = workshopSheet.getDataRange().getValues();

    var workshops = {};

    for (var i = 1; i < workshopData.length; i++) {
        var name = workshopData[i][COLUMN_WORKSHOP_NAME];
        var number = i;
        var capacity = workshopData[i][COLUMN_WORKSHOP_CAPACITY];

        var newWorkshop = new Workshop(name, number, capacity);
        workshops[i] = newWorkshop;
    }
    return workshops;
}

// An object containing all the workshops that can be indexed by workshop number
var NUMBERED_WORKSHOPS = makeAllWorkshops();

/**
 * Returns an array of Student objects based on the response data.
 */
function makeStudentArray() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var studentArray = [];

    for (var i = 1; i < responseData.length; i++) {
        // for all students i
        var firstName = responseData[i][COLUMN_FIRST_NAME];
        var lastName = responseData[i][COLUMN_LAST_NAME];

        var preferenceArray = [];

        for (var j = 0; j < PREFERENCES.length; j++) {
            // for all student preferences j
            var preferredWorkshop = responseData[i][PREFERENCES[j]];
            var workshopNum = parseInt(
                preferredWorkshop.slice(
                    preferredWorkshop.indexOf("(") + 1,
                    preferredWorkshop.indexOf(")")
                )
            );
            var workshopObject = NUMBERED_WORKSHOPS[workshopNum];

            var uniquePreference = true; // make sure this preference is not a duplicate

            for (var k = 0; k < preferenceArray.length; k++) {
                // for all already listed preferences k
                if (workshopObject === preferenceArray[k]) {
                    uniquePreference = false;
                }
            }

            if (uniquePreference) {
                preferenceArray.push(workshopObject);
            }
        }
        studentArray.push(new Student(firstName, lastName, preferenceArray));
    }
    return studentArray;
}

// An array containing Student objects representing every student who responded to the survey
var STUDENT_ARRAY = makeStudentArray();

/**
 * Used to compare two workshops based on their popularity scores.
 *
 * @param {workshop} a A workshop from the workshop class.
 * @param {workshop} b A workshop from the workshop class.
 */
function morePopular(a, b) {
    if (a.popularityScore < b.popularityScore) {
        return -1;
    } else if (a.popularityScore > b.popularityScore) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Creates an array of all the workshop objects sorted by popularity
 */
function makePopularWorkshops() {
    var workshopArray = [];
    var workshopKeys = Object.keys(NUMBERED_WORKSHOPS);
    for (var i = 0; i < workshopKeys.length; i++) {
        var key = workshopKeys[i];
        var thisWorkshop = NUMBERED_WORKSHOPS[key];
        workshopArray.push(thisWorkshop);
    }
    workshopArray.sort(morePopular);

    return workshopArray;
}

// An array of all the workshop objects ordered from least to most popular
var POPULAR_WORKSHOPS = makePopularWorkshops();

/**
 * Finds students who have fewer than the correct number of unique preferences and assigns them the least preferred workshops as preferences
 */
function fixStudentPreferences() {
    for (var i = 0; i < STUDENT_ARRAY.length; i++) {
        var thisStudent = STUDENT_ARRAY[i];
        var addWorkshop = 0;
        while (!thisStudent.hasAllPreferences()) {
            thisStudent.appendPreference(POPULAR_WORKSHOPS[addWorkshop]);
            addWorkshop += 1;
        }
    }
}

fixStudentPreferences();
POPULAR_WORKSHOPS.sort(morePopular);

/**
 * The main algorithm that matches each girl with as many of her preferred workshops as possible.
 */
function matchGirls() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    outputSheet.getActiveSheet().clear();

    // Recreate headers
    outputSheet.appendRow(HEADERS);

    for (var i = 1; i < responseData.length; i++) {
        var firstName = responseData[i][COLUMN_FIRST_NAME];
        var lastName = responseData[i][COLUMN_LAST_NAME];
        var preference_1 = responseData[i][COLUMN_PREFERENCE_1];
        var preference_2 = responseData[i][COLUMN_PREFERENCE_2];
        var preference_3 = responseData[i][COLUMN_PREFERENCE_3];
        outputSheet.appendRow([
            firstName,
            lastName,
            preference_1,
            preference_2,
            preference_3
        ]);
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

    for (var i = 1; i < outputData.length; i++) {
        // for every student i
        var studentMatches = [];
        for (var j = 0; j < PREFERENCES.length; j++) {
            // for every student's preference j
            var tempScore = POINTS[j];
            var preferredWorkshop = responseData[i][PREFERENCES[j]];
            for (var k = 0; k < ENROLLED.length; k++) {
                // for every student's assigned workshop k
                var enrolledWorkshop = outputData[i][ENROLLED[k]];
                if (enrolledWorkshop === preferredWorkshop) {
                    if (
                        studentMatches.length < 3 &&
                        studentMatches.indexOf(PREFERENCES[j]) === -1
                    ) {
                        studentMatches.push(PREFERENCES[j].toString());
                        score += tempScore;
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
    Logger.log("Score: " + score);
}

/**
 * Compare each girl's workshop preferences to what they were assigned in the output sheet.
 * Appends a list to the row of the girl describing the numbers of her preferences that she recieved.
 * Appends "NO MATCHES" to the row of each girl who did not receive any of her top 6 preferences.
 */
function checkMatches() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    var outputData = outputSheet.getDataRange().getValues();

    for (var i = 1; i < outputData.length; i++) {
        // for every student i
        var studentMatches = [];
        for (var j = 0; j < PREFERENCES.length; j++) {
            // for every student's preference j
            var preferredWorkshop = responseData[i][PREFERENCES[j]];
            for (var k = 0; k < ENROLLED.length; k++) {
                // for every student's assigned workshop k
                var enrolledWorkshop = outputData[i][ENROLLED[k]];
                if (enrolledWorkshop === preferredWorkshop) {
                    if (
                        studentMatches.length < 3 &&
                        studentMatches.indexOf(PREFERENCES[j]) === -1
                    ) {
                        studentMatches.push(PREFERENCES[j].toString());
                    }
                }
            }
        }
        studentMatches.sort();
        while (studentMatches.length < 3) {
            studentMatches.push("X");
        }

        var matchCell = "F".concat((i + 1).toString());
        var warningCell = "G".concat((i + 1).toString());

        outputSheet.getRange(matchCell).setValue(studentMatches.toString());

        if (studentMatches.toString() === ["X", "X", "X"].toString()) {
            outputSheet.getRange(warningCell).setValue("NO MATCHES");
        } else {
            outputSheet.getRange(warningCell).setValue(null);
        }
    }
}
