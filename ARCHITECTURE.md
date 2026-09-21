# SuratApp: Dokumen Niat & Arsitektur

## 1. Niat

SuratApp adalah aplikasi web untuk membuat surat resmi dari template yang sudah disiapkan.

Tujuan utamanya: staf bisa membuat surat dinas dalam hitungan menit, tanpa perlu mengerti format surat, tanpa perlu membuka Word, dan tanpa perlu bertanya sana-sini.

Cukup isi data, pilih penandatangan, lalu cetak.

## 2. Latar Belakang

Pembuatan surat resmi masih sering dilakukan secara manual: menyalin template lama, mengganti nama dan nomor satu per satu, lalu menyimpan arsip secara terpisah. Cara ini rawan salah format, salah nomor, dan salah penandatangan.

SuratApp menyediakan alat sederhana untuk:

- menyimpan template di satu tempat;
- memisahkan data dari format;
- menghasilkan surat jadi dengan cepat; dan
- menyimpan arsip otomatis.

## 3. Prinsip Desain

### 3.1 Isi surat bukan inputan

User tidak mengetik isi surat. User mengisi field. Isi surat adalah hasil render antara template dari sistem dan data dari user.

```text
TEMPLATE + DATA = ISI SURAT
(fixed)    (input)  (hasil)
```

### 3.2 Pembuat bukan penandatangan

- **Pembuat** adalah staf yang menginput surat. Data ini hanya untuk arsip dan tidak tercetak.
- **Penandatangan** adalah pejabat yang menandatangani surat. Data ini tercetak di surat.

Keduanya disimpan di tempat yang berbeda.

### 3.3 Satu login, satu dashboard

Tidak ada panel admin terpisah dan tidak ada layout berbeda berdasarkan role. Dashboard memiliki dua kategori tampilan:

- `Buat Surat`
- `Edit Isi Surat`

### 3.4 Snapshot selalu disimpan

Data penandatangan disimpan sebagai salinan saat surat dibuat, bukan sebagai referensi ke user. Surat lama tetap konsisten meskipun jabatan pejabat berubah.

### 3.5 Data terpisah dari kode

Template dan field disimpan di storage dan dapat diedit melalui UI tanpa mengubah kode.

### 3.6 Sederhana dulu

Mulai dari solusi paling sederhana yang dapat berjalan. Kompleksitas baru ditambahkan bila memang diperlukan.

## 4. Arsitektur

### 4.1 Tingkat tinggi

Fase 1 berjalan 100% sebagai static site. Browser menyimpan data di `localStorage`; backend baru ditambahkan bila kebutuhan multi-user muncul.

```text
BROWSER
  Dashboard
    ├── Buat Surat (wizard 4 langkah)
    └── Edit Isi Surat (kelola template)
  localStorage

  (fase berikutnya)
  Backend + Database
```

### 4.2 Komponen

- **UI layer:** wizard, preview dan cetak, arsip, editor template.
- **Logic layer:** render engine `{{placeholder}} -> data`, session wizard, validasi field.
- **Storage layer:** `templates`, `letters`, dan `dirut`.

### 4.3 Alur Buat Surat

1. **Data pembuat:** nama dan jabatan disimpan di session.
2. **Jenis surat:** user memilih `template_key`.
3. **Penandatangan:** user memilih dari daftar pejabat atau mengisi penandatangan manual (`An.`/`Plt.`).
4. **Biodata:** user mengisi field dari template; data disimpan sebagai JSON.
5. **Simpan:** arsip menyimpan pembuat, snapshot penandatangan, nomor surat, data, dan status.
6. **Preview dan cetak:** template dirender dengan data dan snapshot penandatangan, lalu dicetak melalui `window.print()`.

`created_by` hanya digunakan untuk arsip. `signer_*` dan `data` digunakan untuk isi surat.

### 4.4 Alur Edit Isi Surat

1. User membuka daftar template.
2. User menulis isi surat pada editor visual.
3. User memilih data dari tombol `Sisipkan data`; sistem membuat nama teknis dari label secara otomatis.
4. User mengatur jenis input dan status wajib untuk setiap data.
5. User memeriksa tampilan contoh lalu menyimpan perubahan ke storage.

Editor visual menyimpan HTML sederhana di balik layar. Token `{{field}}` tetap dipakai oleh mesin render, tetapi tidak perlu diketik atau dipahami oleh pengguna. Token dari template lama dikonversi menjadi chip saat template dibuka dan dikembalikan ke format internal saat disimpan.

## 5. Model Data

