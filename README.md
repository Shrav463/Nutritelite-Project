NutriLite – Smart Calorie & Nutrition Tracking App

NutriLite is a full-stack calorie and nutrition tracking web application powered by real USDA food data.
It helps users track daily meals, calories, macros, water intake, and activity, while providing insights through analytics and history views.

Built with a modern React + Node.js architecture, NutriLite demonstrates real-world skills in frontend engineering, API integration, backend security, and data handling.

🚀 Live Demo

Frontend (Netlify): https://nutritelite-app.netlify.app

Backend (Render): https://nutritelite-backend.onrender.com/health

📌 Key Features
🔍 USDA Food Search (Real Data)

Search foods using the USDA FoodData Central API

Supports Foundation, Branded, and Survey food types

Secure API key handling via backend proxy

🍽️ Daily Meal Logging

Log foods by meal (Breakfast, Lunch, Dinner, Snack)

Portion-based nutrition calculation (grams → calories/macros)

Prevents duplicate entries on save

📊 Nutrition Analytics

Daily calorie goal tracking 
Macro tracking (Protein, Carbs, Fat)
Water intake and step-based calorie burn estimation

🗂️ History & Insights

View saved days with full meal breakdown

7-day calorie trend visualization

Filter history by date range, meal type, or food name

Export history as JSON

💾 Local Persistence

Uses browser localStorage to persist data

Draft saving ensures no accidental data loss

Safe merge logic prevents overwriting past entries

🤖 Smart Nutrition Assistant

Offline Q&A assistant for calorie and diet guidance

(Optional) OpenAI-powered chat supported via backend

🧠 Tech Stack
Frontend

React (Vite) – Fast modern frontend tooling

JavaScript (ES6+)

Tailwind CSS – Responsive UI & clean design

React Router – Client-side routing

Vite Dev Server & Build Pipeline

Backend

Node.js

Express.js

CORS-secured API

Environment-based configuration (dotenv)

APIs & Integrations

USDA FoodData Central API (real nutrition data)

OpenAI API (optional AI assistant)

Deployment

Netlify – Frontend hosting

Render – Backend API hosting

🏗️ Architecture Overview
Frontend (React + Vite)
   |
   |  /api/usda/*
   v
Backend (Node + Express)
   |
   v
USDA FoodData Central API


✔ API keys never exposed to frontend
✔ CORS protected
✔ Timeout-safe API calls
✔ Production & local environments supported

⚙️ Environment Variables
Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:5000

Backend (.env)
PORT=5000
USDA_API_KEY=your_usda_api_key
OPENAI_API_KEY=your_openai_key   # optional
OPENAI_MODEL=gpt-4o-mini         # optional

▶️ Running Locally
1️⃣ Clone the repository
git clone https://github.com/your-username/NutriLite-Project.git
cd NutriLite-Project

2️⃣ Start Backend
cd backend
npm install
node index.js


Backend runs at:

http://localhost:5000

3️⃣ Start Frontend
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

🧪 Production Build & Preview
npm run build
npm run preview


Preview runs at:

http://localhost:4173

🔐 Security & Best Practices

API keys stored securely on backend

CORS restricted to known origins

Request timeouts prevent hanging calls

Safe JSON parsing prevents runtime crashes

Clean separation of frontend & backend responsibilities
