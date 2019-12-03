/**
 * Student Class.
 *
 * An object that contains all significant information about a single student.
 *
 * @param {string} firstName           The first name of the student.
 * @param {string} lastName            The last name of the student.
 * @param {array}  preferenceArray     The ordered array of the student's preferred workshops from most to least preferred.
 * @param {int}    sessionsPerWorkshop The number of sessions in a workshop.
 */
function Student(firstName, lastName, preferenceArray, sessionsPerWorkshop) {
    this.init = function() {
        this.firstName = firstName;
        this.lastName = lastName;

        this.preferences = preferenceArray;

        this.assignedWorkshops = []; 
        for (var i = 0; i < sessionsPerWorkshop; i++) {
            this.assignedWorkshops.push(null);
        }

        this.studentScore = 0;

        // Points given for workshop assignments from most preferred to least preferred
        this.scorerPoints = [1, 3, 5, 10, 11, 12];

        // Points to be added for each workshop a student didn't want
        this.unpreferredScore = 20;

        // Points given for calculating workshop popularity based on what number preference the workshop is listed
        this.popularityPoints = [1, 1, 1, 1, 1, 1];
    };

    /**
     * Increments the popularities of all the workshops in the student's preference list based on this.popularityPoints
     */
    this.updatePopularities = function() {
        for (var i = 0; i < this.preferences.length; i++) {
            this.preferences[i].incrementPopularity(this.popularityPoints[i]);
        }
    };

    /**
     * Adds the given workshop to the student's assigned workshops.
     * 
     * @param {*} workshop The workshop to be added the student's assigned workshop array.
     * @param {*} session  The index where the workshop will be placed in the student's assigned workshop array.
     */
    this.assignWorkshop = function(workshop, session) {
        workshop.sessions[session].addStudent();
        this.assignedWorkshops[session] = this.preferences[session];
    };

    /**
     * Swaps the session times of two workshops the student is assigned to, or moves an assigned workshop from one session time to another empty one.
     *
     * @param {int} session1 The index of one of the workshops in the student's assigned workshops.
     * @param {int} session2 The index of one of the workshops in the student's assigned workshops.
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
     * Calculates and returns the number of workshops to which the student has been assigned.
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
        return this.numberAssigned === sessionsPerWorkshop;
    };

    /**
     * Calculates and returns whether or not the student has a full list of preferences.
     */
    this.hasAllPreferences = function() {
        return this.preferences.length >= this.scorerPoints.length;
    };

    /**
     * Appends a workshop to a student's list of preferences.
     *
     * @param {Workshop} workshop A workshop object to be appended onto the student's list of preferences.
     */
    this.appendPreference = function(workshop) {
        var thisIndex = this.preferences.length;
        this.preferences.push(workshop);
        workshop.incrementPopularity(this.popularityPoints[thisIndex]);
    };

    /**
     * Calculates and returns the "score" of this student's assigned workshops based on their preferences.
     */
    this.calculateScore = function() {
        this.studentScore = 0;
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            // for each assigned workshop i
            var unpreferred = true;
            var assignedWorkshop = this.assignedWorkshops[i];
            for (var j = 0; j < this.preferences.length; j++) {
                // for each preferred workshop j
                var thisPreference = this.preferences[j];
                if (assignedWorkshop == thisPreference) {
                    this.studentScore += this.scorerPoints[j];
                    unpreferred = false;
                }
            }
            if (unpreferred) {
                this.studentScore += this.unpreferredScore;
            }
        }
        return this.studentScore;
    };

    /**
     * Calculates and returns whether or not this student's score is equal to a given value.
     * 
     * @param {int} scoreToCheck The value that is compared to this student's score.
     */
    this.compareToScore = function(scoreToCheck) {
        return scoreToCheck === this.studentScore;
    }

    /**
     * Returns the full name of the student as a string.
     */
    this.fullName = function() {
        return this.firstName.concat(" ", this.lastName);
    }

    this.init();
};
