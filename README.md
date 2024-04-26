# cs108-webdev-project

## NOTE:
- NO: Make a new terminal command nodemon -g index.js which shows all the console.log info that I'm currently showing. nodemon index.js will not show this stuff in its final form.

- ESSENTIAL: email

- Only allowed one 'find match' per session.

- Change the matching alg. to damp down the chances of someone who has selected more boxes.
- Subscription increases the chance of match.

- NO: Add a 'bio' section to each student's profile.

- NO: Include data on branch (department) as well.

## Requirements: 

1) **students.json**

- This file will contain an array of dictionaries (like Python dictionaries), each dictionary having all the required details about a particular student.
- These and only these fields will be present in each dictionary of students.json:- "IITB Roll Number", "Name", "Year of Study", "Age", "Gender", "Interests", "Hobbies", "Email" and "Photo".
- The only possible options for the "Gender" field are going to be "Male", "Female" and "Other". Only a single option can be chosen for this field.
- For the "Interests" field, the only possible options are "Traveling", "Sports", "Movies", "Music", "Literature", "Technology", "Fashion" and "Art". One or more options can be chosen for this field.
- For the "Hobbies" field, the only possible options are "Reading", "Cooking", "Coding", "Gardening", "Painting", "Watching YouTube/Instagram", "Playing musical instruments" and "Photography". One or more options can be chosen for this field.
- For "Photo", a valid file path to the photo will be given as input.
- For simplicity, you can assume that in students.json, all fields will be non-empty, with valid inputs. 

2) **login.json**

- Any existing/registered user must have their username and password in login.json.
- A secret question-answer phrase will be there for every username-password in login.json.

3) **login.html**

- To access the input interface, there can be a login screen before that, which will require you to enter username and password of some sort. 
- If you are "registered" and you fill correct entries, then you login, otherwise give appropriate error messages. 
- Any existing/registered user must have their username and password in login.json. Hence any registered user can access this website (on the same machine) at a much later time in future.
- You don't need to create a feature (as a Basic Task) to allow a new user to register to the website (i.e. appending a new username, password to login.json).

4) **forgot.html**

- A secret question-answer phrase will be there for every username-password in login.json. 
- Whenever a person has to recover a password, they will click some "Forgot Password?" button in the login page. 
- Then a new page opens up where they will provide their username as input and then the secret question corresponding to the username should be asked. 
- If the person enters the correct answer to the question then print the password on the screen otherwise print appropriate error message. 

5) **dating.html** and **styles.css**:

- Create a decent input interface with proper labels and input boxes for a person to fill in his/her/their personal details. 
- Those details should correspond to the fields in students.json, i.e. the person's "IITB Roll Number", "Name", "Year of Study", "Age", "Gender",  "Interests", "Hobbies", "Email" and "Photo".
- For "Gender", create a set of radio buttons to choose a single option.
- For "Interests" and "Hobbies", create a set of checkboxes to choose multiple options for each.
- There should be some sort of a "Submit" button which on clicking should "find" the person's "right match".
- Provide a "Logout" button as well, that takes back to the login screen.
- You can assume that the person will always give valid non-empty responses.

6) **scroll_or_swipe.html**

- Provide a feature in the input interface (dating.html) to allow the person to scroll/swipe through all the students (their details and photo) present in students.json file. 
- The person clicks on some "Scroll/Swipe" button in the input interface and a new page opens up where you can freely scroll/swipe through profiles.

7) **script.js**

- The "right match" of a person should have significant (not necessarily the maximum) intersections in "Interests" and/or "Hobbies" with that person. 
- Alongside this, you can create any criteria (of your own will) to decide a "right match" of a person.
- Note that the "right match" of a person is not the person itself. That’s how dating works!
- If you fail to find an apt "right match" (according to whatever criteria you use), then give an appropriate message in the output interface.
- If there are multiple matches (according to your criteria), then you should break ties arbitrarily and return only one match.
- The "right match" isn’t necessarily fixed for any person. It may depend on how you are finding it.

8) **match.html**

- OPENS IN A NEW TAB.
- The same CSS and Javascript files will be used, i.e. style.css and script.js
- If you fail in finding the "right match", then you should have displayed an error message on the dating.html page.



## Customisations

- Add IITB Logo and IITB Landmark picture.

- (NECESSARY): The scroll or swipe page shows matches in descending order of common interests and hobbies.

- (Highly Recommended): In the scroll_or_swipe display of all the students, give a button which takes you to this particular user's profile page where you can see THEIR BIO, THEIR LIKE METER and other stats.

- Homepage for users not logged in / signed up.

- (COMPLICATED. SEE LINKS IN THE PROBLEM STATEMENT): Mailing the right match: After the "right match" is decided, you can provide an option to contact the "right match" by mailing them an email from your mail ID.

- Profile pages (yourself and others): Images of both in your camera
- (INCLUDES CHAT FEATURE, RATING, VIEW STATS, LIKE STATS, RECENTLY VIEWED, BIO, etc.)

- Sound Effects: Add a sound effect when you click find the right match (a "hopeful dot dot dot" sound), and another one when a match is found (in my mind it's the "phonepe payment made" sound), another when no match is found. Add a scroll sound effect on the scroll_or_swipe.html page too.

- Graphics: No match is found should display a "lonely heart flying around looking" animation. When the right match is found, try making it pop with an increase in size and the confetti spilling over from the sides. On the login page, a "two hearts happily flying around" animation.

- Filters: Make another page for filtering (possibly called filter.html?) where you will allow user to filter based on hobbies/interests, and show all matches in a list. (Filtering animation is the grey lines moving across while an update has been made.) Again here, you can click on each card in the list and it should redirect you to their profile page (see the 'highly recommended' point 2).

- On the signup page, a little button which suggests cute usernames, like "CampusCupid".

- Where you show the right match, provide a button redirecting you to scroll or swipe page.

- Create an about page for the to display to users who aren't logged in (perhaps at the bottom of the login and signup pages).

- (ASK KAVYA IF YOU CAN DO THIS) In case of "forgot password", send an email to the registered mail ID with the right password if they answer the secret question correctly.

- Autofill the username (and password?) when you come back to the login page from the forgot password page and the password was revealed.

- Customise the criteria for selection of the right match. (not of utmost priority.)

- Improve the authentication and security.

## PTR

- The grading is more focused on design. MAKE SURE ALL THE SITES LOOK GOOD ON ALL SCREEN SIZES.

- Code should be well structured and well commented.

## References 

- https://www.w3schools.com/howto/howto_js_slideshow.asp
- https://getbootstrap.com/
