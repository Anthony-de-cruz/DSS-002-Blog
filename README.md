# DSS-002-Blog

## Template Description

The following description is from the original project template:

DSS Food Blog
This is the front-end for your DSS Blog. It has a "Login" page, a "Home" page, a "Posts" page, and a "My Posts" page. It includes
functional login, plus search, add, edit and delete of posts using local JSON files. You will update the functionality through the completion of your assignment.

---- Logging in -----
At the moment, logins are hardcoded. The username is "username" and the password is "password" in plaintext.

---- Handling posts -----
Posts can be searched using the search bar. See my_posts.js or posts.js for the function that handles this.
Posts can be edited or deleted from the "My Posts" page. Editing posts is handled by deleting the original post and inserting the new post in its place. See app.js for the POST request which handles this.

---- Loading posts -----
Posts are loaded from a local JSON file called posts.json. Posts are loaded on three different pages: "Home", "Posts", and "My Posts".

## Setup

> [!IMPORTANT]
>
> ### Prerequisites
>
> - Docker
>
> Docker will handle the dependencies such as Postgres, NodeJS and NPM.
> On Windows/MacOS, I'd recommend installing the Docker GUI, as it also installs all the CLI tools, check the Docker section for more.
>
> If you're unsure about Docker at all, I highly recommend these 2 videos below, they offer most of what you need, very quickly.
>
> [docker in 100 seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ) and [setting up docker](https://www.youtube.com/watch?v=gAkwW2tuIqE)


### Build and Run

In the root directory, run:

```sh
docker compose up --build
```

The first build will take a while, caching will speed up future builds.
The Node and Postgres containers will be running, you can see them using:

```sh
docker ps
```


When you want to restart the containers, just use `ctrl-c` on the command. If you want to delete them and completely rebuild, run `docker compose down` before running `docker compose up --build`. Note that this completely wipes any existing data in the database, which gets repopulated by the startup script.

Alternatively, you can do all this in the Docker GUI or even in your editor using the right extensions.

It is also worth noting that in the current configuration, the node server is dependant on the health check of the postgres server. In the event of a postgres failure, you can run the node server by itself with:

```sh
docker build -t blog-node ./node &&
docker run -e PORT=3000 -d -p 3000:3000 blog-node
```

Running a container seperately like this will require you to use `docker kill <CONTAINER ID>` to stop it.

