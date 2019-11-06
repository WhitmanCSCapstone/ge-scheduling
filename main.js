// TODO Search for header names instead of assuming the column indexes
var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;
var COLUMN_PREFERENCE_1 = 1;
var COLUMN_PREFERENCE_2 = 2;
var COLUMN_PREFERENCE_3 = 3;

// Column indicies of workshop info for the workshop class
var COLUMN_WORKSHOP_NAME = 2;
var COLUMN_WORKSHOP_CAPACITY = 6;
var MINIMUM_WORKSHOP_FILL = 0.75; // TODO: calculate what this value should be based on the sum of total workshop capacities and total number of students\
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
 * Workshop Session Class.
 * 
 * An object that contains all significant information about a single session in a workshop.
 * This is meant to condense the workshop class's methods to avoid redundancy.
 * 
 * @param {int}   row          The row number of the workshop as it appears in workshopData.
 * @param {array} workshopData The array containing the girls' responses about their workshop preferences.
 */
var Session = function(row, workshopData) {
    this.init = function() {
        this.originalCapacity = workshopData[row][COLUMN_WORKSHOP_CAPACITY];
        this.remainingCapacity = this.originalCapacity;
    }

    /**
     * Calculates and returns whether or not the session is completely full.
     */
    this.isFull = function() {
        return (this.remainingCapacity == 0);
    }

    /**
     * Calculates and returns whether or not the session is "full enough" based on the MINIMUM_WORKSHOP_FILL variable.
     */
    this.hasReachedQuorum = function() {
        return (this.remainingCapacity <= (this.originalCapacity * (1 - MINIMUM_WORKSHOP_FILL)))
    }

    /**
     * Subtracts 1 from the session's remaining capacity.
     */
    this.addStudent = function() {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full session");
        }
        else {
            this.remainingCapacity -= 1;
        }
    }

    /**
     * Adds 1 to the session's remaining capacity.
     */
    this.subtractStudent = function() {
        if (this.remainingCapacity == this.originalCapacity) {
            throw new Error("Cannot remove students from an empty session");
        }
        else {
            this.remainingCapacity += 1;
        }
    }

    /**
     * Manually sets a the session's original and remaining capacities to a discrete value.
     * 
     * @param {int} value the new integer value for the session's remaining capacity.
     */
    this.setCapacity = function(value) {
        this.originalCapacity = value;
        this.remainingCapacity = value;
    }

    this.init();
}

/**
 * Workshop Class.
 * 
 * An object that contains all significant information about a single workshop.
 * 
 * @param {int}   row          The row number of the workshop as it appears in workshopData.
 * @param {array} workshopData The array containing all information about the workshops.
 * @param {array} responseData The array containing the girls' responses about their workshop preferences.
 */
var Workshop = function(row, workshopData, responseData) {
    this.init = function() {
        this.name = workshopData[row][COLUMN_WORKSHOP_NAME];
        this.number = row;

        this.sessions = [];
        for (var i = 0; i < SESSIONS_PER_WORKSHOP; i++) {
            this.sessions.push(new Session(row, workshopData));
        }

        this.popularityScore = this.calculatePopularity();
    }

    /**
     * Calcuates the popularity of the workshop based on the students' survey responses.
     */
    this.calculatePopularity = function() {
        var popularity = 0;
        for (var i = 1; i < responseData.length; i++) { // for every student i
            for (var j = 0; j < PREFERENCES.length; j++) { // for every student preference j
                var preferredWorkshop = responseData[i][PREFERENCES[j]];
                var workshopNum = parseFloat(preferredWorkshop.slice(preferredWorkshop.indexOf("(")+1, preferredWorkshop.indexOf(")")));
                if (workshopNum == this.number) {
                    popularity += POPULARITY_POINTS[j];
                }
            }
        }
        return popularity;
    }
    
    /**
     * Calculates the total remaining capacity of the workshop.
     */
    this.totalRemainingCapacity = function(){
        var total = 0;
        for (var i = 0; i < this.sessions.length; i++) {
            total += this.sessions[i].remainingCapacity;
        }
        return total;
    }

    this.init();
}

