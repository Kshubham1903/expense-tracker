# Expense Ledger

A mobile-first personal expense tracker built with React, Vite, Tailwind CSS, and Firebase.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Firebase web app values.
3. Install dependencies.
4. Run `npm run dev`.

## Firebase

- Authentication: email/password
- Database: Cloud Firestore
- Hosting: Firebase Hosting

Firestore data is stored under `users/{uid}/expenses/{expenseId}` so each user only reads and writes their own records.

## Deploy

1. Run `npm run build`.
2. Deploy the `dist` folder with Firebase Hosting.
3. Apply `firestore.rules` in your Firebase project.
