# How to Deploy Your App via GitHub

Your Firebase App Hosting is connected to a GitHub repository for automatic deployments. When you push your source code to the `master` branch on GitHub, Firebase will automatically build and deploy your application.

If you are seeing an "Authentication failed" or "403 Forbidden" error, follow these steps to use a Personal Access Token (PAT) to securely push your code. This is the **only** way to push from this terminal.

## Step 1: Create a GitHub Personal Access Token (PAT)

First, you need to create a secure token on GitHub that this workspace can use as a password.

1.  **DELETE OLD TOKENS:** To be safe, first go to your [Personal Access Tokens page on GitHub](https://github.com/settings/tokens) and **delete** any old tokens you created for this project. This ensures you are using a fresh, correct one.
2.  **Open the "New Token" Page:** [Click here to go to the page to create a new token](https://github.com/settings/tokens/new). (You may need to sign in).
3.  **Note:** Give your new token a descriptive name, like `firebase-final-deploy`.
4.  **Expiration:** For simplicity, you can set the expiration to **"No expiration"**.
5.  **Select Scopes (THE MOST IMPORTANT STEP):** You MUST check the box next to **`repo`**. This gives the token full control of repositories, which is required to push code. **If this is not checked, you will get an `Invalid username or token` error.**
6.  **Generate Token:** Scroll to the bottom and click the **"Generate token"** button.
7.  **COPY THE TOKEN:** GitHub will show you the token *only once*. It will look like `ghp_...`. **Copy this new token immediately** and save it somewhere safe, like a notepad, for the next steps.

## Step 2: Push Your Code Using the New Token

Now, run these commands one by one in your terminal. They have been updated to match your exact repository name.

### 2a: Initialize Git and Set Remote URL

This command ensures Git is initialized and is pointing to the correct repository URL.

```bash
git init && git remote remove origin && git remote add origin https://inkhan70@github.com/inkhan70/Business_web.git
```

### 2b: Add All Your Files

This command stages all the files in your project, preparing them to be committed.

```bash
git add .
```

### 2c: Commit Your Files

This command saves your staged files as a new version.

```bash
git commit -m "Final deployment push from Firebase Studio"
```
*(If you get a message saying "nothing to commit," that's okay. Proceed to the next step.)*

### 2d: Push Your Code to GitHub

This is the final, most important step. When you run this command, the terminal will prompt you for a **password**.

**IMPORTANT: When prompted for your password, DO NOT enter your GitHub password. Instead, paste the NEW Personal Access Token (PAT) you copied in Step 1.**

```bash
git push -u origin master --force
```

After you run this command and use your new PAT as the password, your code will be uploaded to GitHub, and your Firebase deployment will start automatically. This will work.
