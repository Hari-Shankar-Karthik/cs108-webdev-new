# Starting the Server

To get *Looking For a Date?* up and running on your local machine,
follow these steps:

1.    Download and install Node.js from <https://nodejs.org/en/download>.
    
2.    Download and install MongoDB Compass from <https://www.mongodb.com/docs/compass/current/install/>. Follow the instructions specific to your operating system.

3.  Download and unzip the server repository (you can download it from
    <https://github.com/Hari-Shankar-Karthik/cs108-webdev-new>).

4.  Open a new terminal in the main directory of the server and type

                    npm install

5.  Once this is complete, you are ready to seed *Looking For a Date?*
    with login and student data. Copy the `login.json` and
    `students.json`. files into the `dbs/` directory (replace the extsting files, if there are any).
    Then, run the command

                    node seed.js

6.  Now, you are ready to start the server. Run the command

                    node index.js

7.  The server is now up and running on port 8000. Open up a web browser
    and go to [localhost:8000/login](localhost:8000/login) to
    start the fun.

# Some Features of *Looking for a Date?*

## Login Page

The *Login* page is hosted at [localhost:8000/login](localhost:8000/login). It allows existing
users to log in by entering the correct username and password that they
had set. If a user enters their username and password correctly, they
are redirected to their *Dashboard*. Entering an invalid
username-password pair will display an alert. There are also options
like *Forgot Password?* and *Signup* which will redirect to the
respective routes.

If the username and password are entered correctly but the user has not yet 
linked their login credentials with their IITB Roll Number, a page appears prompting
them to do so. Submitting this form redirects the user to their dashboard page.

## Forgot Password?

The *Forgot Password?* page consists of a username prompt. If a valid
username is entered, the password is alerted to the user once they
answer the secret question correctly. If either the username or the
answer to the secret question are incorrect, the user is redirected back
to the *Login* page with an appropriate alert.

If the secret question is answered correctly, the username gets
pre-filled during the redirection to the *Login* page, the user need
only enter the password.

The redirection to *Login* on entering wrong credentials in the *Forgot*
page is deliberate as it slows down a malicious agent trying to access
an account

## Signup

The *Signup* page is hosted at [localhost:8000/signup](localhost:8000/signup). A new user
needs to enter their IITB roll number, a username, a password and a
secret question-answer pair (to be used for password recovery). If an
account of the given IITB roll number already exists, the user is
alerted of the same. If an account with the given username already
exists, this is also alerted to the user, along with suggestions for a
unique username.

After this is complete, the user is redirected to the *Complete Profile*
page. Here, prompts are given for the user to enter their name, email
address, year of study, age, gender, interests and hobbies. The user can
then click on 'Complete Profie' and they are redirected to the
*Dashboard*.

## Dashboard

The *Dashboard* is hosted at [localhost:8000/dashboard](localhost:8000/dashboard). It consists
of a lively little greeting message, a stats section and an inbox
section.

The little quip you see under the greeting is newly generated every time
for maximum quirkiness each time you log in.

### Stats Section

*Looking For a Date?* keeps track of two stats on your profile: **View
Count** and **Like Count**.

-   Your view count is the number of times your profile has been opened
    by other users. Note that a particular user can view your profile
    only once in each session (each time they log in). This is to avoid
    increase of view count simply upon refreshing the profile page
    multiple times.

-   Your like count is the number of users who have liked your profile.
    Each user can like your profile atmost once. There is no option of
    'unliking' a profie.

### Inbox Section

*Looking For a Date?* provides a unique feature called ***QuickChat***.
*QuickChat* is a text-based messaging feature completely contained
withing the website. It is suitable for sending greeting messages,
deciding on meeting locations and so on.

The *QuickChat* inbox in the *Dashboard* provides links to open the
chats of those who have newly messaged you. If you want to send someone
a message, click on the *Explore* option in the header, select the
person you want to message and open their *QuickChat*.

## My Profile

*My Profile* is hosted at [localhost:8000/profile](localhost:8000/profile). It allows you to
edit the information you provided during signup, such as age, inteerests,
hobbies and so on.

To use a file on your local machine, copy it into the `photos/`
directory. Then, enter `photos/<filename>` in the profile photo input
field. The same instructions are also available if you click on the
'Profile Photo URL' label.

You can click on either the **Update Profile** or **Update and Find
Match** buttons depending on whether or not you want to find a match
now. Clicking the first button redirects you to the *Dashboard* with a
'Profile Updated Successfully' message, and clicking the second button
takes you to *Match*.

## Match

*Match* is hosted at [localhost:8000/match](localhost:8000/match). The matching algorithm of
*Looking For a Date?* factors in common interests, hobbies and the age
difference to find a suitable match for you.

If a match is found, the page rendered displays the bio of the match,
along with a clickable link named 'Find out what you have in common'.
There are also options view their profile page or connect via
*QuickChat*. Alternatively, you can explore other profiles by clicking
on the 'View More Profiles' button.

If no match was found, a different page is rendered which has a
reassuring message and the option to explore more profiles.

### The Matching Algorithm

First, a list of **Suitable Profiles** is selected from the list of all
uers, based on the users' gender. This matching algorithm matches 'Male'
users to 'Female' users, 'Female' users to 'Male' users and 'Other'
users to 'Other' users.

For each suitable profile, the interests score $s_i$ is calculated as ($s_i$ is $0$ if $i_s$ is $0$):
$$s_i = \frac{i_c}{i_s}$$
Where $i_c$ are $i_s$ are the number of common
interests and selected interests for this profile. Similarly, the
hobbies score $s_h$ is calculated as: 
$$s_h = \frac{h_c}{h_s}$$
and $0$ if $h_s$ is $0$.

Then, the net score of each profile is given by:

$$s = 0.6s_i+0.4s_h-0.1a$$ Where $a$ is the age difference between the
user and this profile.

The reason behind dividing by the number of hobbies/interests selected
is so as to disincentivize users from selecting all the boxed to try and
match better.

The match is then the profile which scored the highest. If no profile
got a positive score, it is deemed that no match is found for the user.

## Explore

*Explore* is hosted at [localhost:8000/explore](localhost:8000/explore). It displays a list of
all the suitable profiles in card format which the user can scroll
through. Clicking on any of them redirects the user to the corresponding
profile page.

## Profile Page

*Profile* is hosted at [localhost:8000/profile/:profileID](localhost:8000/profile/:profileID),
where `profileID` is this user's ID in the database. The *Profile* page
consists of the corresponding user's details, such as name, year of
study, profile photo, interests and hobbies. There is an option to like
the user's profile. A stats section is also present which shows the
number of views and likes that this user has on their profile. There is
also an option to open up a *QuickChat* with this user.

## Chat

*Chat* is hosted at [localhost:8000/chat/:profileID](localhost:8000/chat/:profileID), where
your chat with the user having ID `profileID` is rendered. *Chat* allows
for basic text-based messaging. It shows the message sent by you in
green and to the right, and the messages sent by them in gray and to the
left. You can send messages by entering them in the text box at the
bottom and hitting 'Send'.
