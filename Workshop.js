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
class Workshop {
    constructor(name, number, capacity, location, sessionsPerWorkshop) {
        this.name = name;
        this.number = number;
        this.location = location;

        this.sessions = [];
        for (let i = 0; i < sessionsPerWorkshop; i++) {
            this.sessions.push(new Session(capacity));
        }

        this.popularityScore = 0;
    }

    /**
     * Increments the popularity of the workshop based on the students' preferences.
     *
     * @param {int} points The value with which the popularity of this workshop is incremented.
     */
    incrementPopularity(points) {
        this.popularityScore += points;
    }

    /**
     * Calculates the total remaining capacity of the workshop.
     */
    totalRemainingCapacity() {
        let total = 0;
        for (const session of this.sessions) {
            total += session.remainingCapacity;
        }
        return total;
    }

    toString() {
        return "(" + this.number.toString() + ") " + this.name;
    }
}
