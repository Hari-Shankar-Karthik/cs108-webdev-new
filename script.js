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
    // TODO: Implement the function
    return null;
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