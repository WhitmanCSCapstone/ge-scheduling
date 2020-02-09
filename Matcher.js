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
        this.minimumWorkshopFill = 0.75;
    };

    /**
     * Adds a new Workshop into workshopsByNumber and workshopsByPopularity
     *
     * @param {string} name     The name of the workshop.
     * @param {int}    number   The number of the workshop.
     * @param {int}    capacity The capacity of each session of the workshop.
     */
    this.addNewWorkshop = function(name, number, capacity) {
        var thisWorkshop = new Workshop(
            name,
            number,
            capacity,
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
    this.addNewStudent = function(firstName, lastName, preferenceNums) {
        var preferenceArray = [];

        // HANDLE DUPLICATES HERE (?)

        for (var i = 0; i < preferenceNums.length; i++) {
            var preference = this.workshopsByNumber[preferenceNums[i]];

            preferenceArray.push(preference);
        }

        var thisStudent = new Student(
            firstName,
            lastName,
            preferenceArray,
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
     * Appends the least popular workshops to the preferences of all students who don't have a full list of preferences.
     */
    this.fixStudentPreferences = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            this.sortWorkshops();

            var thisStudent = this.allStudents[i];
            var workshopToAdd = 0;
            while (!thisStudent.hasAllPreferences()) {
                var addedWorkshop = this.workshopsByPopularity[workshopToAdd];
                thisStudent.appendPreference(addedWorkshop);
                workshopToAdd += 1;
                Logger.log(
                    "Added workshop '" +
                        addedWorkshop.name +
                        "' to " +
                        thisStudent.fullName() +
                        "'s preferences"
                );
            }
        }
        this.sortWorkshops();
    };

    /**
     * Fills the unpopularWorkshops array with workshops where the popularity score is below the minimum fill for that workshop.
     */
    this.findUnpopular = function() {
        for (var i = 0;  i < this.workshopsByPopularity.length; i++) {
            var tempWorkshop = this.workshopsByPopularity[i];
            if (tempWorkshop.popularityScore < tempWorkshop.minimumFill) {
                this.unpopularWorkshops.push(tempWorkshop);
            }
        }
    }

    /**
     * Assigns students who prefer the unpopular workshops to those workshops, starting with the least popular.
     */
    this.assignToUnpopular = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            tempStudent = this.allStudents[i];
            for (var j = 0; j < tempStudent.preferences.length; j++) {
                tempPreference = tempStudent.preferences[j];
                if (this.unpopularWorkshops.indexOf(tempPreference) !== -1 && !tempStudent.fullyAssigned()) {
                    tempStudent.assignWorkshop(tempPreference);
                }
            }
        }
    }

    /**
     * Divides all the students into ones who haven't been assigned any workshops and ones who have.
     */
    this.divideByAssignment = function() {
        this.assignedSomething = [];
        this.assignedNothing = [];
        for (var i = 0; i < this.allStudents.length; i++) {
            if (this.allStudents[i].numberAssigned() === 0) {
                this.assignedNothing.push(this.allStudents[i]);
                Logger.log("a student went to assignedNothing");
            }
            else {
                this.assignedSomething.push(this.allStudents[i]);
            }
        }
    }

    /**
     * Randomly chooses students to fill the least popular workshops, and also gives them their first choice.
     */
    this.fillUnpopular = function() {
        this.divideByAssignment();
        this.firstIsFull = []; // Students whose first choice workshop is full
        this.givenFiller = []; // Students given a filler slot and their first choice workshop
        while (this.unpopularWorkshops.length) {
            if (this.unpopularWorkshops[0].hasReachedQuorum()) { // If the workshop has reached its minimum, remove it from the array and iterate again.
                this.unpopularWorkshops.shift();
                Logger.log("An unpopular workshop was filled!");
                continue;
            }
            
            if (!this.assignedNothing.length) { // If there are no more students with no assignments, stop the loop
                Logger.log("There are no viable remaining students with zero assignments");
                break;
            }

            var mostUnpopular = this.unpopularWorkshops[0];
//            Logger.log(mostUnpopular.name);
            var randomStudent = this.assignedNothing[Math.floor(Math.random() * this.assignedNothing.length)];
//            Logger.log(randomStudent.fullName());
            if (randomStudent.preferences[0].isFull()) { // The student's first choice is full already
                this.firstIsFull.push(randomStudent);
            }
            else { // Give the student the filler workshop and their first choice workshop
                randomStudent.assignWorkshop(mostUnpopular);
                randomStudent.assignWorkshop(randomStudent.preferences[0]);
                this.givenFiller.push(randomStudent);
            }
            this.assignedNothing.splice(this.assignedNothing.indexOf(randomStudent), 1);   
        }
    }

    /**
     * Wrapper function to fully handle the most unpopular workshops.
     */
    this.handleUnpopular = function() {
        this.findUnpopular();
        this.assignToUnpopular();
        this.fillUnpopular();
    }

    /**
     * Assigns every student to workshops according to their preferences.
     */
    this.matchGirls = function() {
        this.fixStudentPreferences();
        this.handleUnpopular();
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
