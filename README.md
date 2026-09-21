# SuratApp

Aplikasi web sederhana untuk membuat surat resmi dari template yang sudah disiapkan.

## Tujuan

Staf cukup mengisi data, memilih penandatangan, lalu mencetak surat. Isi surat selalu dihasilkan dari kombinasi template dan data, sehingga format tetap konsisten dan surat otomatis dapat diarsipkan.

## Fase 1

- Static site yang dapat berjalan di GitHub Pages
- Wizard pembuatan surat empat langkah
- Preview surat A4 dan cetak melalui `window.print()`
- Arsip surat di `localStorage`
- Editor visual template dan field tanpa mengubah kode
- Satu dashboard dengan kategori `Buat Surat` dan `Edit Isi Surat`

## Struktur halaman

| Halaman | Fungsi |
| --- | --- |
| `client/dashboard.html` | Menu utama |
| `client/index.html` | Data pembuat |
| `client/jenis.html` | Pilih jenis surat |
| `client/penandatangan.html` | Pilih penandatangan |
| `client/form.html` | Isi biodata |
| `client/preview.html` | Preview dan cetak |
| `client/arsip.html` | Riwayat surat |
| `client/template.html` | Daftar template |
| `client/edit.html` | Editor template |

## Prinsip yang wajib dijaga

1. Isi surat adalah hasil gabungan format template dan data, bukan input teks bebas.
2. Pembuat surat berbeda dari penandatangan.
3. Data penandatangan disimpan sebagai snapshot saat surat dibuat.
4. Template dan field disimpan di storage, bukan di-hardcode di halaman.
5. Semua pengguna memakai satu dashboard; perbedaan hanya pada kategori tampilan.
6. Pengelola template menulis isi surat seperti biasa dan menyisipkan data melalui tombol. Nama teknis field dibuat otomatis oleh sistem.

Detail arsitektur, model data, alur, dan roadmap tersedia di [ARCHITECTURE.md](ARCHITECTURE.md). Perubahan proyek dicatat di [CHANGELOG.md](CHANGELOG.md).