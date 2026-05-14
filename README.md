# Nine Holes ⚫⚪

Sebuah game strategi *multiplayer real-time* yang dibangun sebagai aplikasi multiplatform — dapat dimainkan di **Web** dan **Android**, didukung oleh satu *backend* yang sama.

> **Nine Holes** adalah permainan papan klasik dua pemain yang dimainkan pada petak 3×3. Setiap pemain memiliki 3 bola dengan warna masing-masing. Pertama, pemain bergiliran menempatkan bola mereka di papan. Setelah keenam bola ditempatkan, pemain bergantian memindahkan bola mereka ke sel yang kosong. Pemain pertama yang berhasil menyusun 3 bola dalam satu **baris atau kolom** (tidak berlaku diagonal) memenangkan ronde tersebut.

---

## Fitur Utama

- 🎮 **Gameplay Real-time** — via WebSocket (Socket.io).
- 👥 **Multiplayer** — undang pemain lain dan mainkan secara langsung.
- 🏆 **Papan Peringkat Global** — peringkat publik berdasarkan sesi yang dimenangkan.
- 👤 **Profil Pengguna** — daftar, masuk, dan pantau statistik Anda.
- 📩 **Sistem Undangan** — kirim dan terima undangan permainan secara *real-time*.
- 🔔 **Notifikasi Push** — dapatkan pemberitahuan saat menerima undangan (Web & Android).
- 📦 **Dukungan PWA** — dapat diinstal sebagai aplikasi mandiri dari browser.
- ⚡ **Sistem Sesi** — 5 ronde per sesi; menangkan 3 atau lebih untuk memenangkan sesi.

---

## Aturan Permainan

### Aturan
1. **Fase Penempatan** — Pemain bergantian menempatkan 3 bola mereka di sel kosong mana pun.
2. **Fase Bermain** — Pemain bergantian memindahkan salah satu bola mereka ke sel kosong mana pun.
3. **Kondisi Menang** — Susun 3 bola dalam satu **baris atau kolom** (diagonal tidak dihitung).
4. Sebuah **sesi** terdiri dari 5 ronde. Menangkan **≥ 3 ronde** untuk memenangkan sesi.

### Tata Letak Papan
```
[0] [1] [2]
[3] [4] [5]
[6] [7] [8]
```
---

## Teknologi yang Digunakan

### Backend
| Teknologi | Kegunaan |
|------------|---------|
| Node.js + Express | Server REST API |
| Socket.io | Komunikasi WebSocket real-time |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Token (JWT) | Otentikasi |
| bcryptjs | Hashing kata sandi |

### Frontend Web
| Teknologi | Kegunaan |
|------------|---------|
| React 18 + Vite | UI framework & build tool |
| React Router v6 | Routing sisi klien |
| Zustand | Manajemen state klien |
| Socket.io Client | Koneksi real-time |
| Axios | Klien HTTP REST |
| Tailwind CSS | Styling |
| vite-plugin-pwa | PWA & dukungan offline |

### Android
| Technology | Purpose |
|------------|---------|
| *(Android platform)* | Native Android client |
| Firebase Cloud Messaging | Push notifications |

---

## Project Structure

