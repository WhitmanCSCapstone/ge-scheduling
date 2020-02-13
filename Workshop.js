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
function Workshop(name, number, capacity, location, sessionsPerWorkshop, minimumFill) {
    this.init = function() {
        this.name = name;
        this.number = number;
        this.location = location;

        this.sessions = [];
        
        this.studentsAssigned = [];
        
        this.totalBaseCapacity = 0;
        for (var i = 0; i < sessionsPerWorkshop; i++) {
            this.sessions.push(new Session(capacity, minimumFill));
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
        return (this.slotsFilled === this.totalBaseCapacity);
    }
    
    this.addStudent = function(student) {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full workshop");
        }
        else {
            this.slotsFilled += 1;
            this.studentsAssigned.push(student);
        }
    }

    this.hasReachedQuorum = function() {
        return (this.slotsFilled >= this.minimumFill);
    }

    this.init();
}
