# Panduan Deployment JudolGuard 🛡️

Dokumen ini berisi panduan lengkap untuk melakukan deployment **JudolGuard** ke server cloud (Production) agar sistem bisa diakses secara online oleh siapa saja.

---

## 🚀 Ringkasan Arsitektur Deployment
*   **Frontend (React/Vite):** Dideploy ke **Vercel** (Gratis, cepat, handal).
*   **Backend (FastAPI Python):** Dideploy ke **Render.com** atau **Railway.app** (Mendukung running server untuk model Machine Learning).

---

## Bagian 1: Deploy Backend (FastAPI) ke Render.com

Render adalah pilihan termudah dan gratis untuk menghosting server Python FastAPI.

### Langkah-langkah:
1.  **Daftar/Masuk ke Render:**
    Buka [Render.com](https://render.com) dan login menggunakan akun GitHub Anda.
2.  **Buat Web Service Baru:**
    *   Klik button **New +** di dashboard Render, lalu pilih **Web Service**.
    *   Pilih repositori GitHub `JudolGuard` Anda.
3.  **Konfigurasi Settings:**
    *   **Name:** `judolguard-api` (atau bebas).
    *   **Region:** Pilih yang terdekat (misal: *Singapore* atau *Oregon*).
    *   **Branch:** `main` (atau branch tempat code Anda berada).
    *   **Root Directory:** `.` (kosongkan saja agar mengarah ke root).
    *   **Runtime:** `Python 3`.
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn main_api:app --host 0.0.0.0 --port $PORT`
4.  **Konfigurasi Environment Variables (PENTING!):**
    Klik tab **Advanced** -> **Environment Variables**, masukkan key-value berikut agar fitur AI Assistant tetap aktif:
    *   `AZURE_KEY` = `4ji4iP9qKL06gR2Z3lSEuSE8jm7KOqFRgu7vlHtEdJrHUwCfOXtsJQQJ99CDACNns7RXJ3w3AAABACOGPn3O`
    *   `AZURE_ENDPOINT` = `https://projekjudol.openai.azure.com/`
    *   `AZURE_DEPLOY` = `gpt-4o`
5.  **Deploy:**
    Klik **Create Web Service**. Tunggu beberapa menit hingga status menjadi **Live**.
6.  **Salin URL Backend:**
    Render akan memberikan URL unik seperti `https://judolguard-api.onrender.com`. Salin URL ini!

---

## Bagian 2: Deploy Frontend (React/Vite) ke Vercel

### Langkah-langkah:
1.  **Masuk ke Vercel:**
    Buka [Vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2.  **Import Project:**
    *   Klik **Add New** -> **Project**.
    *   Pilih repositori GitHub `JudolGuard` Anda.
3.  **Konfigurasi Settings:**
    *   **Framework Preset:** Pilih `Vite` (biasanya terdeteksi otomatis).
    *   **Root Directory:** Klik *Edit* dan pilih folder **`frontend`** (sangat penting karena source React Anda berada di dalam folder `/frontend`).
4.  **Konfigurasi Environment Variables (PENTING!):**
    Di bagian **Environment Variables**, tambahkan variabel berikut agar frontend tahu lokasi server backend Anda:
    *   **Name:** `VITE_API_URL`
    *   **Value:** `https://judolguard-api.onrender.com` *(Ganti dengan URL backend Render Anda yang diperoleh dari Bagian 1)*
5.  **Deploy:**
    Klik **Deploy**. Vercel akan mem-build aplikasi Anda dan memberikan link live (misalnya `https://judolguard.vercel.app`).

---

## 🔄 Cara Update Kode Setelah Deploy
Karena repositori sudah terhubung secara otomatis ke Render dan Vercel:
*   Setiap kali Anda melakukan `git push` ke repositori GitHub Anda, Render dan Vercel akan **otomatis melakukan build ulang** (Auto-Deployment) untuk menerapkan perubahan terbaru Anda!
