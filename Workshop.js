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
function Workshop(name, number, capacity, sessionsPerWorkshop) {
    this.init = function() {
        this.name = name;
        this.number = number;

        this.sessions = [];
        for (var i = 0; i < sessionsPerWorkshop; i++) {
            this.sessions.push(new Session(capacity));
        }

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

    /**
     * Calculates the total remaining capacity of the workshop.
     */
    this.totalRemainingCapacity = function() {
        var total = 0;
        for (var i = 0; i < this.sessions.length; i++) {
            total += this.sessions[i].remainingCapacity;
        }
        return total;
    };

    this.toString = function() {
        return "(" + this.number.toString() + ") " + this.name;
    };

    this.init();
}
