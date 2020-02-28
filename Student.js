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
class Student {
    constructor(
        firstName,
        lastName,
        preferenceArray,
        grade,
        sessionsPerWorkshop
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.grade = grade;
        this.sessionsPerWorkshop = sessionsPerWorkshop;

        this.preferences = preferenceArray;

        this.assignedWorkshops = [];
        for (let i = 0; i < sessionsPerWorkshop; i++) {
            this.assignedWorkshops.push(null);
        }

        this.studentScore = 0;

        // Points given for workshop assignments from most preferred to least preferred
        this.scorerPoints = [1, 3, 5, 10, 11, 12];

        // Points to be added for each workshop a student didn't want
        this.unpreferredScore = 20;

        // Points given for calculating workshop popularity based on what number preference the workshop is listed
        this.popularityPoints = [1, 1, 1, 1, 1, 1];
    }

    /**
     * Increments the popularities of all the workshops in the student's
     * preference list based on `this.popularityPoints`.
     *
     * Ignores null preferences.
     */
    updatePopularities() {
        for (let i = 0; i < this.preferences.length; i++) {
            this.preferences[i].incrementPopularity(this.popularityPoints[i]);
        }
    }

    /**
     * Assigns this student to a workshop in the student's first available slot.
     *
     * @param {workshop} workshop The workshop to add the student to.
     *
     * @throws an error if the student already has workshops in each slot.
     */
    assignWorkshop(workshop) {
        if (this.fullyAssigned()) {
            throw new Error(
                this.fullName() + " cannot be assigned any more workshops"
            );
        }

        if (this.isAssigned(workshop)) {
            throw new Error("duplicate match");
        }

        for (let j = 0; j < this.assignedWorkshops.length; j++) {
            if (this.assignedWorkshops[j] === null) {
                this.assignedWorkshops[j] = workshop;
                workshop.addStudent(this);
                break;
            }
        }
    }

    /**
     * Calculates and returns the number of workshops to which the student has been assigned.
     */
    numberAssigned() {
        let total = 0;
        for (const workshop of this.assignedWorkshops) {
            if (workshop != null) {
                total += 1;
            }
        }
        return total;
    }

    /**
     * Calculates and returns whether or not the student has been assigned a workshop in all 3 sessions.
     */
    fullyAssigned() {
        return this.numberAssigned() === this.sessionsPerWorkshop;
    }

    /**
     * Calculates and returns whether or not the student has a full list of preferences.
     */
    hasAllPreferences() {
        return this.preferences.length >= this.scorerPoints.length;
    }

    /**
     * Returns true if the student has already been assigned the listed workshop, false if not.
     */
    isAssigned(workshop) {
        return this.assignedWorkshops.indexOf(workshop) !== -1;
    }

    givenFirstPreference() {
        const firstPreference = this.preferences[0];
        return this.assignedWorkshops.indexOf(firstPreference) !== -1;
    }

    /**
     * Calculates and returns the "score" of this student's assigned workshops based on their preferences.
     */
    calculateScore() {
        this.studentScore = 0;
        for (const assignedWorkshop of this.assignedWorkshops) {
            // for each assigned workshop i
            let unpreferred = true;
            for (let j = 0; j < this.preferences.length; j++) {
                // for each preferred workshop j
                const preference = this.preferences[j];
                if (assignedWorkshop === preference) {
                    this.studentScore += this.scorerPoints[j];
                    unpreferred = false;
                }
            }
            if (unpreferred) {
                this.studentScore += this.unpreferredScore;
            }
        }
        return this.studentScore;
    }

    /**
     * Calculates and returns whether or not this student's score is equal to a given value.
     *
     * @param {int} scoreToCheck The value that is compared to this student's score.
     */
    compareToScore(scoreToCheck) {
        return scoreToCheck === this.studentScore;
    }

    /**
     * Returns the full name of the student as a string.
     */
    fullName() {
        return this.firstName.concat(" ", this.lastName);
    }

    toString() {
        return this.fullName();
    }
}
