const Student = require("./models/student");

// find the perfect match for a student
// -> Male will match with female and vice-versa, 'Other' will match with 'other'
// -> First priority is given to common interests + common hobbies
// -> Second priority is given to smaller age gap
// -> The perfect match should have atleast 1 common interest/hobby and age gap <= 1 year.
// -> If no perfect match is found, return null

module.exports.find_perfect_match = async looking_student => {
    // check whether two students are of compatible genders
    const compatible = (gender_1, gender_2) => {
        if(gender_1 === gender_2) {
            return gender_1 === "Other";
        }
        return gender_1 !== "Other" && gender_2 !== "Other";
    }

    // count the common interests/hobbies
    const count_common = (list_1, list_2) => list_1.filter(value => list_2.includes(value)).length;

    // check whether the match is valid
    const is_valid_match = stats => stats[0] >= 1 && stats[1] <= 1;

    // check whether the first student is a better match than the second student
    const is_better_match = (stats_1, stats_2) => {
        if(stats_1[0] > stats_2[0]) {
            return true;
        }
        if(stats_1[0] === stats_2[0] && stats_1[1] < stats_2[1]) {
            return true;
        }
        return false;
    }
    
    let matching_student = null;
    // match_stats stores (common interests/hobbies, age difference)
    let match_stats = [0, Infinity];
    const all_students = await Student.find({});
    for(const student of all_students) {
        if(looking_student["IITB Roll Number"] === student["IITB Roll Number"] || !compatible(looking_student["Gender"], student["Gender"])) {
            continue;
        }
        const commonalities = count_common(looking_student["Interests"], student["Interests"]) + count_common(looking_student["Hobbies"], student["Hobbies"]);
        const age_difference = Math.abs(looking_student["Age"] - student["Age"]);
        const current_stats = [commonalities, age_difference];
        if(is_better_match(current_stats, match_stats) && is_valid_match(current_stats)) {
            matching_student = student;
            match_stats = current_stats;
        }
    }

    if(matching_student === null) {
        return null;
    }
    return matching_student["_id"];
}