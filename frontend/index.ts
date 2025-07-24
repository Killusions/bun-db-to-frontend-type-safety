import { client } from './client';

console.log('Hello, frontend!');

// Check if the session is authenticated
const { user, roles } = await client.auth.me.query();
console.log('Current user:', user);

if (user) {
  document.querySelector('#login-button')?.remove();
}

const posts = user ? await client.getPosts.query() : await client.getPublicPosts.query();

// Fill the root container with the fetched posts
const postsContainer = document.getElementById('posts');
if (postsContainer) {
  postsContainer.innerHTML = (await Promise.all(posts.map(async post => {
    console.log(post);
    console.log(await client.getUserInfo.query({ id: post.ownerId }));
    return `
      <div class="post">
        <h2>${post.title}</h2>
        <p>${post.body}</p>
        <small>By ${(await client.getUserInfo.query({ id: post.ownerId })).name} on ${new Date(post.createdAt).toLocaleDateString()}</small>
      </div>
    `
  }))).join('');
}

// Remove the loading indicator
document.getElementById('loading')?.remove();
