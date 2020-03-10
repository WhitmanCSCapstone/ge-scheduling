/*globals Session */

/**
 * Workshop Class.
 *
 * An object that contains all significant information about a single workshop.
 *
 * @param {string} name                The name of the workshop.
 * @param {int}    number              The number of the workshop as it appears in the workshop sheet.
 * @param {int}    capacity            The capacity of a single session of the workshop.
 * @param {int}    sessionsPerWorkshop The number of sessions in a workshop.
 */
function Workshop(
    name,
    number,
    capacity,
    location,
    sessionsPerWorkshop,
    minimumFill
) {
    this.init = function() {
        this.name = name;
        this.number = number;
        this.location = location;

        this.sessions = [];

        this.studentsAssigned = []; //maybe rename this something more meaningful, like attendance sheet or something

        this.totalBaseCapacity = 0;
        for (var i = 0; i < sessionsPerWorkshop; i++) {
            this.sessions.push(new Session(capacity, minimumFill, i));
            this.totalBaseCapacity += capacity;
        }

        this.slotsFilled = 0;

        this.minimumFill = Math.floor(this.totalBaseCapacity * minimumFill);

        this.popularityScore = 0;
    };

    /**
     * Increments the popularity of the workshop based on the students' preferences.
     *
     * @param {int} points The value with which the popularity of this workshop is incremented.
     */
    this.incrementPopularity = function(points) {
        this.popularityScore += points;
    };

    this.isFull = function() {
        return this.slotsFilled === this.totalBaseCapacity;
    };

    this.hasSessionOpen = function(timeSlot) {
        return !this.sessions[timeSlot].isFull();
    };

    this.moreFull = function(sessionA, sessionB) {
        if (sessionA.slotsFilled < sessionB.slotsFilled) {
            return -1;
        } else if (sessionA.slotsFilled > sessionB.slotsFilled) {
            return 1;
        } else {
            return 0;
        }
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

    this.leastFullSessions = function() {
        var temp = this.sessions.slice();
        var sessionsByFill = this.shuffle(temp);
        sessionsByFill.sort(this.moreFull);
        return sessionsByFill;
    };

    this.addStudent = function(student) {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full workshop");
        } else {
            this.slotsFilled += 1;
            this.studentsAssigned.push(student);
        }
    };

    this.hasReachedQuorum = function() {
        return this.slotsFilled >= this.minimumFill;
    };

    this.init();
}
