const isValidStudent = student => {
    if(!student["IITB Roll Number"] || !student["Name"] || !student["Year of Study"] || !student["Age"]) {
        return false;
    }
    return true;
}

module.exports = isValidStudent;