/*globals Workshop */

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
     * Increments the popularities of all the workshops in the student's
     * preference list based on `this.popularityPoints`.
     *
     * Ignores null preferences.
     */
    this.updatePopularities = function() {
        for (var i = 0; i < this.preferences.length; i++) {
            this.preferences[i].incrementPopularity(this.popularityPoints[i]);
        }
    };

    /**
     * Assigns this student to a workshop.
     *
     * Uses the first slot that both the student and the workshop have
     * available.
     *
     * @param {workshop} workshop The workshop to add the student to.
     *
     * @throws an error if the student and workshop have no common slot.
     */
    this.assignWorkshop = function(workshop) {
        // If the student has an open slot that matches the workshop,
        // assign the student to a session that works for them.
        var slotNumber = this.findAvailableSession(workshop);
        if (slotNumber !== null) {
            this.assignWorkshopSession(workshop, slotNumber);
        } else {
            throw new Error(
                "Could not find open session slot to add student " +
                    this.firstName +
                    " " +
                    this.lastName +
                    " to workshop " +
                    workshop.name
            );
        }
    };

    /**
     * Finds an open slot in both the student and workshop.
     *
     * @param {Workshop}    workshop    A workshop to put this student in.
     *
     * @returns {int}   A viable slot, or null if none is found
     */
    this.findAvailableSession = function(workshop) {
        // Check through the times this student is available.
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            var slot = this.assignedWorkshops[i];
            var session = workshop.sessions[i];

            if (slot === null) {
                // Then check the corresponding session.
                // If there's still room in the session, we're good.
                if (!session.hasReachedQuorum()) {
                    return i;
                }
            }
        }
        // Otherwise, this workshop doesn't fit with the student's schedule.
        return null;
    };

    /**
     * Assign this student to a particular workshop session.
     * @access private
     * @param {Workshop}    workshop    A workshop to put this student in.
     * @param {int}         session     A session number to put the student in.
     */
    this.assignWorkshopSession = function(workshop, session) {
        workshop.sessions[session].addStudent();
        this.assignedWorkshops[session] = workshop;
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
                if (assignedWorkshop === thisPreference) {
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
    };

    /**
     * Returns the full name of the student as a string.
     */
    this.fullName = function() {
        return this.firstName.concat(" ", this.lastName);
    };

    this.toString = function() {
        return this.fullName();
    };

    this.init();
}
