/*globals SESSIONS_PER_WORKSHOP, PREFERENCES */
/**
 * Student Class.
 *
 * An object that contains all significant information about a single student.
 *
 * @param {} firstName       The first name of the student.
 * @param {} lastName        The last name of the student.
 * @param {} preferenceArray The ordered array of the student's preferred workshops from most to least preferred
 */
function Student(firstName, lastName, preferenceArray) {
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
}
