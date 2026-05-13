// Function to add the latest 2 posts to the home page
async function loadLatestPosts() {
    // Load posts data
    const post_response = await fetch("/api/posts");
    const post_data = await post_response.json();

    const user_response = await fetch("/api/user");
    const user_data = await user_response.json();

    // Remove current posts from page
    let postList = document.getElementById("postsList");

    postList.querySelectorAll("article").forEach((post) => post.remove());

    // Load latest 2 posts
    for (let i = 0; i < Math.min(post_data.length, 2); i++) {
        let author = post_data[i].username;
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
        contentContainer.textContent = content;
        figcap.appendChild(contentContainer);

        if (user_data.admin) {
            let delBtn = document.createElement("button");
            delBtn.classList.add("delBtn");
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", deletePost);
            postContainer.appendChild(delBtn);
        }

        postList.insertBefore(postContainer, postList.querySelector("p:last-of-type"));
    }
}

loadLatestPosts();

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