/**
 * Returns an array of Workshop objects based on the workshop sheet and response sheets.
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

/**
 * Student Class.
 * 
 * An object that contains all significant information about a single student.
 */
var Student = function(row, responseData) {
    this.init = function() {
        this.firstName = responseData[row][COLUMN_FIRST_NAME];
        this.lastName = responseData[row][COLUMN_LAST_NAME];

        this.preferences = this.getPreferences();

        this.assignedWorkshops = [null, null, null];
    }

    this.getPreferences = function() {
        var preferences = [];
        for (var i = 0; i < PREFERENCES.length; i++) {
            var preferredWorkshop = responseData[row][PREFERENCES[i]];
            var workshopNum = parseFloat(preferredWorkshop.slice(preferredWorkshop.indexOf("(")+1, preferredWorkshop.indexOf(")")));
            for (var j = 0; j < WORKSHOP_ARRAY.length; j++) {
                if (WORKSHOP_ARRAY[j].number == workshopNum) {
                    preferences.push(WORKSHOP_ARRAY[j]);
                }
            }
        }
        return preferences;
    }

    this.assignWorkshop = function(workshop, session) {
        workshop.sessions[session].addStudent();
        this.assignedWorkshops[session] = this.preferences[session];
    }

    /**
     * Swaps the session times of two workshops the student is assigned to, or moves an assigned workshop from one session time to another empty one.
     * 
     * @param {int} session1 the index of one of the workshops in the student's assigned workshops.
     * @param {int} session2 the index of one of the workshops in the student's assigned workshops.
     */
    this.swapWorkshops = function(session1, session2) {
        if (this.assignedWorkshops[session1] != null) {
            this.assignedWorkshops[session1].sessions[session1].subtractStudent();
        }
        if (this.assignedWorkshops[session2] != null) {
            this.assignedWorkshops[session2].sessions[session2].subtractStudent();
        }

        var temp = this.assignedWorkshops[session1];
        this.assignedWorkshops[session1] = this.assignedWorkshops[session2];
        this.assignedWorkshops[session2] = temp;
        
        if (this.assignedWorkshops[session1] != null) {
            this.assignedWorkshops[session1].sessions[session1].addStudent();
        }
        if (this.assignedWorkshops[session2] != null) {
            this.assignedWorkshops[session2].sessions[session2].addStudent();
        }
    }

    /**
     * Calculates and returns the number of workshops that the student has already been assigned to.
     */
    this.numberAssigned = function() {
        var total = 0;
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            if (this.assignedWorkshops[i] != null) {
                total += 1;
            }
        }
        return total;
    }

    /**
     * Calculates and returns whether or not the student has been assigned a workshop in all 3 sessions.
     */
    this.fullyAssigned = function() {
        return (this.numberAssigned == SESSIONS_PER_WORKSHOP);
    }

    this.init();
}

/**
 * Returns an array of Student objects based on the response data.
 */
function makeStudentArray() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var studentArray = [];

    for (var i = 1; i < responseData.length; i++) {
        studentArray.push(new Student(i, responseData));
    }
    return studentArray;
}

var STUDENT_ARRAY = makeStudentArray();

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
 * Compare each girl's workshop preferences to what they were assigned in the output sheet.
 * Appends a list to the row of the girl describing the numbers of her preferences that she recieved.
 * Appends "NO MATCHES" to the row of each girl who did not receive any of her top 6 preferences.
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

        if (studentMatches.toString() == ["X", "X", "X"].toString()) {
            outputSheet.getRange(warningCell).setValue("NO MATCHES");
        }
        else {
            outputSheet.getRange(warningCell).setValue(null);
        }
    }
}
