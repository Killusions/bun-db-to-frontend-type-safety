import { randomBytes } from 'crypto';

import { createAccount } from './auth/router';
import { createPost } from './server';

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
  try {
    const { id: ownerId } = await createAccount({
      email: adminEmail,
      password: randomPassword,
      name: adminName,
      role: 'admin',
    });
    console.log(`Admin account created with email: ${adminEmail} and password: ${randomPassword}`);
    // Create two sample posts, one public and one private
    const publicPost = await createPost({
      title: publicPostTitle,
      body: publicPostContent,
      ownerId,
    });
    console.log(`Public post created with ID: ${publicPost.id}`);
    const privatePost = await createPost({
      title: privatePostTitle,
      body: privatePostContent,
      isPrivate: true,
      ownerId,
    });
    console.log(`Private post created with ID: ${privatePost.id}`);
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw new Error('An unknown error occurred while creating the admin account');
    }
    if (!error.message.includes('Email taken')) {
      throw new Error(`Failed to create admin account: ${error.message}`);
    }
  }
};
