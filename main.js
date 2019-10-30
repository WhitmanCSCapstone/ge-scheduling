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

var Workshop = function(row){
    var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
    var workshopData = workshopSheet.getDataRange().getValues();

    this.nameEnglish = workshopData[row][COLUMN_WORKSHOP_NAME_ENGLISH];
    this.nameSpanish = workshopData[row][COLUMN_WORKSHOP_NAME_SPANISH];
    this.number = row + 1;

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

    this.popularityScore = 0; // TODO: calculate this based on the student preferences
    this.popularityRank = 0; // TODO: calculate this based on the student preferences

    this.statusUpdate = function() {
        this.hasReachedQuorumA = this.dynamicCapacityA <= (this.staticCapacityA * (1 - MINIMUM_WORKSHOP_FILL));
        this.hasReachedQuorumB = this.dynamicCapacityB <= (this.staticCapacityB * (1 - MINIMUM_WORKSHOP_FILL));
        this.hasReachedQuorumC = this.dynamicCapacityC <= (this.staticCapacityC * (1 - MINIMUM_WORKSHOP_FILL));

        this.isFullA = (this.dynamicCapacityA == 0);
        this.isFullB = (this.dynamicCapacityB == 0);
        this.isFullC = (this.dynamicCapacityC == 0);

        this.dynamicCapacityTotal = this.dynamicCapacityA + this.dynamicCapacityB +this.dynamicCapacityC;
    }

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
      
function workshopTesting() {
    var row = 1;
    var workShopOne = new Workshop(row);
    Logger.log(workShopOne.nameEnglish);
    Logger.log(workShopOne.isFullA);
    Logger.log(workShopOne.dynamicCapacityA);
    workShopOne.addStudentToSession("A");
    Logger.log(workShopOne.dynamicCapacityA);
    workShopOne.setSessionCapacity("A", 1);
    Logger.log(workShopOne.dynamicCapacityA);
    Logger.log(workShopOne.dynamicCapacityTotal);
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
            Logger.log("no matches");
        }
        else {
            outputSheet.getRange(warningCell).setValue(null);
        }
    }
}
