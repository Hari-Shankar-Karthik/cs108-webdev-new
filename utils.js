const fs = require('fs');
const path = require('path');
const util = require('util');

const loginFilePath = path.join(__dirname, 'dbs', 'login.json');
const studentsFilePath = path.join(__dirname, 'dbs', 'students.json');

// convert callback-based functions to promise-based functions
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// reads the data from login.json file and returns an array of objects
const get_all_login_data = async () => {
    try {
        const data = await readFileAsync(loginFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(error);
    }
}

const get_all_students_data = async () => {
    try {
        const data = await readFileAsync(studentsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(error);
    }
}

// authenticate the user using the provided credentials
exports.validate_login = async (username, password) => {
    const login_data = await get_all_login_data();
    for(const student of login_data) {
        if(student["username"] === username && student["password"] === password) {
            return student["IITB Roll Number"];
        }
    }
    throw new Error("Invalid credentials");
}

// get the login details (password, secret question, etc) given the username
exports.get_login_data = async username => {
    const login_data = await get_all_login_data();
    for(const student of login_data) {
        if(student["username"] === username) {
            return student;
        }
    }
    throw new Error("User not found");
}

// get the student data (from students.json) given roll number
exports.get_student_data = async (iitb_roll_number) => {
    const all_students_data = await get_all_students_data();
    for(const student of all_students_data) {
        if(student["IITB Roll Number"] === iitb_roll_number) {
            return student;
        }
    }
    throw new Error("Student not found");
}

// update the student data (in students.json) given roll number
exports.update_student_data = async (iitb_roll_number, updated_student_data) => {
    console.log(`roll number: ${iitb_roll_number}`);
    console.log(`new data: ${JSON.stringify(updated_student_data, null, 4)}`);
    const all_students_data = await get_all_students_data();
    for(const student of all_students_data) {
        if(student["IITB Roll Number"] === iitb_roll_number) {
            for(const property in updated_student_data) {
                student[property] = updated_student_data[property];
            }
            break;
        }
    }
    try {
        await writeFileAsync(studentsFilePath, JSON.stringify(all_students_data, null, 4), 'utf8');
        console.log(`Profile of ${iitb_roll_number} updated successfully`);
    } catch (error) {
        throw new Error(error);
    }
}