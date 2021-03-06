/**
 * Workshop Session Class.
 *
 * An object that contains all significant information about a single session in a workshop.
 * This is meant to condense the workshop class's methods to avoid redundancy.
 *
 * @param {int} capacity The number of students who can be assigned to this workshop session.
 */
function Session(capacity, minimumFill, timeSlot) {
    this.init = function() {
        this.timeSlot = timeSlot;

        this.slotsFilled = 0;

        this.capacity = capacity;

        this.studentsAssigned = [];

        // Minimum number of slots that need to be filled in this workshop
        this.minimumFill = capacity * minimumFill;
    };

    /**
     * Calculates and returns whether or not the session is completely full.
     */
    this.isFull = function() {
        return this.slotsFilled === this.capacity;
    };

    /**
     * Calculates and returns whether or not the session is "full enough" based on this.minimumWorkshopFill.
     */
    this.hasReachedQuorum = function() {
        return this.slotsFilled >= this.minimumFill;
    };

    /**
     * Adds 1 to the number of slots filled in the session.
     */
    this.addStudent = function(student) {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full session");
        } else {
            this.slotsFilled += 1;
            this.studentsAssigned.push(student);
        }
    };

    this.init();
}
