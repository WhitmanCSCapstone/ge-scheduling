function Matcher() {
    this.init = function() {

        // Minimum percentage that each workshop session needs to be filled
        this.minimumWorkshopFill = 0.75;

        // The number of sessions that an individual workshop has
        this.sessionPerWorkshop = 3;

        // Points given for workshop assignments from most preferred to least preferred
        this.scorerPoints = [1, 3, 5, 10, 11, 12];
        
        // Points to be added for each workshop a student didn't want
        this.unpreferredScore = 20;

        // Points given for calculating workshop popularity based on what number preference the workshop is listed
        this.popularityPoints = [1, 1, 1, 1, 1, 1];

        // An object containing all the workshops that can be indexed by workshop number
        this.workshopsByNumber = {};

        // An array containing Student objects representing every student
        this.allStudents = [];

        // An array containing all workshop objects sorted from least to most popular
        this.workshopsByPopularity = [];

        // A number representing the quality of the final matches. The lower the score the better
        this.score = 0;
    };

    /**
     * Adds a new Workshop into workshopsByNumber and workshopsByPopularity
     * 
     * @param {string} name     The name of the workshop.
     * @param {int}    number   The number of the workshop.
     * @param {int}    capacity The capacity of each session of the workshop.
     */
    this.addNewWorkshop = function(name, number, capacity) {
        var thisWorkshop = new Workshop(name, number, capacity, this.sessionPerWorkshop, this.minimumWorkshopFill);

        this.workshopsByNumber[number] = thisWorkshop;
        this.workshopsByPopularity.push(thisWorkshop);
    };

    /**
     * Returns the object full of workshops that can be indexed by workshop number
     */
    this.getAllWorkshops = function() {
        return this.workshopsByNumber;
    }

    /**
     * Adds a new Student object into allStudents
     * 
     * @param {string} firstName      The first name of the student.
     * @param {string} lastName       The last name of the student.
     * @param {array}  preferenceNums The student's preferences as an array of integers.
     */
    this.addNewStudent = function(firstName, lastName, preferenceNums) {
        var preferenceArray = [];

        for (var i = 0; i < preferenceNums.length; i++){
            preferenceArray.push(this.workshopsByNumber[preferenceNums[i]])
        }

        var thisStudent = new Student(firstName, lastName, preferenceArray, this.sessionPerWorkshop);

        this.allStudents.push(thisStudent);
        thisStudent.updatePopularities(this.popularityPoints)
    };

    /**
     * Helper function for sorting that compares two workshops by their popularity
     * 
     * @param {Workshop} workshopA 
     * @param {Workshop} workshopB 
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
     * Sorts the workshopsByPopularity array from least to most popular
     */
    this.sortWorkshops = function() {
        this.workshopsByPopularity.sort(this.morePopular);
    };

    /**
     * Appends the least popular workshops to the preferences of all students who don't have a full list of preferences
     */
    this.fixStudentPreferences = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            this.sortWorkshops();

            var thisStudent = this.allStudents[i];
            var workshopToAdd = 0;
            while (!thisStudent.hasAllPreferences(this.popularityPoints.length)) {
                var pointsIndex = thisStudent.appendPreference(this.workshopsByPopularity[workshopToAdd]);
                this.workshopsByPopularity[workshopToAdd].incrementPopularity(this.popularityPoints[pointsIndex])
                workshopToAdd += 1;
                Logger.log("added workshop. " + thisStudent.fullName());
            }
        }
        this.sortWorkshops();
    };

    /**
     * Assigns every student to workshops according to their preferences
     */
    this.matchGirls = function() {
        for (var i = 0; i < this.allStudents.length; i++) {
            thisStudent = this.allStudents[i];
            for (var j = 0; j < this.sessionPerWorkshop; j++) {
                thisStudent.assignWorkshop(thisStudent.preferences[j], j);
            }
        }
    };

    /**
     * Give a score to the final matches based on how many students received their preferences
     */
    this.scorer = function() {
        this.score = 0;
        for (var i = 0; i < this.allStudents.length; i++) {
            // For each student i
            var thisStudent = this.allStudents[i];
            this.score += thisStudent.calculateScore(this.scorerPoints, this.unpreferredScore)
        }
        Logger.log(this.score);
    };

    /**
     * Logs the names of all students who received none of their preferred workshops
     */
    this.checkMatches = function() {
        var numberOfFails = 0;
        for (var i = 0; i < this.allStudents.length; i++) {
            // For each student i
            var thisStudent = this.allStudents[i];
            var worstScore = this.unpreferredScore * this.sessionPerWorkshop;
            if (thisStudent.compareToScore(worstScore)) {
                Logger.log(thisStudent.fullName())
                numberOfFails += 1;
            }
        }
        if (numberOfFails > 0) {
            Logger.log("There was a matching failure, " + numberOfFails.toString() + " students did not get any of their preferences");
        }

        else {
            Logger.log("Every student got at least one preference");
        }
    };

    this.init();
}