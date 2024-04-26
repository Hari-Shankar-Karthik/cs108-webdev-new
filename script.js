const suitable = async looking_roll_no => {
    const compatible_gender = gender1 => {
        if(gender1 === "Male") {
            return "Female";
        }
        if(gender1 === "Female") {
            return "Male";
        }
        return "Other";
    }

    const looking_student = await Student.findOne({ "IITB Roll Number": looking_roll_no });
    const suitable_gender = compatible_gender(looking_student["Gender"]);
    const suitable_profiles = await Student.find({ "IITB Roll Number": { $ne: looking_roll_no }, "Gender": suitable_gender });
    return suitable_profiles.map(profile => profile["IITB Roll Number"]);
}

// Function to determine the perfect match for a student
// Input: iitb_roll_number, Output: match_roll_number
// Logic: Counting the number of common interests and common hobbies
// Give each interest a weight of 0.6/m and each hobby a weight of 0.4/n, where
// m = number of interests chosen, n = number of hobbies chosen
// Therefore match_score = 0.6 * common_interests/m + 0.4 * common_hobbies/n - 0.1 * age_difference
// The student with the highest match_score is the perfect match
module.exports.find_perfect_match = async iitb_roll_number => {
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
    
    const looking_student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    let matching_roll_number = null;
    let match_stats = [0, Infinity]; // match_stats stores (common interests/hobbies, age difference)
    const suitable_roll_numbers = await suitable(iitb_roll_number);
    const suitable_profiles = await Student.find({ "IITB Roll Number": { $in: suitable_roll_numbers } });
    for(const profile of suitable_profiles) {
        const commonalities = count_common(looking_student["Interests"], profile["Interests"]) + count_common(looking_student["Hobbies"], profile["Hobbies"]);
        const age_difference = Math.abs(looking_student["Age"] - profile["Age"]);
        const current_stats = [commonalities, age_difference];
        if(is_better_match(current_stats, match_stats) && is_valid_match(current_stats)) {
            matching_roll_number = profile["IITB Roll Number"];
            match_stats = current_stats;
        }
    }

    return matching_roll_number;
}

const list_scores = async iitb_roll_number => {
    const suitable_profiles = await suitable_profiles(iitb_roll_number);
    for(let i = 0; i < suitable_profiles.length; i++) {
        const match_roll_number = suitable_profiles[i]["IITB Roll Number"];
        const match_score = await find_perfect_match(iitb_roll_number, match_roll_number);
        console.log(`Match score with ${match_roll_number}: ${match_score}`);
    }
}


module.exports = {
    suitable_profiles,
    find_perfect_match
}