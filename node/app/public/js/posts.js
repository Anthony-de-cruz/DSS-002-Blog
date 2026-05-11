// Function to load posts made by user who is currently logged in
async function loadPosts() {
<<<<<<< HEAD

=======
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
    // Load posts data from database API
    const post_response = await fetch("/api/posts");
    const post_data = await post_response.json();

<<<<<<< HEAD

    let postList = document.getElementById('postsList');

    // Remove current posts
    for(let i = 0; i < postList.children.length; i++) {
        if(postList.children[i].nodeName == "article") {
            postList.removeChild(postList.children[i]);
        }
    }

    // Add all recorded posts
    for(let i = 0; i < post_data.length; i++) {
=======
    const user_response = await fetch("/api/user");
    const user_data = await user_response.json();

    let postList = document.getElementById("postsList");

    // Remove current posts
    postList.querySelectorAll("article").forEach((post) => post.remove());

    // Add all recorded posts
    for (let i = 0; i < post_data.length; i++) {
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
        let author = post_data[i].username;
        let timestamp = post_data[i].timestamp;
        let title = post_data[i].title;
        let content = post_data[i].content;
        let postId = post_data[i].id;

<<<<<<< HEAD
        let postContainer = document.createElement('article');
        postContainer.classList.add("post");
        let fig = document.createElement('figure');
        postContainer.appendChild(fig);

        let postIdContainer = document.createElement("p");
=======
        let postContainer = document.createElement("article");
        postContainer.classList.add("post");
        postContainer.dataset.postId = postId;
        let fig = document.createElement("figure");
        postContainer.appendChild(fig);

        let postIdContainer = document.createElement("h6");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
        postIdContainer.textContent = postId;
        postIdContainer.hidden = true;
        postIdContainer.id = "postId";
        postContainer.appendChild(postIdContainer);

<<<<<<< HEAD
        let img = document.createElement('img');
        let figcap = document.createElement('figcaption');
        fig.appendChild(img);
        fig.appendChild(figcap);
        
        let titleContainer = document.createElement('h3');
        titleContainer.textContent = title;
        figcap.appendChild(titleContainer);
        
        let usernameContainer = document.createElement('h5');
        usernameContainer.textContent = author;
        figcap.appendChild(usernameContainer);

        let timeContainer = document.createElement('h5');
        timeContainer.textContent = timestamp;
        figcap.appendChild(timeContainer);

        let contentContainer = document.createElement('p');
        contentContainer.textContent = content;
        figcap.appendChild(contentContainer);

=======
        let img = document.createElement("img");
        let figcap = document.createElement("figcaption");
        fig.appendChild(img);
        fig.appendChild(figcap);

        let titleContainer = document.createElement("h3");
        titleContainer.textContent = title;
        figcap.appendChild(titleContainer);

        let usernameContainer = document.createElement("h5");
        usernameContainer.textContent = author;
        figcap.appendChild(usernameContainer);

        let timeContainer = document.createElement("h5");
        timeContainer.textContent = timestamp;
        figcap.appendChild(timeContainer);

        let contentContainer = document.createElement("p");
        contentContainer.textContent = content;
        figcap.appendChild(contentContainer);

        if (user_data.admin) {
            let delBtn = document.createElement("button");
            delBtn.classList.add("delBtn");
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", deletePost);
            postContainer.appendChild(delBtn);
        }

>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
        postList.appendChild(postContainer);
    }
}

loadPosts();

<<<<<<< HEAD
// Function to filter posts on page using search bar
function searchPosts() {

    let searchBar = document.getElementById('search');
=======
async function deletePost(e) {
    const post = e.target.closest("article");
    if (!post) {
        return;
    }

    const response = await fetch(`/api/posts/${encodeURIComponent(post.dataset.postId)}`, {
        method: "DELETE",
    });

    if (response.ok) {
        post.remove();
    }
}

// Function to filter posts on page using search bar
function searchPosts() {
    let searchBar = document.getElementById("search");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9

    // Get contents of search bar
    let filter = searchBar.value.toUpperCase();

<<<<<<< HEAD
    let postList = document.getElementById('postsList');
    let posts = postList.getElementsByTagName('article');

    // Loop through all posts, and hide ones that don't match the search
    for (i = 0; i < posts.length; i++) {

        // Search body of post
        let content = posts[i].getElementsByTagName('p')[0];
=======
    let postList = document.getElementById("postsList");
    let posts = postList.getElementsByTagName("article");

    // Loop through all posts, and hide ones that don't match the search
    for (let i = 0; i < posts.length; i++) {
        // Search body of post
        let content = posts[i].querySelector("figcaption p");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
        let postContent = content.textContent || content.innerText;

        // Search title of post
        let title = posts[i].getElementsByTagName("h3")[0];
        let titleContent = title.textContent || title.innerText;

        // Search username of post
        let username = posts[i].getElementsByTagName("h5")[0];
        let usernameContent = username.textContent || username.innerText;

        // Change display property of post depending on if it matches search query
<<<<<<< HEAD
        if (postContent.toUpperCase().indexOf(filter) > -1 || titleContent.toUpperCase().indexOf(filter) > - 1 ||
             usernameContent.toUpperCase().indexOf(filter) > - 1) {
=======
        if (
            postContent.toUpperCase().indexOf(filter) > -1 ||
            titleContent.toUpperCase().indexOf(filter) > -1 ||
            usernameContent.toUpperCase().indexOf(filter) > -1
        ) {
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            posts[i].style.display = "";
        } else {
            posts[i].style.display = "none";
        }
    }
}

// Search posts whenever the user types
<<<<<<< HEAD
if(document.getElementById("search")) {
    document.getElementById("search").addEventListener("keyup", searchPosts);
}
=======
if (document.getElementById("search")) {
    document.getElementById("search").addEventListener("keyup", searchPosts);
}
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
