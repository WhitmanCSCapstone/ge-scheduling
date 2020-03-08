/*globals Logger, Workshop, Student */

/**
 * Matcher Class.
 *
 * An object used to simulate a complete set of students and workshops, used to create the matches for each student with workshops.
 */
class Matcher {
    constructor() {
        // The number of sessions that an individual workshop has
        this.sessionsPerWorkshop = 3; // maybe could be moved to a subclass

        // An object containing all the workshops that can be indexed by workshop number
        this.workshopsByNumber = {};

        // An array containing Student objects representing every student
        this.allStudents = [];

        // An array containing Student objects that are preassigned
        this.preAssignedStudents = [];

        // An array containing all workshop objects sorted from least to most popular
        this.workshopsByPopularity = [];

        // An array containing all the workshops that aren't popular enough to be filled by people that list them as preferences
        this.unpopularWorkshops = [];

        // A number representing the quality of the final matches. The lower the score the better
        this.score = 0;

        // The minimum percentage that each workshop must be filled to
        this.minimumWorkshopFill = 0.7;

        // The number of preferences each student should have
        this.numberOfPreferences = 6;
    }

    /**
     * Adds a new Workshop into workshopsByNumber and workshopsByPopularity
     *
     * @param {string} name     The name of the workshop.
     * @param {int}    number   The number of the workshop.
     * @param {int}    capacity The capacity of each session of the workshop.
     */
    addNewWorkshop(name, number, capacity, location) {
        const thisWorkshop = new Workshop(
            name,
            number,
            capacity,
            location,
            this.sessionsPerWorkshop,
            this.minimumWorkshopFill
        );

        this.workshopsByNumber[number] = thisWorkshop;
        this.workshopsByPopularity.push(thisWorkshop);
    }

    /**
     * Adds a new Student object into allStudents
     *
     * @param {string} firstName      The first name of the student.
     * @param {string} lastName       The last name of the student.
     * @param {array}  preferenceNums The student's preferences as an array of integers.
     */
    addNewStudent(firstName, lastName, preferenceNums, grade) {
        const preferenceArray = [];

        for (const n in preferenceNums) {
            const preference = this.workshopsByNumber[preferenceNums[n]];
            preferenceArray.push(preference);
        }

        const student = new Student(
            firstName,
            lastName,
            preferenceArray,
            grade,
            this.sessionsPerWorkshop
        );

        this.allStudents.push(student);
        student.updatePopularities();
    }

    /**
     * Adds a preassigned Student object into preAssignedStudents
     *
     * @param {string} firstNameP      The first name of the student.
     * @param {string} lastNameP       The last name of the student.
     * @param {string} gradeP          The last name of the student.
     * @param {array}  assignements    The student's assignments as an array of integers.
     */
    addPreassStudent(firstNameP, lastNameP, gradeP, assignments) {
        const student = new Student(
            firstNameP,
            lastNameP,
            assignments,
            gradeP,
            this.sessionsPerWorkshop
        );
        for (let i = 0; i < assignments.length; i++) {
            //for all assignments
            const workshop = this.workshopsByNumber[assignments[i]];
            student.assignWorkshop(workshop);
        }
        this.preAssignedStudents.push(student);
    }

