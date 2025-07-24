import { client } from './client/client';
import authProps from './client/auth';

console.log('Hello, frontend!');

// Log the user info if available
console.log(authProps.user ? `Current user: ${authProps.user.name}` : 'No user logged in');

if (authProps.loggedIn) {
  document.querySelector('#login-button')?.remove();
}

const posts = authProps.loggedIn ? await client.posts.getPosts.query() : await client.posts.getPublicPosts.query();

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
