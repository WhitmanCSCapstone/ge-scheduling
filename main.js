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
 * Workshop Session Class.
 *
 * An object that contains all significant information about a single session in a workshop.
 * This is meant to condense the workshop class's methods to avoid redundancy.
 *
 * @param {int} capacity The number of students who can be assigned to this workshop session.
 */
var Session = function(capacity) {
    this.init = function() {
        this.originalCapacity = capacity;
        this.remainingCapacity = this.originalCapacity;
    };

    /**
     * Calculates and returns whether or not the session is completely full.
     */
    this.isFull = function() {
        return this.remainingCapacity === 0;
    };

    /**
     * Calculates and returns whether or not the session is "full enough" based on the MINIMUM_WORKSHOP_FILL variable.
     */
    this.hasReachedQuorum = function() {
        return (
            this.remainingCapacity <=
            this.originalCapacity * (1 - MINIMUM_WORKSHOP_FILL)
        );
    };

    /**
     * Subtracts 1 from the session's remaining capacity.
     */
    this.addStudent = function() {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full session");
        } else {
            this.remainingCapacity -= 1;
        }
    };

    /**
     * Adds 1 to the session's remaining capacity.
     */
    this.subtractStudent = function() {
        if (this.remainingCapacity === this.originalCapacity) {
            throw new Error("Cannot remove students from an empty session");
        } else {
            this.remainingCapacity += 1;
        }
    };

    /**
     * Manually sets a the session's original and remaining capacities to a discrete value.
     *
     * @param {int} value the new integer value for the session's remaining capacity.
     */
    this.setCapacity = function(value) {
        this.originalCapacity = value;
        this.remainingCapacity = value;
    };

    this.init();
};

/**
 * Workshop Class.
 *
 * An object that contains all significant information about a single workshop.
 *
 * @param {string} name     The name of the workshop.
 * @param {int}    number   The number of the workshop as it appears in the workshop sheet.
 * @param {int}    capacity The capacity of a single session of the workshop
 */
var Workshop = function(name, number, capacity) {
    this.init = function() {
        this.name = name;
        this.number = number;

        this.sessions = [];
        for (var i = 0; i < SESSIONS_PER_WORKSHOP; i++) {
            this.sessions.push(new Session(capacity));
        }

        this.popularityScore = 0;
    };

    /**
     * Increments the popularity of the workshop based on the students' preferences.
     */
    this.incrementPopularity = function(index) {
        this.popularityScore += POPULARITY_POINTS[index];
    };

    /**
     * Calculates the total remaining capacity of the workshop.
     */
    this.totalRemainingCapacity = function() {
        var total = 0;
        for (var i = 0; i < this.sessions.length; i++) {
            total += this.sessions[i].remainingCapacity;
        }
        return total;
    };

    this.init();
};

/**
 * Returns a dictionary of Workshop objects based on the workshop sheet and response sheet.
 */
function makeWorkshopDict() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var workshopSheet = SpreadsheetApp.openById(WORKSHOP_SHEET_ID);
    var workshopData = workshopSheet.getDataRange().getValues();

    var workshopDict = {};

    for (var i = 1; i < workshopData.length; i++) {
        var name = workshopData[i][COLUMN_WORKSHOP_NAME];
        var number = i;
        var capacity = workshopData[i][COLUMN_WORKSHOP_CAPACITY];

        var newWorkshop = new Workshop(name, number, capacity);
        workshopDict[i] = newWorkshop;
    }
    return workshopDict;
}

// A dictionary containing all the workshops that can be indexed by workshop number
var WORKSHOP_DICT = makeWorkshopDict();

/**
 * Student Class.
 *
 * An object that contains all significant information about a single student.
 *
 * @param {} firstName       The first name of the student.
 * @param {} lastName        The last name of the student.
 * @param {} preferenceArray The ordered array of the student's preferred workshops from most to least preferred
 */
var Student = function(firstName, lastName, preferenceArray) {
    this.init = function() {
        this.firstName = firstName;
        this.lastName = lastName;

        this.preferences = preferenceArray;
        this.updatePopularities();

        this.assignedWorkshops = [null, null, null];
    };

    this.updatePopularities = function() {
        for (var i = 0; i < this.preferences.length; i++) {
            this.preferences[i].incrementPopularity(i);
        }
    };

    this.assignWorkshop = function(workshop, session) {
        workshop.sessions[session].addStudent();
        this.assignedWorkshops[session] = this.preferences[session];
    };

    /**
     * Swaps the session times of two workshops the student is assigned to, or moves an assigned workshop from one session time to another empty one.
     *
     * @param {int} session1 the index of one of the workshops in the student's assigned workshops.
     * @param {int} session2 the index of one of the workshops in the student's assigned workshops.
     */
    this.swapWorkshops = function(session1, session2) {
        if (this.assignedWorkshops[session1] != null) {
            this.assignedWorkshops[session1].sessions[
                session1
            ].subtractStudent();
        }
        if (this.assignedWorkshops[session2] != null) {
            this.assignedWorkshops[session2].sessions[
                session2
            ].subtractStudent();
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
    };

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
    };

    /**
     * Calculates and returns whether or not the student has been assigned a workshop in all 3 sessions.
     */
    this.fullyAssigned = function() {
        return this.numberAssigned === SESSIONS_PER_WORKSHOP;
    };

    /**
     * Calculates and returns whether or not the student has a full list of preferences.
     */
    this.hasAllPreferences = function() {
        return this.preferences.length >= PREFERENCES.length;
    };

    /**
     * Appends a workshop to a student's list of preferences
     *
     * @param {Workshop} workshop A workshop object to be appended onto the student's list of preferences
     */
    this.appendPreference = function(workshop) {
        var thisIndex = this.preferences.length;
        this.preferences.push(workshop);
        workshop.incrementPopularity(thisIndex);
    };

    this.init();
};

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
            var workshopObject = WORKSHOP_DICT[workshopNum];

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
function makeWorkshopArray() {
    var workshopArray = [];
    var workshopDictKeys = Object.keys(WORKSHOP_DICT);
    for (var i = 0; i < workshopDictKeys.length; i++) {
        var dictKey = workshopDictKeys[i];
        var thisWorkshop = WORKSHOP_DICT[dictKey];
        workshopArray.push(thisWorkshop);
    }
    workshopArray.sort(morePopular);

    return workshopArray;
}

var WORKSHOP_ARRAY = makeWorkshopArray();

/**
 * Finds students who have fewer than the correct number of unique preferences and assigns them the least preferred workshops as preferences
 */
function fixStudentPreferences() {
    for (var i = 0; i < STUDENT_ARRAY.length; i++) {
        var thisStudent = STUDENT_ARRAY[i];
        var addWorkshop = 0;
        while (!thisStudent.hasAllPreferences()) {
            thisStudent.appendPreference(WORKSHOP_ARRAY[addWorkshop]);
            addWorkshop += 1;
        }
    }
}

fixStudentPreferences();
WORKSHOP_ARRAY.sort(morePopular);

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
