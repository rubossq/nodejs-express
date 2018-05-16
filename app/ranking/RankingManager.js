const INTERVALS_COUNT = 6;

const RankingCountries = require("./RankingCountries");

const GRADATIONS = [
    {value: 1, max_rank: 5},
    {value: 2, max_rank: 10},
    {value: 3, max_rank: 15},
    {value: 4, max_rank: 25},
    {value: 6, max_rank: 50},
    {value: 9, max_rank: 100},
    {value: 14, max_rank: 150},
    {value: 20, max_rank: 200},
    {value: 50, max_rank: 1000}
];

class RankingManager {
    static get INTERVALS_COUNT() {
        return INTERVALS_COUNT;
    }

    static getCurrentInterval(offsetBack) {
        let date = new Date();

        if (offsetBack) {
            date = new Date(date.getTime() - offsetBack * 1000);
        }

        let hours = parseInt(date.getHours());

        let intervalNum = 0;
        let step = parseInt(24 / INTERVALS_COUNT);

        for (let i = 0; i < INTERVALS_COUNT; i++) {

            if ((i * step) <= hours && hours < (i * step + step)) {
                intervalNum = i;
                break;
            }
        }

        date.setHours(0, 0, 0);
        date.setMilliseconds(0);

        let today = parseInt(date.getTime() / 1000);
        let secondsStep = step * 3600;
        let start = (today + intervalNum * secondsStep);
        let end = start + secondsStep;

        return {start: start - secondsStep, end: end};
    }

    static countIntervalHype(group) {
        let apps = new Map();

        for (let i = 0; i < group.length; i++) {
            let app_id = group[i]._id.app_id;
            let country_id = group[i]._id.country_id;
            let rank = group[i].rank;
            let hype = parseInt(RankingManager.getCountryHype(country_id, rank));

            if (!apps.has(app_id)) {
                apps.set(app_id, hype);
            } else {
                apps.set(app_id, apps.get(app_id) + hype);
            }
        }

        return apps;
    }

    static countCountryRankings(group) {
        let apps = new Map();

        for (let i = 0; i < group.length; i++) {
            let app_id = group[i]._id;
            let rank = group[i].rank;

            apps.set(app_id, rank);
        }

        return apps;
    }

    static getCountryHype(country_id, rank) {
        let index = RankingCountries.COUNTRIES.indexOf(country_id);

        if (~index) {
            let GDP = RankingCountries.GDPS[index];
            let POPULATION = RankingCountries.GDPS[index];
            let value = RankingManager.getGradationValue(rank);

            return (GDP * POPULATION) / value;
        }

        return 0;
    }

    static getGradationValue(rank) {
        for (let i = 0; i < GRADATIONS.length; i++) {
            if (rank <= GRADATIONS[i].max_rank) {
                return GRADATIONS[i].value;
            }
        }

        return 100;
    }
}

module.exports = RankingManager;