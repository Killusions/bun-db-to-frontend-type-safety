import { strict as assert } from 'assert';
import { randomBytes } from 'crypto';

import { localAdminCaller } from '../router';

// Generate a random password for the admin account
const generateRandomPassword = () => {
  return randomBytes(16).toString('hex');
};

const randomPassword = generateRandomPassword();

const adminEmail = 'admin@mll.one';
const adminName = 'admin';

const publicPostContent = 'This is a public post created during the seed process.';
const publicPostTitle = 'Example Public Post';

const privatePostContent = 'This is a private post created during the seed process.';
const privatePostTitle = 'Example Private Post';

// Create an admin account if it doesn't exist, and create two sample posts
export const seedAccountAndPosts = async () => {
  let ownerId: string;
  let adminCaller = localAdminCaller(adminEmail);
  try {
    const accountCreated = await adminCaller.auth.createAccount({
      email: adminEmail,
      password: randomPassword,
      name: adminName,
      role: 'admin',
    });
    ownerId = accountCreated.id;
    console.log(`Admin account created with email: ${adminEmail} and password: ${randomPassword}`);
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw new Error('An unknown error occurred while creating the admin account');
    } else if (!error.message.includes('Email taken')) {
      console.error(error);
      throw new Error(`Failed to create admin account: ${error.message}`);
    } else {
      const existingUser = await adminCaller.getUserByEmail({ email: adminEmail });
      if (!existingUser) {
        throw new Error(`Failed to find existing user with email: ${adminEmail}`);
      }
      ownerId = existingUser.id;
    }
  }
  adminCaller = localAdminCaller(adminEmail, ownerId);
  // Delete all previous posts of the admin account
  const previousPosts = await adminCaller.posts.getUserPosts({ ownerId });
  await Promise.all(
    previousPosts.map((post) => adminCaller.posts.deletePost({ id: post.id }))
  );
  // Create two sample posts, one public and one private
  const publicPost = await adminCaller.posts.createPost({
    title: publicPostTitle,
    body: publicPostContent
  });
  console.log(`Public post created with ID: ${publicPost.id}`);
  const privatePost = await adminCaller.posts.createPost({
    title: privatePostTitle,
    body: privatePostContent,
    isPrivate: true
  });
  console.log(`Private post created with ID: ${privatePost.id}`);

  // --- TEST SECTION ---
  // Fetch the posts to verify they were created correctly
  const posts = await adminCaller.posts.getPosts();
  assert(posts.length === 2, 'Expected two posts to be created');
  assert(posts.some(post => post.title === publicPostTitle), 'Public post not found');
  assert(posts.some(post => post.title === privatePostTitle), 'Private post not found');
  // Verify the admin account exists
  const adminUser = await adminCaller.getUserByEmail({ email: adminEmail });
  assert(adminUser, 'Admin user not found');
  assert(adminUser.name === adminName, 'Admin user name mismatch');

  // --- TEST UPDATE ---
  // Create a new post to test the update functionality
  const updatedPost = await adminCaller.posts.createPost({
    title: 'Updated Post Title',
    body: 'This post is created to test the update functionality.'
  });
  // Update the post
  const updatedPostContent = 'This post has been updated to test the update functionality.';
  await adminCaller.posts.updatePost({
    id: updatedPost.id,
    title: 'Updated Post Title',
    body: updatedPostContent
  });
  // Delete the post
  await adminCaller.posts.deletePost({ id: updatedPost.id });
}
