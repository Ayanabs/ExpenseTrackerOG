# 📱 Spendless – Intelligent Expense Tracker App

Spendless is an AI-powered mobile application that simplifies personal expense tracking through automation. Designed using **React Native**, **Python**, **Java**, and **Firebase**, it allows users to manage budgets, track receipts, and analyze spending—all without manual data entry.

---

## 🚀 Features

- 📸 **Receipt Scanning** – Uses OCR (Tesseract + Groq AI LLaMA) to extract total, date, and category from physical receipts.
- 💬 **SMS Parsing** – Foreground Java service extracts transactions from bank and service provider messages in real-time.
- 💰 **Budgeting Tools** – Set daily, weekly, or monthly spending limits with real-time countdowns and alerts.
- 📅 **Calendar & Dashboard** – View, filter, and analyze your expenses with date-wise summaries and visual analytics.
- 🔐 **Secure Authentication** – Firebase Authentication ensures secure login and data isolation.
- ☁️ **Cloud Sync** – Real-time updates across devices using Firebase Firestore.

---

## 📲 Download APK

Click below to download and install the latest version of the Spendless app:

👉 [**Download APK**](https://github.com/Ayanabs/ExpenseTrackerOG/releases/latest/download/Spendless.apk)

> Note: Make sure to enable "Install from unknown sources" on your Android device.

---

## 🧠 Tech Stack

| Layer        | Technologies Used |
|--------------|-------------------|
| Frontend     | React Native, TypeScript |
| Backend      | Python (FastAPI), Java (SMS Parsing) |
| OCR & NLP    | Tesseract OCR, Groq AI with LLaMA |
| Database     | Firebase Firestore |
| Auth         | Firebase Authentication |
| Testing      | Jest, Manual Testing |
| Deployment   | Railway (Python API), Firebase Hosting |

---

## 🛠️ Installation (For Developers)

1. **Clone the repo**
   ```bash
   git clone https://github.com/Ayanabs/ExpenseTrackerOG.git
   cd ExpenseTrackerOG
