# Connecting Replit to GitHub

## Steps to Connect Your Project

### 1. Create a GitHub Repository
First, create a new repository on GitHub without initializing it with any files:
1. Go to https://github.com/new
2. Name your repository (e.g., "readily" or "library-nest")
3. Set visibility (public or private)
4. Click "Create repository"

### 2. Connect Your Local Repository to GitHub

After creating your repository on GitHub, you'll see instructions to connect your existing repository.

Run the following command in the Replit Shell, replacing the URL with your actual repository URL:
```bash
git remote add origin https://github.com/yourusername/your-repository-name.git
```

### 3. Authenticate with GitHub

#### Option 1: Using HTTPS with Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with the following permissions:
   - repo (Full control of private repositories)
   - workflow (optional, if you'll use GitHub Actions)
3. Copy your token
4. When pushing to GitHub for the first time, enter your GitHub username and use the token as your password

#### Option 2: Using SSH Keys (Advanced)
If you prefer SSH authentication:
1. Generate an SSH key in Replit
2. Add the public key to your GitHub account
3. Use the SSH URL for your repository

### 4. Push Your Code to GitHub

After setting up authentication, push your code:
```bash
git push -u origin main
```

### 5. Verify the Connection

After pushing, visit your GitHub repository to confirm your code is there.

## Common Issues and Solutions

### Authentication Failed
If you see "Authentication failed":
- Make sure you're using the correct GitHub username
- If using a personal access token, ensure it has the correct permissions
- Try generating a new token

### Permission Denied
If you see "Permission denied":
- Verify that you have write access to the repository
- Check if your token/credentials are valid

### Branch Name Issues
If your default branch is not "main":
```bash
# Check your current branch name
git branch
# Push to the correct branch name
git push -u origin your-branch-name
```

## Maintaining the GitHub Connection

After initial setup, you can use these commands for regular workflow:

```bash
# Pull latest changes from GitHub
git pull origin main

# Stage your changes
git add .

# Commit changes
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main
```