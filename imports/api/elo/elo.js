const OUTCOMES = {
    lost: 0,
    tied: 0.5,
    won: 1
}

/**
 * This is some magical constant used by the ELO system
 *
 * @link http://en.wikipedia.org/wiki/Elo_rating_system#Performance_rating
 */
const PERF = 400

/**
 * Instantiates a new ELO instance
 *
 * @param {Number|Object} k_factor The maximum rating change, defaults to 32
 * @param {Number} min The minimum value a calculated rating can be
 * @param {Number} max Integer The maximum value a calculated rating can be
 */
export const ELO = function(k_factor, min, max) {
    this.setKFactor(k_factor)

    this.minimum = typeof min !== 'undefined' ? min : -Infinity
    this.maximum = typeof max !== 'undefined' ? max : Infinity
}

/**
 * Returns the K-factor depending on the provided rating
 *
 * @arg {Number} rating A players rating, e.g. 1200
 * @return {Number} The determined K-factor, e.g. 32
 */
ELO.prototype.getKFactor = function(rating) {
    let k_factor = null

    if (!isNaN(this.k_factor)) {
        return this.k_factor
    }

    if (!rating) {
        rating = 0
    }

    if (this.k_factor.default) {
        k_factor = this.k_factor.default
    }

    Object.keys(this.k_factor).forEach((minimum_rating) => {
        let current_k_factor = this.k_factor[minimum_rating]

        if (minimum_rating <= rating) {
            k_factor = current_k_factor
        }
    })

    return k_factor
}

/**
 * Returns the minimum acceptable rating value
 *
 * @return {Number} The minimum rating value, e.g. 100
 */
ELO.prototype.getMin = function() {
    return this.minimum
}

/**
 * Returns the maximum acceptable rating value
 *
 * @return {Number} The maximum rating value, e.g. 2700
 */
ELO.prototype.getMax = function() {
    return this.maximum
}

/**
 * When setting the K-factor, you can do one of three things.
 * Provide a falsey value, and we'll default to using 32 for everything.
 * Provide a number, and we'll use that for everything.
 * Provide an object where each key is a numerical lower value.
 *
 * @arg {Number|Object} k_factor The K-factor to use
 * @return {Object} The current object for chaining purposes
 */
ELO.prototype.setKFactor = function(k_factor) {
    this.k_factor = k_factor

    if (!k_factor) {
        this.k_factor = 32
    }

    return this
}

/**
 * Sets the minimum acceptable rating
 *
 * @arg {Number} minimum The minimum acceptable rating, e.g. 100
 * @return {Object} The current object for chaining purposes
 */
ELO.prototype.setMin = function(minimum) {
    this.minimum = minimum

    return this
}

/**
 * Sets the maximum acceptable rating
 *
 * @arg {Number} maximum The maximum acceptable rating, e.g. 2700
 * @return {Object} The current object for chaining purposes
 */
ELO.prototype.setMax = function(maximum) {
    this.maximum = maximum

    return this
}

/**
 * Determines the expected "score" of a "match" (when a user compares two currencies)
 *
 * @param {Number} rating The elo rating of the currency whose expected score we're looking for, e.g. 1200
 * @param {Number} opponent_rating the rating of the challening currency, e.g. 1200
 * @return {Number} The score we expect the currency to recieve, e.g. 0.5
 *
 * @link http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
 */
ELO.prototype.expectedScore = function(rating, opponent_rating) {
    let difference = opponent_rating - rating

    return 1 / (1 + Math.pow(10, difference / PERF))
}

/**
 * Returns an array of anticipated scores for both currencies
 *
 * @param {Number} player_1_rating The rating of currency 1, e.g. 1200
 * @param {Number} player_2_rating The rating of currency 2, e.g. 1200
 * @return {Array} The anticipated scores, e.g. [0.25, 0.75]
 */
ELO.prototype.bothExpectedScores = function(player_1_rating, player_2_rating) {
    return [
        this.expectedScore(player_1_rating, player_2_rating),
        this.expectedScore(player_2_rating, player_1_rating)
    ]
}

/**
 * The calculated new rating based on the expected outcone, actual outcome, and previous score
 *
 * @param {Number} expected_score The expected score, e.g. 0.25
 * @param {Number} actual_score The actual score, e.g. 1
 * @param {Number} previous_rating The previous rating of the player, e.g. 1200
 * @return {Number} The new rating of the player, e.g. 1256
 */
ELO.prototype.newRating = function(expected_score, actual_score, previous_rating) {
    let difference = actual_score - expected_score
    let rating = Math.round(previous_rating + this.getKFactor(previous_rating) * difference)

    if (rating < this.minimum) {
        rating = this.minimum
    } else if (rating > this.maximum) {
        rating = this.maximum
    }

    return rating
}

/**
 * Calculates a new rating from an existing rating and opponents rating if the currency won
 *
 * This is a convenience method which skips the score concept
 *
 * @param {Number} rating The existing rating of the currency, e.g. 1200
 * @param {Number} opponent_rating The rating of the opponent currency, e.g. 1300
 * @return {Number} The new rating of the currency, e.g. 1300
 */
ELO.prototype.newRatingIfWon = function(rating, opponent_rating) {
    let odds = this.expectedScore(rating, opponent_rating)

    return this.newRating(odds, OUTCOMES.won, rating)
}

/**
 * Calculates a new rating from an existing rating and opponents rating if the currency lost
 *
 * This is a convenience method which skips the score concept
 *
 * @param {Number} rating The existing rating of the currency, e.g. 1200
 * @param {Number} opponent_rating The rating of the opponent, e.g. 1300
 * @return {Number} The new rating of the currency, e.g. 1180
 */
ELO.prototype.newRatingIfLost = function(rating, opponent_rating) {
    let odds = this.expectedScore(rating, opponent_rating)

    return this.newRating(odds, OUTCOMES.lost, rating)
}

/**
 * Calculates a new rating from an existing rating and opponents rating if the currency tied
 *
 * This is a convenience method which skips the score concept
 *
 * @param {Number} rating The existing rating of the currency, e.g. 1200
 * @param {Number} opponent_rating The rating of the opponent, e.g. 1300
 * @return {Number} The new rating of the currency, e.g. 1190
 */
ELO.prototype.newRatingIfTied = function(rating, opponent_rating) {
    let odds = this.expectedScore(rating, opponent_rating)

    return this.newRating(odds, OUTCOMES.tied, rating)
}
