// if quickchat is true, scroll to the bottom of the page
if(document.querySelector("#quickchat").textContent === "true") {
    window.onload = function() {
        window.scrollTo(0,document.body.scrollHeight);
    };
}

// The Like Button
// When the like button is pressed, this user is added to the list of users who have liked this particular profile.
// The like button is disabled for those who have already liked the profile.
// There is no feature (at present) to unlike a profile.

const likeButton = document.querySelector('#like-button');

// If the user has already liked the profile, disable the like button
const canLike = document.querySelector("#can-like").textContent;
if (canLike === "false") {
    likeButton.textContent = "Liked";
    likeButton.disabled = true;
}

likeButton.addEventListener("click", () => {
    console.log("Like button clicked")
    const likerRollNo = document.querySelector("#liker-roll-number").textContent;
    const likedID = document.querySelector("#liked-id").textContent;
    console.log(`Liker Roll No: ${likerRollNo}, Liked ID: ${likedID}`);
    fetch('/hitLike', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ likerRollNo, likedID })
    })
    .then(response => {
        likeButton.textContent = "Liked";
        likeButton.disabled = true;
        window.location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
    });  
})