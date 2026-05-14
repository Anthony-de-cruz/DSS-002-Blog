/**
 * Load posts made by the current user, or all posts when the user is an admin.
 */
async function loadPosts() {
    // Load posts data
    const post_response = await fetch("/api/posts");
    const post_data = await post_response.json();

    // Load login data
    const user_response = await fetch("/api/user");
    const user_data = await user_response.json();

    // Remove current posts
    let postList = document.getElementById("myPosts");

    postList.querySelectorAll("article").forEach((post) => post.remove());

    // Add posts made by current user, or all posts when the user is an admin.
    for (let i = 0; i < post_data.length; i++) {
        let author = post_data[i].username;

        if (user_data.admin || author === user_data.username) {
            let timestamp = post_data[i].timestamp;
            let title = post_data[i].title;
            let content = post_data[i].content;
            let postId = post_data[i].id;

            let postContainer = document.createElement("article");
            postContainer.classList.add("post");
            postContainer.dataset.postId = postId;
            let fig = document.createElement("figure");
            postContainer.appendChild(fig);

            let postIdContainer = document.createElement("h6");
            postIdContainer.textContent = postId;
            postIdContainer.hidden = true;
            postIdContainer.id = "postId";
            postContainer.appendChild(postIdContainer);

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
            contentContainer.id = "content";
            contentContainer.textContent = content;
            figcap.appendChild(contentContainer);

            let editBtn = document.createElement("button");
            editBtn.classList.add("editBtn");
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", editPost);
            postContainer.appendChild(editBtn);

            let delBtn = document.createElement("button");
            delBtn.classList.add("delBtn");
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", deletePost);
            postContainer.appendChild(delBtn);

            postList.appendChild(postContainer);
        }
    }
}

loadPosts();

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
}

function editPost(e) {
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
}

/**
 * Hide posts that do not match the search box text.
 */
function searchPosts() {
    let searchBar = document.getElementById("search");

    // Get contents of search bar
    let filter = searchBar.value.toUpperCase();

    let postList = document.getElementById("myPosts");
    let posts = postList.getElementsByTagName("article");

    // Loop through all posts, and hide ones that don't match the search
    for (let i = 0; i < posts.length; i++) {
        // Search body of post
        let content = posts[i].getElementsByTagName("p")[0];
        let postContent = content.textContent || content.innerText;

        // Search title of post
        let title = posts[i].getElementsByTagName("h3")[0];
        let titleContent = title.textContent || title.innerText;

        // Search username
        let username = posts[i].getElementsByTagName("h5")[0];
        let usernameContent = username.textContent || username.innerText;

        // Change display property of posts depending on whether it matches the search or not
        if (
            postContent.toUpperCase().indexOf(filter) > -1 ||
            titleContent.toUpperCase().indexOf(filter) > -1 ||
            usernameContent.toUpperCase().indexOf(filter) > -1
        ) {
            posts[i].style.display = "";
        } else {
            posts[i].style.display = "none";
        }
    }
}

document.getElementById("search").addEventListener("keyup", searchPosts);
