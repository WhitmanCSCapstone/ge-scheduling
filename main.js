// TODO Search for header names instead of assuming the column indexes
var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;
var COLUMN_PREFERENCE_1 = 1;
var COLUMN_PREFERENCE_2 = 2;
var COLUMN_PREFERENCE_3 = 3;

// Column indicies of workshop info for the workshop class
var COLUMN_WORKSHOP_NAME_ENGLISH = 2;
var COLUMN_WORKSHOP_NAME_SPANISH = 8;
var COLUMN_WORKSHOP_CAPACITY = 6;
var MINIMUM_WORKSHOP_FILL = 0.75; // TODO: calculate what this value should be based on the sum of total workshop capacities and total number of students

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

var HEADERS = ['First name', 'Last name', 'Session 1', 'Session 2', 'Session 3'];

var OUTPUT_SHEET_ID = "13K10UA0ZNjCDGTbVbO104CdW97DJgm3MaK2TZpiRytw";
var WORKSHOP_SHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

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
 * Workshop Class.
 * 
 * An object that contains all significant information about a single workshop.
 * 
 * @param {int}     row             The row number of the workshop as it appears in workshopData
 * @param {array}   workshopData    The array containing all information about the workshops
 * @param {array}   responseData    The array containing the girls' responses about their workshop preferences
 */
var Workshop = function(row, workshopData, responseData){
    this.nameEnglish = workshopData[row][COLUMN_WORKSHOP_NAME_ENGLISH];
    this.nameSpanish = workshopData[row][COLUMN_WORKSHOP_NAME_SPANISH];
    this.number = row;

    this.staticCapacityA = workshopData[row][COLUMN_WORKSHOP_CAPACITY];
    this.staticCapacityB = workshopData[row][COLUMN_WORKSHOP_CAPACITY];
    this.staticCapacityC = workshopData[row][COLUMN_WORKSHOP_CAPACITY];
    this.staticCapacityTotal = this.staticCapacityA + this.staticCapacityB + this.staticCapacityC;

    this.dynamicCapacityA = this.staticCapacityA;
    this.dynamicCapacityB = this.staticCapacityB;
    this.dynamicCapacityC = this.staticCapacityC;
    this.dynamicCapacityTotal = this.staticCapacityTotal;

    this.hasReachedQuorumA = this.dynamicCapacityA <= (this.staticCapacityA * (1 - MINIMUM_WORKSHOP_FILL));
    this.hasReachedQuorumB = this.dynamicCapacityB <= (this.staticCapacityB * (1 - MINIMUM_WORKSHOP_FILL));
    this.hasReachedQuorumC = this.dynamicCapacityC <= (this.staticCapacityC * (1 - MINIMUM_WORKSHOP_FILL));

    this.isFullA = (this.dynamicCapacityA == 0);
    this.isFullB = (this.dynamicCapacityB == 0);
    this.isFullC = (this.dynamicCapacityC == 0);

    this.popularityScore = 0;
    for (var i = 1; i < responseData.length; i++) { // for every student i
        for (var j = 0; j < PREFERENCES.length; j++) { // for every student preference j
            var preferredWorkshop = responseData[i][PREFERENCES[j]];
            var workshopNum = parseFloat(preferredWorkshop.slice(preferredWorkshop.indexOf("(")+1, preferredWorkshop.indexOf(")")));
            if (workshopNum == this.number) {
                this.popularityScore += POPULARITY_POINTS[j];
            }
        }
    }

    /**
     * Recalculates important class variables used for analysis based on changes to other ones
     */
    this.statusUpdate = function() {
        this.hasReachedQuorumA = this.dynamicCapacityA <= (this.staticCapacityA * (1 - MINIMUM_WORKSHOP_FILL));
        this.hasReachedQuorumB = this.dynamicCapacityB <= (this.staticCapacityB * (1 - MINIMUM_WORKSHOP_FILL));
        this.hasReachedQuorumC = this.dynamicCapacityC <= (this.staticCapacityC * (1 - MINIMUM_WORKSHOP_FILL));

        this.isFullA = (this.dynamicCapacityA == 0);
        this.isFullB = (this.dynamicCapacityB == 0);
        this.isFullC = (this.dynamicCapacityC == 0);

        this.dynamicCapacityTotal = this.dynamicCapacityA + this.dynamicCapacityB +this.dynamicCapacityC;
    }

    /**
     * Subtracts 1 from the specified session's capacity and updates other variables accordingly
     * 
     * @param {char}    session     a character "A", "B", or "C" that describes which session that will have its capacity changed
     */
    this.addStudentToSession = function(session) {
        if (session == "A") {
            if (this.isFullA) {
                throw new Error("Session A is full for " + this.nameEnglish);
            }
            else {
                this.dynamicCapacityA -= 1;
                this.statusUpdate();
            }
        }
        else if (session == "B") {
            if (this.isFullB) {
                throw new Error("Session B is full for " + this.nameEnglish);
            }
            else {
                this.dynamicCapacityB -= 1;
                this.statusUpdate();
            }
        }
        else if (session == "C") {
            if (this.isFullC) {
                throw new Error("Session C is full for " + this.nameEnglish);
            }
            else {
                this.dynamicCapacityC -= 1;
                this.statusUpdate();
            }
        }
        else {
            throw new Error("This is not a valid session letter");
        }
    }

    /**
     * Manually sets a workshop's specified session's capacity to a discrete value and updates other variables accordingly
     * 
     * @param {char}    session     a character "A", "B", or "C" that describes which session that will have its capacity changed
     * @param {int}     value       the new integer value for the session's remaining capacity
     */
    this.setSessionCapacity = function(session, value) {
        if (session == "A") {
            this.dynamicCapacityA = value;
            this.statusUpdate();
        }
        else if (session == "B") {
            this.dynamicCapacityB = value;
            this.statusUpdate();
        }
        else if (session == "C") {
            this.dynamicCapacityC = value;
            this.statusUpdate();
        }
        else {
            throw new Error("This is not a valid session letter");
        }
    }
}

/**
 * Returns an array of workshop objects based on the workshop sheet and response sheets.
 */
function makeWorkshopArray() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
    var workshopData = workshopSheet.getDataRange().getValues();

    var workshopArray = [];

    for (var i = 1; i < workshopData.length; i++) {
        var newWorkshop = new Workshop(i, workshopData, responseData);
        workshopArray.push(newWorkshop);
    }
    return workshopArray;
}

/**
 * Used to compare two workshops based on their popularity scores.
 * 
 * @param {workshop} a A workshop from the workshop class.
 * @param {workshop} b A workshop from the workshop class.
 */
function morePopular(a, b) {
    if (a.popularityScore < b.popularityScore) {
        return -1;
    }
    else if (a.popularityScore > b.popularityScore) {
        return 1;
    }
    else {
        return 0;
    }
}

// An array containing every workshop object, sorted from least to most popular
WORKSHOP_ARRAY = makeWorkshopArray().sort(morePopular);

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
            var preferredWorkshop = responseData[i][PREFERENCES[j]];
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
        }
        else {
            outputSheet.getRange(warningCell).setValue(null);
        }
    }
}
