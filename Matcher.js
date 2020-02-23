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

        // An array containing all workshop objects sorted from least to most popular
        this.workshopsByPopularity = [];

        // A number representing the quality of the final matches. The lower the score the better
        this.score = 0;
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
            this.sessionsPerWorkshop
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

        // HANDLE DUPLICATES HERE (?)

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
     * Appends the least popular workshops to the preferences of all students who don't have a full list of preferences.
     */
    fixStudentPreferences() {
        for (const student of this.allStudents) {
            this.sortWorkshops();

            let workshopToAdd = 0;
            while (!student.hasAllPreferences()) {
                const addedWorkshop = this.workshopsByPopularity[workshopToAdd];
                student.appendPreference(addedWorkshop);
                workshopToAdd += 1;
                Logger.log(
                    "Added workshop '" +
                        addedWorkshop.name +
                        "' to " +
                        student.fullName() +
                        "'s preferences"
                );
            }
        }
        this.sortWorkshops();
    }

    /**
     * Assigns every student to workshops according to their preferences.
     */
    matchGirls() {
        for (const student of this.allStudents) {
            for (let j = 0; j < this.sessionsPerWorkshop; j++) {
                student.assignWorkshopSession(student.preferences[j], j);
            }
        }
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
