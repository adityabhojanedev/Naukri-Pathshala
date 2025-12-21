# Naukri Pathshala Contest Platform 

A robust, multilingual contest platform built with Next.js 14 and MongoDB, designed for secure and engaging online examinations.

## 🚀 Features

### 1. User Experience
-   **Live Contests**: Assessment interface with secure server-side timer and auto-submit functionality.
-   **Multilingual Support**: Dynamic language toggling (English, Hindi, Marathi) for all questions and options.
-   **Leaderboards**: Real-time ranking based on Score (descending) and Time Taken (ascending).
-   **Profile & Analytics**: Track "My Contests", view detailed results, and analyze performance (Correct/Wrong/Skipped).

### 2. Integrity & Proctoring
-   **Secure Timer**: Time is tracked on the server to prevent client-side manipulation.
-   **Re-join Penalty**: Users re-joining a contest are capped at **40% of the duration** to discourage cheating.
-   **Activity Warnings**: The system tracks and logs suspicious behavior (e.g., "Tab Switch") which is displayed on the leaderboard.
-   **Absentee Tracking**: Users who join but don't submit are flagged as "Absent".

### 3. Admin Capabilities
-   **Contest Management**: Create and schedule contests with ease.
-   **Question Bank**: Manage multilingual questions with support for text and options.
-   **Monitoring**: View live leaderboards, inspect warning logs, and manually penalize or remove invalid entries.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
-   **Backend**: Next.js Server Actions / API Routes
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: JWT-based secure auth

## 📂 Project Flow

1.  **Authentication**: Users sign up/login -> Verified via Mobile.
2.  **Discovery**: Browse "Live" and "Upcoming" contests on the landing page.
3.  **Participation**:
    *   **Join**: Validates eligibility (Login + Verification).
    *   **Take Quiz**: Secure interface with prevent-back navigation and proactive warnings.
    *   **Submit**: Instant scoring and result generation.
4.  **Results**: Immediate feedback on performance and leaderboard placement.

## 📦 Database Models

-   **User**: Profile, Auth, Verification Status.
-   **Contest**: Configuration (Duration, Start/End), Questions Ref.
-   **Question**: Multilingual Content (Map structure).
-   **Result**: User Attempt, Score, Time, Logged Warnings.

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:-

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📝 Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

