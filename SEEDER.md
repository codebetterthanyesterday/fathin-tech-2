# Prompt untuk AI Coding Agent — Dummy Seeder untuk Preview Tampilan Penuh

## KONTEKS PROYEK

Saya sedang membangun **Portfolio CMS Builder**, aplikasi web personal berbasis **Next.js (App Router)** untuk mengelola situs portofolio karir IT saya sendiri. Stack yang dipakai:

- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma

**Status saat ini:** seluruh sisi admin sudah dibangun (`/admin/profile`, `/admin/skills`, `/admin/projects`, `/admin/experience`, dengan shared layout sidebar+header), dan halaman publik `/` (PBI-007) juga sudah dibangun. Database saat ini **kosong/minim data**, sehingga saya belum bisa melihat bagaimana tampilan halaman publik maupun admin terlihat ketika benar-benar terisi konten lengkap.

**Tujuan tugas ini murni untuk keperluan development/preview** — bukan bagian dari acceptance criteria produk manapun di backlog. Hasilnya akan saya pakai untuk mengevaluasi desain (apakah tema "seamless, premium, misterius hitam-putih dengan interaksi fun" benar-benar tampil baik saat data penuh), bukan untuk data production.

**Model yang perlu diisi** (dari `schema.prisma`):
- `Profile` (baris tunggal)
- `Skill` (banyak baris, kategori: LANGUAGE, FRAMEWORK, TOOL, SOFT_SKILL, OTHER)
- `Project` + `ProjectImage` (relasi one-to-many)
- `Experience` (type: WORK, EDUCATION)
- `Testimonial` (opsional, model sudah ada di skema untuk Epic 2 nanti — boleh ikut di-seed sekalian jika tidak menambah kompleksitas berarti)
- `Article` (opsional, sama seperti Testimonial)

---

## TUGAS: Buat Prisma Seed Script untuk Data Dummy yang Realistis

**Tujuan:** membuat script seeding (`prisma/seed.ts`) yang mengisi database dengan data dummy yang **realistis dan representatif**, sehingga saat halaman dibuka, hasilnya terlihat seperti portofolio developer IT sungguhan yang sudah matang — bukan data placeholder generik seperti "Lorem ipsum" atau "Project 1, Project 2, Project 3".

**Ketentuan data dummy:**

1. **Profile**: satu profil developer IT fiktif yang masuk akal — nama, tagline yang catchy (bukan generik seperti "Software Engineer"), bio 2-3 paragraf yang natural, social links (github/linkedin dummy tapi formatnya valid), gunakan URL foto placeholder yang proporsinya wajar untuk foto profil (mis. dari layanan placeholder image yang mendukung ukuran custom).

2. **Skill**: minimal 15-20 skill tersebar di seluruh kategori (Language, Framework, Tool, Soft Skill, Other), dengan level bervariasi (1-5) — mencerminkan profil developer full-stack/IT yang masuk akal, bukan asal generate nama teknologi acak.

3. **Project**: minimal 6-8 proyek dengan variasi:
   - Judul dan summary yang deskriptif dan spesifik (bukan "My Project X")
   - Description yang cukup panjang untuk menguji layout (2-4 paragraf)
   - techStack bervariasi antar proyek (3-6 item masing-masing)
   - Minimal 2-3 proyek ditandai `isFeatured: true` (untuk menguji tampilan featured di PBI-007)
   - Setiap proyek punya 2-4 `ProjectImage` dengan URL placeholder image yang proporsinya wajar untuk screenshot proyek (landscape, bukan square)
   - Beberapa proyek punya `demoUrl`/`repoUrl` terisi, beberapa sengaja dikosongkan (untuk menguji conditional rendering link tersebut)

4. **Experience**: minimal 4-6 entri campuran WORK dan EDUCATION, dengan rentang tanggal yang masuk akal secara kronologis (tidak tumpang tindih aneh), **pastikan minimal satu entri WORK punya `endDate: null`** (untuk menguji tampilan "Sekarang" yang sudah dibangun di PBI-006).

5. **Testimonial** (jika di-seed): 3-4 testimoni dengan nama dan kutipan yang natural.

6. **Article** (jika di-seed): 2-3 artikel dummy dengan `isPublished: true`, konten markdown singkat yang valid.

**Penting — kualitas data placeholder image:**
- Gunakan layanan placeholder image yang stabil dan bisa diatur dimensinya (mis. `https://picsum.photos/{width}/{height}` atau setara) — jangan pakai URL gambar acak dari internet yang berisiko broken link atau melanggar hak cipta.
- Pastikan rasio dimensi sesuai konteks (foto profil persegi/potret, gambar proyek landscape/wide).

---

## KETENTUAN TEKNIS SCRIPT

1. Script harus **idempotent atau aman dijalankan berulang** — jelaskan pendekatanmu (mis. `deleteMany` semua tabel dulu sebelum insert ulang — karena ini hanya untuk data dummy development, boleh destruktif — TAPI beri komentar peringatan tegas di bagian atas file bahwa script ini **tidak boleh dijalankan di database production** yang sudah berisi data asli).
2. Gunakan Prisma Client langsung (`prisma/seed.ts`), konfigurasikan agar bisa dijalankan lewat `npx prisma db seed` (sertakan konfigurasi `package.json` yang diperlukan jika belum ada).
3. Susun data dalam bentuk array/objek yang mudah dibaca dan diedit manual nanti (bukan digenerate acak via faker tanpa kurasi) — karena tujuannya saya lihat dan evaluasi secara visual, kurasi kualitas konten dummy lebih penting daripada kuantitas/keacakan.
4. Tangani relasi dengan benar (mis. buat `Project` dulu baru `ProjectImage` dengan `projectId` yang sesuai, gunakan `create` dengan nested write jika lebih rapi).
5. Tambahkan `console.log` ringkas di akhir script yang merangkum apa saja yang berhasil di-seed (jumlah skill, project, dst.) sebagai konfirmasi visual di terminal.

---

## OUTPUT YANG DIHARAPKAN

1. File `prisma/seed.ts` lengkap dengan seluruh data dummy yang dikurasi sesuai ketentuan di atas.
2. Konfigurasi tambahan yang diperlukan (mis. entry `prisma.seed` di `package.json`, dependency `ts-node` jika belum ada).
3. Instruksi singkat cara menjalankannya dan cara mengosongkan kembali data dummy ini nanti jika saya ingin mulai bersih sebelum mengisi data asli.

Jangan modifikasi `schema.prisma` — script ini hanya boleh mengisi data sesuai skema yang sudah ada.