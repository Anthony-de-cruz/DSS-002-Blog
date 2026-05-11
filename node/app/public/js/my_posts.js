// Function to load posts made by user who is currently logged in
async function loadPosts() {
<<<<<<< HEAD

    // Load posts data 
=======
    // Load posts data
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
    const post_response = await fetch("/api/posts");
    const post_data = await post_response.json();

    // Load login data
    const user_response = await fetch("/api/user");
    const user_data = await user_response.json();

    // Remove current posts
<<<<<<< HEAD
    let postList = document.getElementById('myPosts');

    for(let i = 0; i < postList.children.length; i++) {
        if(postList.children[i].nodeName == "article") {
            postList.removeChild(postList.children[i]);
        }
    }

    // Add posts made by current user
    for(let i = 0; i < post_data.length; i++) {
        
        let author = post_data[i].username;

        // Check usernames match on each post
        if(author === user_data.username) {
=======
    let postList = document.getElementById("myPosts");

    postList.querySelectorAll("article").forEach((post) => post.remove());

    // Add posts made by current user, or all posts when the user is an admin.
    for (let i = 0; i < post_data.length; i++) {
        let author = post_data[i].username;

        if (user_data.admin || author === user_data.username) {
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            let timestamp = post_data[i].timestamp;
            let title = post_data[i].title;
            let content = post_data[i].content;
            let postId = post_data[i].id;

<<<<<<< HEAD
            let postContainer = document.createElement('article');
            postContainer.classList.add("post");
            let fig = document.createElement('figure');
=======
            let postContainer = document.createElement("article");
            postContainer.classList.add("post");
            postContainer.dataset.postId = postId;
            let fig = document.createElement("figure");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            postContainer.appendChild(fig);

            let postIdContainer = document.createElement("h6");
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
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            contentContainer.id = "content";
            contentContainer.textContent = content;
            figcap.appendChild(contentContainer);

<<<<<<< HEAD
            let editBtn = document.createElement('button');
            editBtn.classList.add('editBtn');
=======
            let editBtn = document.createElement("button");
            editBtn.classList.add("editBtn");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", editPost);
            postContainer.appendChild(editBtn);

<<<<<<< HEAD
            let delBtn = document.createElement('button');
            delBtn.classList.add('delBtn');
=======
            let delBtn = document.createElement("button");
            delBtn.classList.add("delBtn");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", deletePost);
            postContainer.appendChild(delBtn);

            postList.appendChild(postContainer);
        }
    }
}

loadPosts();

// Function to remove a post from the page after clicking delete - this is also reflected on the server side
<<<<<<< HEAD
function deletePost(e) {

    // Put post in object to be the body of fetch request
    const post = {
        postId:document.getElementsByTagName('h6')[0].textContent, 
    };

    const requestHeaders = {
        "Content-Type": "application/json"
    };

    // Delete post
  fetch('/deletepost', {
    method: 'POST',
    headers: requestHeaders,
    body:JSON.stringify(post)
  });

  // Hide element on button click so deletion appears immediate
  e.target.parentNode.hidden = true;
=======
async function deletePost(e) {
    const post = e.target.closest("article");
    if (!post) {
        return;
    }

    // Send
    const response = await fetch(`/api/posts/${encodeURIComponent(post.dataset.postId)}`, {
        method: "DELETE",
    });

    // Update DOM.
    if (response.ok) {
        post.remove();
    }
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
}

// Function to edit post
function editPost(e) {
<<<<<<< HEAD

    // Get post that the user clicked on
    let post = e.target.parentNode;
   
    // Fill out form fields with data grabbed from post
    document.getElementById("title_field").value = post.getElementsByTagName('h3')[0].textContent;
    document.getElementById("content_field").value = post.getElementsByTagName('p')[0].textContent;
    document.getElementById("postId").value = post.getElementsByTagName('h6')[0].textContent;

    // Scroll user to post form
    document.getElementById("postForm").scrollIntoView({behavior: "smooth"});

=======
    // Get post that the user clicked on
    let post = e.target.closest("article");
    if (!post) {
        return;
    }

    // Fill out form fields with data grabbed from post
    document.getElementById("title_field").value = post.getElementsByTagName("h3")[0].textContent;
    document.getElementById("content_field").value = post.getElementsByTagName("p")[0].textContent;
    document.getElementById("postId").value = post.dataset.postId;
    document.getElementById("post_button").textContent = "Update";

    // Scroll user to post form
    document.getElementById("postForm").scrollIntoView({ behavior: "smooth" });
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
}

// Function to filter posts on page using search bar
function searchPosts() {
<<<<<<< HEAD

    let searchBar = document.getElementById('search');
=======
    let searchBar = document.getElementById("search");
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9

    // Get contents of search bar
    let filter = searchBar.value.toUpperCase();

<<<<<<< HEAD
    let postList = document.getElementById('myPosts');
    let posts = postList.getElementsByTagName('article');

    // Loop through all posts, and hide ones that don't match the search
    for (i = 0; i < posts.length; i++) {

        // Search body of post
        let content = posts[i].getElementsByTagName('p')[0];
=======
    let postList = document.getElementById("myPosts");
    let posts = postList.getElementsByTagName("article");

    // Loop through all posts, and hide ones that don't match the search
    for (let i = 0; i < posts.length; i++) {
        // Search body of post
        let content = posts[i].getElementsByTagName("p")[0];
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
        let postContent = content.textContent || content.innerText;

        // Search title of post
        let title = posts[i].getElementsByTagName("h3")[0];
        let titleContent = title.textContent || title.innerText;

        // Search username
        let username = posts[i].getElementsByTagName("h5")[0];
        let usernameContent = username.textContent || username.innerText;

        // Change display property of posts depending on whether it matches the search or not
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

<<<<<<< HEAD
document.getElementById("search").addEventListener("keyup", searchPosts);
=======
document.getElementById("search").addEventListener("keyup", searchPosts);
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
