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
    constructor(
        name,
        number,
        capacity,
        location,
        sessionsPerWorkshop,
        minimumFill
    ) {
        this.name = name;
        this.number = number;
        this.location = location;

        this.sessions = [];

        this.studentsAssigned = []; //maybe rename this something more meaningful, like attendance sheet or something

        this.totalBaseCapacity = 0;
        for (let i = 0; i < sessionsPerWorkshop; i++) {
            this.sessions.push(new Session(capacity, minimumFill, i));
            this.totalBaseCapacity += capacity;
        }

        this.slotsFilled = 0;

        this.minimumFill = Math.floor(this.totalBaseCapacity * minimumFill);

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

    isFull() {
        return this.slotsFilled === this.totalBaseCapacity;
    }

    hasSessionOpen(timeSlot) {
        return !this.sessions[timeSlot].isFull();
    }

    moreFull(sessionA, sessionB) {
        if (sessionA.slotsFilled < sessionB.slotsFilled) {
            return -1;
        } else if (sessionA.slotsFilled > sessionB.slotsFilled) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Hard copies an array and shuffles its contents randomly
     *
     * @param {array} array The array that will be hard copied and shuffled
     */
    shuffle(array) {
        const tempArray = array.slice();
        const returnArray = [];
        while (tempArray.length) {
            const randomIndex = Math.floor(Math.random() * tempArray.length);
            returnArray.push(tempArray[randomIndex]);
            tempArray.splice(randomIndex, 1);
        }
        return returnArray;
    }

    leastFullSessions() {
        const temp = this.sessions.slice();
        const sessionsByFill = this.shuffle(temp);
        sessionsByFill.sort(this.moreFull);
        return sessionsByFill;
    }

    addStudent(student) {
        if (this.isFull()) {
            throw new Error("Cannot add students to a full workshop");
        } else {
            this.slotsFilled += 1;
            this.studentsAssigned.push(student);
        }
    }

    hasReachedQuorum() {
        return this.slotsFilled >= this.minimumFill;
    }

    toString() {
        return "(" + this.number.toString() + ") " + this.name;
    }
}
