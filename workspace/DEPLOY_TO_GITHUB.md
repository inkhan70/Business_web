
# How to Deploy Your App via GitHub

Your Firebase App Hosting is connected to a GitHub repository for automatic deployments. When you push your source code to the `master` (or `main`) branch on GitHub, Firebase will automatically build and deploy your application.

Follow these steps to push your current code from this workspace to your GitHub repository.

## Step-by-Step Instructions

Run these commands one by one in your terminal.

### Step 1: Initialize Git and Connect to Your Repository

First, we need to make sure your local workspace is a Git repository and is connected to your remote GitHub repository.

```bash
git init && git remote add origin https://github.com/inkhan70/Business_web.git
```
*(If you get an error saying `remote origin already exists`, that's okay! It just means it's already connected, and you can proceed to the next step.)*

### Step 2: Add All Your Files

This command stages all the files in your project, preparing them to be committed.

```bash
git add .
```

### Step 3: Commit Your Files

This command saves your staged files as a new version in your local Git history.

```bash
git commit -m "Deploy latest version from Firebase Studio"
```

### Step 4: Push Your Code to GitHub

This is the final step. This command uploads your committed code to your GitHub repository. **This is the action that will trigger your Firebase deployment.**

Because your local branch might be `master` and your remote might be `main` (or vice-versa), and you might not have pulled the remote changes first, we will use a command that forces the push. This will overwrite the contents of your GitHub repository with the complete, correct code from your workspace.

**Use this command to push your code:**

```bash
git push -u origin master --force
```

After you run this command, you can go to your Firebase Console, and you should see a new build and deployment in progress in the App Hosting section.