### `templates`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `key` | string | Unik, misalnya `konfirmasi_akta` |
| `nama` | string | Nama jenis surat |
| `template` | text | HTML dengan placeholder |
| `fields` | array | `{ name, label, type, required, options? }` |
| `updated_at` | timestamp | Waktu perubahan terakhir |

### `letters`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `id` | string | Misalnya `L001` |
| `template_key` | string | Referensi template |
| `created_at` | timestamp | Waktu pembuatan |
| `created_by` | string | Nama pembuat untuk arsip |
| `created_by_detail` | object | Jabatan pembuat |
| `signer_mode` | string | `selected` atau `manual` |
| `signer_id` | string | ID pejabat bila dipilih dari daftar |
| `signer_nama` | string | Snapshot nama penandatangan |
| `signer_jabatan` | string | Snapshot jabatan |
| `signer_nip` | string | Snapshot NIP |
| `nomor_surat` | string | Nomor surat |
| `data` | object | Data field yang akan dirender |
| `status` | string | `draft` atau `final` |

### `dirut`

```text
{ id, nama, jabatan, nip }
```

## 6. Halaman

| Halaman | Fungsi | Kategori |
| --- | --- | --- |
| `dashboard.html` | Menu utama | - |
| `index.html` | Data pembuat | Buat Surat |
| `jenis.html` | Pilih jenis surat | Buat Surat |
| `penandatangan.html` | Pilih penandatangan | Buat Surat |
| `form.html` | Isi biodata | Buat Surat |
| `preview.html` | Preview dan cetak | Buat Surat |
| `arsip.html` | Riwayat surat | Buat Surat |
| `template.html` | Daftar template | Edit Isi Surat |
| `edit.html` | Editor template | Edit Isi Surat |

## 7. Aturan yang Tidak Boleh Dilanggar

| Aturan | Konsekuensi |
| --- | --- |
| Isi surat adalah hasil render | Form pembuatan tidak boleh mengedit isi template langsung |
| Pembuat berbeda dari penandatangan | `created_by` tidak boleh muncul di template PDF |
| Snapshot selalu disimpan | `signer_*` disimpan sebagai teks, bukan hanya referensi |
| Data terpisah dari kode | Template berada di storage, bukan hardcode |
| Satu dashboard, dua kategori | Tidak ada layout admin terpisah |

Pelanggaran terhadap salah satu aturan ini dianggap bug.

## 8. Keputusan Teknis

| Aspek | Fase 1 | Fase 2 |
| --- | --- | --- |
| Hosting | GitHub Pages | Vercel atau VPS |
| Data | `localStorage` | PostgreSQL |
| Auth | Tidak ada | Login dan session |
| Multi-user | Tidak | Ya |
| PDF | `window.print()` | Puppeteer server-side |
| Template | JSON di `localStorage` | Tabel database |
| Biaya | Rp 0 | Tergantung kebutuhan |

Fokus Fase 1 adalah bisa berjalan, dipakai, dan diuji.

## 9. Ruang Lingkup Fase 1

### Ada

- wizard empat langkah;
- preview surat format A4;
- cetak melalui browser atau Save as PDF;
- arsip otomatis;
- editor template dan field;
- pemisahan pembuat dan penandatangan; dan
- split-screen UI yang responsif.

### Tidak ada

Login, autentikasi, role atau permission, backend, database, sinkronisasi multi-user, audit log, notifikasi, tanda tangan digital, dan integrasi email.

## 10. Roadmap

### Fase 1: Jalan

UI wizard, preview dan cetak, arsip, editor template, `localStorage`, dan deploy GitHub Pages.

### Fase 2: Backend

API Express atau Next.js, PostgreSQL, login dan session, serta migrasi `localStorage` ke database.

### Fase 3: Produksi

PDF server-side dengan Puppeteer, tanda tangan digital, audit log, notifikasi, dan backup otomatis.

## 11. Definisi Sukses

Fase 1 berhasil bila:

1. Staf dapat membuat dan mencetak satu surat dari nol dalam kurang dari tiga menit.
2. Tidak ada salah format atau salah penandatangan.
3. Surat otomatis terarsip.
4. Editor dapat menambah jenis surat tanpa mengubah kode.
5. Aplikasi berjalan dari HP maupun laptop tanpa instalasi.

## 12. Prinsip Perubahan

Dokumen ini menjadi acuan proyek. Setiap fitur baru harus diperiksa terhadap lima aturan pada bagian 7 terlebih dahulu. Bila melanggar, fitur tidak ditambahkan tanpa perubahan arsitektur yang disepakati.