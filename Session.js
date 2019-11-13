/**
 * Workshop Session Class.
 *
 * An object that contains all significant information about a single session in a workshop.
 * This is meant to condense the workshop class's methods to avoid redundancy.
 *
 * @param {int} capacity The number of students who can be assigned to this workshop session.
 */
function Session(capacity) {
    this.init = function() {
        this.originalCapacity = capacity;
        this.remainingCapacity = this.originalCapacity;
    };

    /**
     * Calculates and returns whether or not the session is completely full.
     */
    this.isFull = function() {
        return this.remainingCapacity === 0;
    };

    /**
     * Calculates and returns whether or not the session is "full enough" based on the MINIMUM_WORKSHOP_FILL variable.
     */
    this.hasReachedQuorum = function() {
        return (
            this.remainingCapacity <=
            this.originalCapacity * (1 - MINIMUM_WORKSHOP_FILL)
        );
    };

    /**
     * Subtracts 1 from the session's remaining capacity.
     */
    this.addStudent = function() {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full session");
        } else {
            this.remainingCapacity -= 1;
        }
    };

    /**
     * Adds 1 to the session's remaining capacity.
     */
    this.subtractStudent = function() {
        if (this.remainingCapacity === this.originalCapacity) {
            throw new Error("Cannot remove students from an empty session");
        } else {
            this.remainingCapacity += 1;
        }
    };

    /**
     * Manually sets a the session's original and remaining capacities to a discrete value.
     *
     * @param {int} value the new integer value for the session's remaining capacity.
     */
    this.setCapacity = function(value) {
        this.originalCapacity = value;
        this.remainingCapacity = value;
    };

    this.init();
};
