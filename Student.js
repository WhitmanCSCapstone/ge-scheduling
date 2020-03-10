/*globals Workshop, Logger*/

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
function Student(
    firstName,
    lastName,
    preferenceArray,
    grade,
    sessionsPerWorkshop
) {
    this.init = function() {
        this.firstName = firstName;
        this.lastName = lastName;
        this.grade = grade;

        this.preferences = preferenceArray;

        this.assignedWorkshops = [];
        for (var i = 0; i < sessionsPerWorkshop; i++) {
            this.assignedWorkshops.push(null);
        }

        this.givenFiller = false;

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
     * Assigns this student to a workshop in the student's first available slot.
     *
     * @param {workshop} workshop The workshop to add the student to.
     *
     * @throws an error if the student already has workshops in each slot.
     */
    this.assignWorkshop = function(workshop) {
        if (this.fullyAssigned()) {
            throw new Error(
                this.toString() + " cannot be assigned any more workshops"
            );
        }

        if (this.isAssigned(workshop)) {
            throw new Error("duplicate match");
        }

        var sessionsByFill = workshop.leastFullSessions()

        for (var i = 0; i < sessionsByFill.length; i++) { //maybe this can be refactored into a "find available slot" method?
            var currentSession = sessionsByFill[i];
            var timeSlot = currentSession.timeSlot;
            if (this.hasTimeSlotFree(timeSlot) && !currentSession.isFull()) {
                workshop.addStudent(this);
                currentSession.addStudent(this);
                this.assignedWorkshops[timeSlot] = workshop;
                return;
            }
        }
        Logger.log("problem found");
        throw new Error("what is wrong with you");
    };

    this.printAssigned = function() {
        Logger.log(this.toString());
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            workshop = this.assignedWorkshops[i];
            if (workshop === null) {
                Logger.log("    null")
            }
            else {
                Logger.log("    " + workshop.name);
            }
        }
    }

    this.assignFiller = function(workshop) {
        if (this.givenFiller) {
            throw new Error(this.toString() + " has already been assigned a filler workshop");
        }
        this.givenFiller = true;
        this.assignWorkshop(workshop);
    };

    /**
     * Calculates and returns the number of workshops to which the student has been assigned.
     */
    this.numberAssigned = function() {
        var total = 0;
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            if (this.assignedWorkshops[i] !== null) {
                total += 1;
            }
        }
        return total;
    };

    /**
     * Calculates and returns whether or not the student has been assigned a workshop in all 3 sessions.
     */
    this.fullyAssigned = function() {
        return this.numberAssigned() === sessionsPerWorkshop;
    };

    /**
     * Calculates and returns whether or not the student has a full list of preferences.
     */
    this.hasAllPreferences = function() {
        return this.preferences.length >= this.scorerPoints.length;
    };

    /**
     * Returns true if the student has already been assigned the listed workshop, false if not.
     */
    this.isAssigned = function(workshop) {
        return this.assignedWorkshops.indexOf(workshop) !== -1;
    };

    this.topAssignedPreference = function() {
        for (var i = 0; i < this.preferences.length; i++) {
            var currentWorkshop = this.preferences[i];
            if (this.isAssigned(currentWorkshop)) {
                return i;
            }
        }
        return -1;
    }

    this.hasTimeSlotFree = function(timeSlot) {
        return this.assignedWorkshops[timeSlot] === null;
    }

    this.canBeAssigned = function(workshop) {
        if (workshop === null) {
            return false;
        }
        if (workshop.isFull()) {
            return false;
        }
        if (this.isAssigned(workshop)) {
            return false;
        }
        if (this.fullyAssigned(workshop)) {
            return false;
        }
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            if (this.hasTimeSlotFree(i) && !workshop.sessions[i].isFull()) {
                return true;
            }
        }
        return false;
    }

    this.compensate = function() {
        if (this.fullyAssigned()) {
            return;
        }
        for (var i = 0; i < this.preferences.length; i++) {
            var currentPreference = this.preferences[i];
            if (currentPreference === null) {
                continue;
            }
            if (this.canBeAssigned(currentPreference)) {
                this.assignWorkshop(currentPreference);
                return;
            }
        }
        throw new Error(this.toString() + " could not be compensated for a filler workshop")
    };

    this.givenFirstPreference = function() {
        var firstPreference = this.preferences[0];
        return this.assignedWorkshops.indexOf(firstPreference) !== -1;
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
    this.toString = function() {
        return this.firstName.concat(" ", this.lastName);
    };

    this.checkPreferenceNumbers = function() {
        var preferencearray = [];
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            var assignedWorkshop = this.assignedWorkshops[i];
            if (this.preferences.indexOf(assignedWorkshop) === -1) {
                preferencearray[i] = this.preferences.length;
            } else {
                preferencearray[i] = this.preferences.indexOf(assignedWorkshop);
            }
        }
        return preferencearray;
    };

    this.init();
}
