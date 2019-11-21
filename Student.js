/**
 * Student Class.
 *
 * An object that contains all significant information about a single student.
 *
 * @param {} firstName       The first name of the student.
 * @param {} lastName        The last name of the student.
 * @param {} preferenceArray The ordered array of the student's preferred workshops from most to least preferred
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
    };

    this.updatePopularities = function(popularityPoints) {
        for (var i = 0; i < this.preferences.length; i++) {
            this.preferences[i].incrementPopularity(popularityPoints[i]);
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
        return this.numberAssigned === sessionsPerWorkshop;
    };

    /**
     * Calculates and returns whether or not the student has a full list of preferences.
     */
    this.hasAllPreferences = function(numberOfPrefs) {
        return this.preferences.length >= numberOfPrefs;
    };

    /**
     * Appends a workshop to a student's list of preferences
     *
     * @param {Workshop} workshop A workshop object to be appended onto the student's list of preferences
     */
    this.appendPreference = function(workshop) {
        var thisIndex = this.preferences.length;
        this.preferences.push(workshop);
        return thisIndex;
    };

    this.calculateScore = function(scorerPoints, unpreferredScore) {
        for (var i = 0; i < this.assignedWorkshops.length; i++) {
            // for each assigned workshop i
            var unpreferred = true;
            var assignedWorkshop = this.assignedWorkshops[i];
            for (var j = 0; j < this.preferences.length; j++) {
                // for each preferred workshop j
                var thisPreference = this.preferences[j];
                if (assignedWorkshop == thisPreference) {
                    this.studentScore += scorerPoints[j];
                    unpreferred = false;
                }
            }
            if (unpreferred) {
                this.studentScore += unpreferredScore;
            }
        }
        return this.studentScore;
    };

    this.compareToScore = function(scoreToCheck) {
        return scoreToCheck === this.studentScore;
    }

    this.fullName = function() {
        return this.firstName.concat(" ", this.lastName);
    }

    this.init();
};