```
nine-holes/
├── nine-holes-backend/          # Backend bersama untuk semua klien
│   ├── src/
│   │   ├── controllers/         # Pengelola permintaan (request handlers)
│   │   ├── middleware/          # Auth, validasi, penanganan error
│   │   ├── models/              # Skema Mongoose
│   │   │   ├── User.js
│   │   │   ├── GameSession.js
│   │   │   ├── Leaderboard.js
│   │   │   └── Notification.js
│   │   ├── routes/              # Definisi rute API
│   │   ├── socket/              # Pengelola event Socket.io
│   │   │   ├── gameSocket.js    # Event game (tempatkan, pindah, menang)
│   │   │   ├── notificationSocket.js  # Sistem undangan
│   │   │   └── handlers.js     # Middleware auth & registrasi
│   │   └── utils/              # Pembantu, validator, kelas error
│   └── server.js               # Titik masuk utama (entry point)
│
├── nine-holes-frontend-web/     # Klien Web (PWA)
│   └── src/
│       ├── components/          # Komponen UI yang dapat digunakan kembali
│       ├── pages/               # Komponen halaman tingkat rute
│       ├── hooks/               # React hooks kustom
│       ├── store/               # Penyimpanan state Zustand
│       ├── services/            # Layanan API, socket, dan penyimpanan
│       └── utils/               # Konstanta & fungsi pembantu
│
└── nine-holes-android/          # Klien Android
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Ambil data pengguna saat ini |

### Game
| Method | Endpoint | Deskripsi |
|--------|----------|-------------|
| POST | `/api/games/start` | Mulai sesi baru |
| GET | `/api/games/active` | Ambil sesi yang sedang aktif |
| GET | `/api/games/:sessionId` | Ambil sesi berdasarkan ID |
| GET | `/api/games/user/:userId/sessions` | Riwayat sesi pengguna |
| GET | `/api/games/user/:userId/stats` | Statistik pengguna |

### Leaderboard
| Metode | Endpoint | Deskripsi |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Ambil papan peringkat lengkap (publik) |
| GET | `/api/leaderboard/top10` | Ambil 10 pemain terbaik |
| GET | `/api/leaderboard/user/:userId` | Ambil peringkat pengguna |

### Notifikasi
| Metode | Endpoint | Deskripsi |
|--------|----------|-------------|
| GET | `/api/notifications/:userId` | Ambil notifikasi yang belum dibaca |
| POST | `/api/notifications/:userId/read/:notifId` | Tandai sebagai sudah dibaca |
| DELETE | `/api/notifications/:notifId` | Hapus notifikasi |

---

## Event WebSocket

### Event Permainan
| Event | Arah | Deskripsi |
|-------|-----------|-------------|
| `join_game` | Klien → Server | Masuk ke ruang permainan |
| `place_ball` | Klien → Server | Tempatkan bola selama fase penempatan |
| `move_ball` | Klien → Server | Pindahkan bola selama fase bermain |
| `ball_placed` | Server → Klien | Siaran penempatan bola |
| `ball_moved` | Server → Klien | Siaran perpindahan bola |
| `game_won` | Server → Klien | Ronde telah dimenangkan |
| `game_started` | Server → Klien | Ronde berikutnya dimulai |
| `session_ended` | Server → Klien | Sesi selesai |

### Event Invite
| Event | Arah | Deskripsi |
|-------|-----------|-------------|
| `send_invite` | Klien → Server | Kirim undangan permainan |
| `invite_received` | Server → Klien | Notifikasi undangan real-time |
| `accept_invite` | Klien → Server | Terima undangan |
| `decline_invite` | Klien → Server | Tolak undangan |
| `game_ready` | Server → Klien | Sesi dibuat, kedua pemain diminta bergabung |

---

## Instalasi

### Prerequisites
- Node.js >= 18
- MongoDB (local atau Atlas)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/nine-holes.git
cd nine-holes
```

### 2. Setup Backend

```bash
cd nine-holes-backend
npm install
```

Buat `.env`
```bash
cp .env.example .env
```

Isi `.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nine-holes
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173
```

Mulai backend:
```bash
npm run dev
```

Backend akan jalan di `http://localhost:3001`

### 3. Pengaturan Frontend Web

```bash
cd nine-holes-frontend-web
npm install

```

Inisialisasi Tailwind:

```bash
npx tailwindcss init -p

```

Buat file `.env.local`:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

```

Jalankan frontend:

```bash
npm run dev

```

Frontend akan berjalan di `http://localhost:5173`

### 4. Menjalankan Keduanya

Buka dua terminal:

```bash
# Terminal 1 — Backend
cd nine-holes-backend && npm run dev

# Terminal 2 — Frontend
cd nine-holes-frontend-web && npm run dev

```

---

## Menguji Permainan Secara Lokal

1. Buka dua tab browser di alamat `http://localhost:5173`.
2. Daftarkan dua akun yang berbeda (satu akun untuk setiap tab).
3. Dari Tab 1 (Pemain A): buka Dashboard → **Invite Player** → masukkan ID pengguna Pemain B.
4. Dari Tab 2 (Pemain B): cek Notifikasi → **Accept** (terima) undangan tersebut.
5. Kedua pemain akan menerima perintah untuk masuk ke ruang permainan → klik **OK**.
6. Mainkan 5 ronde — pemain yang memenangkan 3 ronde atau lebih akan memenangkan sesi tersebut.

---

## Database Schema

### Users
```
username, email, password (hashed), avatar, created_at
```

### GameSession
```
player1_id, player2_id, games[], games_played,
player1_games_won, player2_games_won,
session_winner_id, status, created_at
```

### Leaderboard
```
user_id, username, total_sessions_won,
total_sessions_played, win_rate, last_updated
```

### Notifications
```
from_user_id, to_user_id, type, game_session_id,
message, read, created_at
```
