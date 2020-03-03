/*globals Logger, Workshop, Student */

/**
 * Matcher Class.
 *
 * An object used to simulate a complete set of students and workshops, used to create the matches for each student with workshops.
 */
function Matcher() {
    this.init = function() {
        // The number of sessions that an individual workshop has
        this.sessionsPerWorkshop = 3; // maybe could be moved to a subclass

        // An object containing all the workshops that can be indexed by workshop number
        this.workshopsByNumber = {};

        // An array containing Student objects representing every student
        this.allStudents = [];

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
    };

    /**
     * Adds a new Workshop into workshopsByNumber and workshopsByPopularity
     *
     * @param {string} name     The name of the workshop.
     * @param {int}    number   The number of the workshop.
     * @param {int}    capacity The capacity of each session of the workshop.
     */
    this.addNewWorkshop = function(name, number, capacity, location) {
        var thisWorkshop = new Workshop(
            name,
            number,
            capacity,
            location,
            this.sessionsPerWorkshop,
            this.minimumWorkshopFill
        );

        this.workshopsByNumber[number] = thisWorkshop;
        this.workshopsByPopularity.push(thisWorkshop);
    };

    /**
     * Adds a new Student object into allStudents
     *
     * @param {string} firstName      The first name of the student.
     * @param {string} lastName       The last name of the student.
     * @param {array}  preferenceNums The student's preferences as an array of integers.
     */
    this.addNewStudent = function(firstName, lastName, preferenceNums, grade) {
        var preferenceArray = [];

        for (var i = 0; i < preferenceNums.length; i++) {
            var preference = this.workshopsByNumber[preferenceNums[i]];

            preferenceArray.push(preference);
        }

        var thisStudent = new Student(
            firstName,
            lastName,
            preferenceArray,
            grade,
            this.sessionsPerWorkshop
        );

        this.allStudents.push(thisStudent);
        thisStudent.updatePopularities();
    };

    /**
     * Helper function for sorting that compares two workshops by their popularity.
     *
     * @param {Workshop} workshopA A workshop to have its popularity compared to workshopB.
     * @param {Workshop} workshopB A workshop to have its popularity compared to workshopA.
     */
    this.morePopular = function(workshopA, workshopB) {
        if (workshopA.popularityScore < workshopB.popularityScore) {
            return -1;
        } else if (workshopA.popularityScore > workshopB.popularityScore) {
            return 1;
        } else {
            return 0;
        }
    };

    /**
     * Sorts the workshopsByPopularity array from least to most popular.
     */
    this.sortWorkshops = function() {
        this.workshopsByPopularity.sort(this.morePopular);
    };

    /**
     * Appends "null" to a student's preference list if they have fewer than the correct number of preferences
     */
    this.fixStudentPreferences = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            var thisStudent = this.allStudents[i];
            while (!thisStudent.hasAllPreferences()) {
                thisStudent.preferences.push(null);
            }
        }
    };

    /**
     * Calculates the absolute maximum percentage that every workshop can be filled to. this.minimumWorkshopFill can NOT be above this number.
     */
    this.calculateMinPercent = function() {
        var totalSlots = 0;
        for (var i = 0; i < this.workshopsByPopularity.length; i++) {
            totalSlots += this.workshopsByPopularity[i].totalBaseCapacity;
        }
        var minPercent =
            (this.allStudents.length * this.sessionsPerWorkshop) / totalSlots;
        Logger.log("minimum possible average fill: " + minPercent);
    };

    /**
     * Hard copies an array and shuffles its contents randomly
     * 
     * @param {array} array The array that will be hard copied and shuffled
     */
    this.shuffle = function(array) {
        var tempArray = array.slice();
        var returnArray = [];
        while (tempArray.length) {
            var randomIndex = Math.floor(Math.random() * tempArray.length);
            returnArray.push(tempArray[randomIndex]);
            tempArray.splice(randomIndex, 1);
        }
        return returnArray;
    }

    /**
     * Returns an array of students who are eligible to be assigned the given workshop as a filler workshop
     *
     * @param {Workshop} workshop A workshop that needs to be assigned as filler to some students
     */
    this.findEligible = function(workshop) {
        var eligibleStudents = [];
        for (var i = 0; i < this.allStudents.length; i++) {
            var tempStudent = this.allStudents[i];
            if (
                tempStudent.numberAssigned() < 2 &&
                !tempStudent.isAssigned(workshop)
            ) {
                eligibleStudents.push(tempStudent);
            }
        }
        return eligibleStudents;
    };

    /**
     * Chooses random students to fill a workshop that hasn't been filled and gives them their highest possible preferences as compensation
     *
     * @param workshop the workshop that needs to be filled to Quorum
     */
    this.fillOneWorkshop = function(workshop) {
        var eligibleStudents = this.findEligible(workshop);
        /*
         * This portion of the function iterates through preferences 1 through 6 and assigns random students who have that preference
         * open to the workshop until it reaches its quorum. If the preference for that student is full, then they are temporarily
         * removed from the list of "eligible" students until the next preference iteration.
         */
        for (var i = 0; i < this.numberOfPreferences; i++) {
            // for each preference, starting with the highest
            var currentStage = eligibleStudents.slice();
            while (currentStage.length > 0) {
                var randomIndex = Math.floor(
                    Math.random() * currentStage.length
                );
                var randomStudent = currentStage[randomIndex];
                var currentPreference = randomStudent.preferences[i];
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
    };

    this.fillWithPreferred = function(workshop) {
        for (var i = 0; i < this.numberOfPreferences; i++) {
            // for each preference rank i
            for (var j = 0; j < this.allStudents.length; j++) {
                // for each student j
                var currentStudent = this.allStudents[j];
                if (
                    currentStudent.isAssigned(workshop) ||
                    currentStudent.fullyAssigned()
                ) {
                    continue;
                } else if (currentStudent.preferences[i] === workshop) {
                    currentStudent.assignWorkshop(workshop);
                    if (workshop.hasReachedQuorum()) {
                        return;
                    }
                }
            }
        }
    };

    /**
     * The main matching algorithm, fills every workshop to its minimum with the students who prefer that workshop the most
     */
    this.reachMinimumForAll = function() {
        /*
         * Iterates through the workshops from least to most popular, filling each one with students who have it listed as their first
         * preference, then those who have it listed as the second, etc. If the workshop is not filled by the time the end of all the
         * preferences is reached, then the fillOneWorkshop() function is called to fill the remaining slots of the workshop until it
         * reaches its minimum viable fill.
         */
        for (var i = 0; i < this.workshopsByPopularity.length; i++) {
            // for each workshop i
            var currentWorkshop = this.workshopsByPopularity[i];
            if (currentWorkshop.hasReachedQuorum()) {
                continue;
            }
            this.fillWithPreferred(currentWorkshop);

            if (!currentWorkshop.hasReachedQuorum()) {
                this.fillOneWorkshop(currentWorkshop);
            }
        }
    };

    /**
     * The final portion of the matching algorithm, gives the students their highest possible preferences who are not already assigned to max workshops
     */
    this.finalMatches = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            // for every student i
            var currentStudent = this.allStudents[i];
            if (!currentStudent.fullyAssigned()) {
                // if the student still has empty slots
                for (var j = 0; j < currentStudent.preferences.length; j++) {
                    // for each student preference j
                    var currentPreference = currentStudent.preferences[j];
                    if (currentPreference === null) {
                        continue;
                    } else if (
                        !currentStudent.isAssigned(currentPreference) &&
                        !currentPreference.isFull()
                    ) {
                        //if the student is not already assigned to the workshop AND the workshop has slots left
                        currentStudent.assignWorkshop(currentPreference);
                        if (currentStudent.fullyAssigned()) {
                            break;
                        }
                    }
                }
            }
            if (!currentStudent.fullyAssigned()) {
                throw new Error(
                    "Could not give " +
                        currentStudent.toString() +
                        " one of their remaining preferences."
                );
            }
        }
    };

    /**
     * Assigns every student to workshops according to their preferences.
     */
    this.matchGirls = function() {
        this.sortWorkshops();
        this.fixStudentPreferences();
        this.reachMinimumForAll();
        this.finalMatches();
    };

    /**
     * "schedules" the students randomly into workshop sessions
     */
    this.schedule = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            var currentStudent = this.allStudents[i];
            var assignments = currentStudent.assignedWorkshops;
            currentStudent.assignedWorkshops = this.shuffle(assignments);
        }
    }

    /**
     * Give a score to the final matches based on how many students received their preferences.
     */
    this.scorer = function() {
        this.score = 0;
        for (var i = 0; i < this.allStudents.length; i++) {
            // For each student i
            var thisStudent = this.allStudents[i];
            this.score += thisStudent.calculateScore();
        }
    };

    /**
     * Logs the names of all students who received none of their preferred workshops.
     */
    this.checkMatches = function() {
        var numberOfFails = 0;
        for (var i = 0; i < this.allStudents.length; i++) {
            // For each student i
            var thisStudent = this.allStudents[i];
            var worstScore = this.unpreferredScore * this.sessionPerWorkshop;
            if (thisStudent.compareToScore(worstScore)) {
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
    };

    this.init();
}
