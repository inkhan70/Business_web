# ConnectLocal: Your Local Business Connection

Welcome to ConnectLocal, a platform designed to connect local producers, wholesalers, distributors, and shopkeepers with their customers and each other. Our goal is to empower local commerce by providing businesses with the tools they need to establish an online presence and for customers to easily find and purchase local goods.

## Core Features

### For All Users & Customers

*   **Browse by Category**: Easily discover businesses and products by exploring a wide range of categories like Food, Electronics, Health, and more.
*   **Explore Business Roles**: Within each category, you can filter by business type—find **Producers**, **Wholesalers**, **Distributors**, or **Shopkeepers** to suit your needs.
*   **Powerful Search**: Use the unified search bar to find products, businesses, or even business types within a specific city. The advanced search allows you to filter by price, weight, volume (ml/liters), color, and more.
*   **Proximity-Based Listings**: When you allow location access, business listings are automatically sorted by distance, showing you the closest options first.
*   **Shopping Cart**: Add products to a persistent shopping cart as you browse. Your selections are saved in your browser for your convenience.
*   **Multi-Language Support**: The application is available in multiple languages, including English, Arabic, Farsi, and Urdu. You can switch languages at any time.
*   **Customizable Appearance**: As a logged-in user, you can personalize your experience by setting custom background wallpapers on different pages.

### For Registered Businesses

Any business, from a local farm to a corner store, can sign up for free to unlock a powerful set of tools to manage their online presence.

*   **Easy Sign-Up**: Create a business account in minutes by providing your business name, role (producer, wholesaler, etc.), primary category, and location.
*   **Business Dashboard**: Get a central hub to manage your products, view your business details, and access all your tools.
*   **Product Management**:
    *   Add and edit products with detailed descriptions, inventory counts, and status (Active, Archived, etc.).
    *   Create multiple **varieties** for a single product line (e.g., different sizes, colors, or flavors), each with its own name, price, and image.
*   **Image Management**:
    *   **Live Camera Capture**: Use your device's camera to take and upload product photos directly.
    *   **Shared Image Library**: Uploaded images are added to a library shared with other businesses in your category, making it easy to use high-quality, relevant images for your products.
*   **Profile Settings**: Easily update your business name and location information from your settings page.

### For Administrators

The application includes a simple admin panel for managing the platform itself.

*   **Admin Dashboard**: Get a high-level overview of application stats.
*   **Appearance Management**: Set and remove background wallpapers for any page in the application to customize the look and feel for all users.
*   **Language Management**: Add new custom languages to the application by providing a language code, name, and a JSON dictionary of translations. These new languages become instantly available to all users.

This application is built with a modern tech stack including **Next.js, React, TypeScript, and Tailwind CSS**, ensuring a fast, reliable, and user-friendly experience.

---

## Deployment with Firebase CLI

You can deploy this application directly from your local machine using the Firebase Command Line Interface (CLI).

### 1. Install the Firebase CLI

If you don't have it installed, open your terminal and run the following command. You only need to do this once.

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

In your terminal, run this command to log in to the Google account associated with your Firebase project.

```bash
firebase login
```

### 3. Initialize Firebase in Your Project

Navigate to your project's root directory in the terminal. If you haven't initialized Firebase for this project before, run:

```bash
firebase init hosting
```

Follow the on-screen prompts:
*   Select **Use an existing project** and choose your `connectlocal-vrglt` project from the list.
*   When asked "What do you want to use as your public directory?", just press **Enter** to accept the default. (The `apphosting.yaml` file correctly configures this).
*   When asked "Configure as a single-page app (rewrite all urls to /index.html)?", type **N** and press **Enter**.
*   When asked "Set up automatic builds and deploys with GitHub?", type **N** and press **Enter**.

This will create a `firebase.json` file configured for hosting.

### 4. Deploy Your App

Now you're ready to deploy. Simply run the following command in your project's root directory:

```bash
firebase deploy --only apphosting
```

The Firebase CLI will build your Next.js application and deploy it to App Hosting. This process may take a few minutes. Once it's complete, you will see a "Hosting URL" in the terminal where your live application is available.