    /**
     * Helper function for sorting that compares two workshops by their popularity.
     *
     * @param {Workshop} workshopA A workshop to have its popularity compared to workshopB.
     * @param {Workshop} workshopB A workshop to have its popularity compared to workshopA.
     */
    morePopular(workshopA, workshopB) {
        if (workshopA.popularityScore < workshopB.popularityScore) {
            return -1;
        } else if (workshopA.popularityScore > workshopB.popularityScore) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Sorts the workshopsByPopularity array from least to most popular.
     */
    sortWorkshops() {
        this.workshopsByPopularity.sort(this.morePopular);
    }

    /**
     * Appends "null" to a student's preference list if they have fewer than the correct number of preferences
     */
    fixStudentPreferences() {
        for (const student of this.allStudents) {
            while (!student.hasAllPreferences()) {
                student.preferences.push(null);
            }
        }
    }

    /**
     * Calculates the absolute maximum percentage that every workshop can be filled to. this.minimumWorkshopFill can NOT be above this number.
     */
    calculateMinPercent() {
        let totalSlots = 0;
        for (const workshop of this.workshopsByPopularity) {
            totalSlots += workshop.totalBaseCapacity;
        }
        const minPercent =
            (this.allStudents.length * this.sessionsPerWorkshop) / totalSlots;
        Logger.log("minimum possible average fill: " + minPercent);
    }

    /**
     * Returns an array of students who are eligible to be assigned the given workshop as a filler workshop
     *
     * @param {Workshop} workshop A workshop that needs to be assigned as filler to some students
     */
    findEligible(workshop) {
        const eligibleStudents = [];
        for (const student of this.allStudents) {
            if (student.numberAssigned() < 2 && !student.isAssigned(workshop)) {
                eligibleStudents.push(student);
            }
        }
        return eligibleStudents;
    }

    /**
     * Chooses random students to fill a workshop that hasn't been filled and gives them their highest possible preferences as compensation
     *
     * @param workshop the workshop that needs to be filled to Quorum
     */
    fillOneWorkshop(workshop) {
        const eligibleStudents = this.findEligible(workshop);
        /*
         * This portion of the function iterates through preferences 1 through 6 and assigns random students who have that preference
         * open to the workshop until it reaches its quorum. If the preference for that student is full, then they are temporarily
         * removed from the list of "eligible" students until the next preference iteration.
         */
        for (let i = 0; i < this.numberOfPreferences; i++) {
            // for each preference, starting with the highest
            const currentStage = eligibleStudents.slice();
            while (currentStage.length > 0) {
                const randomIndex = Math.floor(
                    Math.random() * currentStage.length
                );
                const randomStudent = currentStage[randomIndex];
                const currentPreference = randomStudent.preferences[i];
                if (currentPreference === null) {
                    currentStage.splice(randomIndex, 1);
                    continue;
                }
                if (randomStudent.isAssigned(currentPreference)) {
                    randomStudent.assignWorkshop(workshop);
                } else if (!currentPreference.isFull()) {
                    randomStudent.assignWorkshop(workshop);
                    randomStudent.assignWorkshop(currentPreference);
                }
                currentStage.splice(randomIndex, 1);
                if (workshop.hasReachedQuorum()) {
                    return;
                }
            }
        }
        Logger.log("Unable to fill workshop " + workshop.name);
        Logger.log(
            "Slots filled: " + workshop.slotsFilled + "/" + workshop.minimumFill
        );
        Logger.log("Base Popularity: " + workshop.popularityScore);
        throw new Error("Was unable to fill workshop " + workshop.name); // will handle this differently if it happens, EXTREMELY unlikely
    }

    fillWithPreferred(workshop) {
        for (let i = 0; i < this.numberOfPreferences; i++) {
            // for each preference rank i
            for (const student of this.allStudents) {
                // for each student j
                if (student.isAssigned(workshop) || student.fullyAssigned()) {
                    continue;
                } else if (student.preferences[i] === workshop) {
                    student.assignWorkshop(workshop);
                    if (workshop.hasReachedQuorum()) {
                        return;
                    }
                }
            }
        }
    }

    /**
     * The main matching algorithm, fills every workshop to its minimum with the students who prefer that workshop the most
     */
    reachMinimumForAll() {
        /*
         * Iterates through the workshops from least to most popular, filling each one with students who have it listed as their first
         * preference, then those who have it listed as the second, etc. If the workshop is not filled by the time the end of all the
         * preferences is reached, then the fillOneWorkshop() function is called to fill the remaining slots of the workshop until it
         * reaches its minimum viable fill.
         */
        for (let i = 0; i < this.workshopsByPopularity.length; i++) {
            // for each workshop i
            const currentWorkshop = this.workshopsByPopularity[i];
            if (currentWorkshop.hasReachedQuorum()) {
                continue;
            }
            this.fillWithPreferred(currentWorkshop);

            if (!currentWorkshop.hasReachedQuorum()) {
                this.fillOneWorkshop(currentWorkshop);
            }
        }
    }

    /**
     * The final portion of the matching algorithm, gives the students their highest possible preferences who are not already assigned to max workshops
     */
    finalMatches() {
        for (const student of this.allStudents) {
            // for every student i
            if (!student.fullyAssigned()) {
                // if the student still has empty slots
                for (const preference of student.preferences) {
                    // for each student preference j
                    if (preference === null) {
                        continue;
                    } else if (
                        !student.isAssigned(preference) &&
                        !preference.isFull()
                    ) {
                        //if the student is not already assigned to the workshop AND the workshop has slots left
                        student.assignWorkshop(preference);
                        if (student.fullyAssigned()) {
                            break;
                        }
                    }
                }
            }
            if (!student.fullyAssigned()) {
                throw new Error(
                    "Could not give " +
                        student.fullName() +
                        " one of their remaining preferences."
                );
            }
        }
    }

    /**
     * Assigns every student to workshops according to their preferences.
     */
    matchGirls() {
        this.sortWorkshops();
        this.fixStudentPreferences();
        this.reachMinimumForAll();
        this.finalMatches();
    }

    /**
     * Give a score to the final matches based on how many students received their preferences.
     */
    scorer() {
        this.score = 0;
        for (const student of this.allStudents) {
            // For each student i
            this.score += student.calculateScore();
        }
    }

    /**
     * Logs the names of all students who received none of their preferred workshops.
     */
    checkMatches() {
        let numberOfFails = 0;
        for (const student of this.allStudents) {
            // For each student i
            const worstScore = this.unpreferredScore * this.sessionPerWorkshop;
            if (student.compareToScore(worstScore)) {
                numberOfFails += 1;
            }
        }
        if (numberOfFails > 0) {
            Logger.log(
                "There was a matching failure, " +
                    numberOfFails.toString() +
                    " students did not get any of their preferences"
            );
        } else {
            Logger.log("Every student got at least one preference");
        }
    }
}
