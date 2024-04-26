const Student = require("./models/student");

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

const find_perfect_match = async iitb_roll_number => {
    const calculate_match_score = (looking_student, profile_student) => {
        const common_interests = looking_student["Interests"].filter(value => profile_student["Interests"].includes(value)).length;
        const common_hobbies = looking_student["Hobbies"].filter(value => profile_student["Hobbies"].includes(value)).length;
        const common_interest_score = common_interests === 0 ? 0 : 0.6 * common_interests / profile_student["Interests"].length;
        const common_hobbies_score = common_hobbies === 0 ? 0 : 0.4 * common_hobbies / profile_student["Hobbies"].length;
        return common_interest_score + common_hobbies_score - 0.1 * Math.abs(looking_student["Age"] - profile_student["Age"]);
    }
    
    const looking_student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    let matching_roll_number = null;
    let max_score = 0;
    const suitable_roll_numbers = await suitable(iitb_roll_number);
    const suitable_profiles = await Student.find({ "IITB Roll Number": { $in: suitable_roll_numbers } });
    
    for(const profile of suitable_profiles) {
        const current_score = calculate_match_score(looking_student, profile);
        if(current_score > max_score) {
            max_score = current_score;
            matching_roll_number = profile["IITB Roll Number"];
        }
    }

    return matching_roll_number;
}

module.exports = {
    suitable,
    find_perfect_match,
}