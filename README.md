# Anime Genre Predictor

Aplikasi web untuk memprediksi genre anime dari gambar menggunakan machine learning.

## 📝 Deskripsi

Proyek ini adalah aplikasi prediksi genre anime yang dibangun dengan React + TypeScript + Vite. Model machine learning dilatih menggunakan [Teachable Machine](https://teachablemachine.withgoogle.com/) dari Google untuk mengklasifikasikan gambar anime ke dalam berbagai genre.

## 🎯 Fitur

- Upload gambar anime
- Prediksi genre secara real-time
- Interface modern dan responsif
- Built dengan React, TypeScript, dan TensorFlow.js

## 📊 Data Training

Data gambar untuk training model diperoleh melalui web scraping menggunakan Python dengan mengakses API [Jikan.moe](https://jikan.moe/) (MyAnimeList API). Scraper tersebut berada di repository terpisah.

## 🚀 Teknologi

- **Frontend**: React + TypeScript + Vite
- **ML Model**: Teachable Machine (TensorFlow.js)
- **UI**: Custom components dengan Tailwind CSS
- **Data Source**: Jikan.moe API

## 💻 Instalasi

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build
```

## 📁 Struktur Project

- `/src/components` - Komponen React
- `/src/services` - Service untuk prediksi model
- `/src/hooks` - Custom React hooks
- `/public/models` - Model TensorFlow.js

## 🔗 Links

- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Jikan.moe API](https://jikan.moe/)
