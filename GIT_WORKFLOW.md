# Git workflow - BagSense FYP1

Repo: `https://github.com/adamnaemman/fyp` (private)
Default branch: `main`

---

## 1. Setiap orang, sekali sahaja

Amru (atau sesiapa yang di-invite):

```bash
git clone https://github.com/adamnaemman/fyp.git
cd fyp
git config user.name  "Amru Hazem"
git config user.email "amruhazim@gmail.com"
```

Kalau tak nak guna terminal, guna GitHub Desktop: File > Clone repository > pilih `adamnaemman/fyp`.

Untuk bagi akses: repo > Settings > Collaborators > Add people > masukkan username GitHub Amru.
Jangan kongsi password atau token - invite collaborator, itu saja.

---

## 2. Aliran harian (terminal)

```bash
git pull --rebase            # ambil kerja terbaru SEBELUM mula
# ... buat kerja ...
git add -A
git commit -m "week06: BLE GATT service skeleton"
git push
```

GitHub Desktop pun sama konsepnya: Fetch/Pull dulu, lepas tu Commit, lepas tu Push.

---

## 3. Format mesej commit

```
weekNN: <apa yang berubah>
```

Contoh yang berguna:

```
week05: add 18-frame storyboard and requirement list
week06: e-paper render task draws status line
week07: single-tag read test, 100 trials CSV
week08: cavity pilot 5 tags x 3 positions - 88% recall
fix: hall sensor debounce 200 ms
docs: chapter 2 lit review draft
```

Sebab format ni penting: bila supervisor tanya "apa kau buat minggu 8", `git log --oneline` jawab terus.
Tag setiap minggu yang siap: `git tag week05 && git push --tags`.

---

## 4. Branch (untuk kerja besar atau beregu)

```bash
git checkout -b week07/reader-bringup
# buat kerja, commit...
git push -u origin week07/reader-bringup
```

Lepas itu buka Pull Request di GitHub dan minta yang seorang lagi review. Untuk dokumen kecil,
commit terus ke `main` pun boleh - jangan over-engineer.

Nama branch: `weekNN/topik` atau `feat/topik`, `fix/topik`.

---

## 5. Peraturan penting untuk projek dokumentasi

**Fail .docx tak boleh merge.** Kalau dua orang edit fail Word yang sama, Git akan pilih satu dan
buang yang satu lagi. Ini punca paling biasa kerja hilang dalam FYP.

Cara elak:
1. Satu bab, satu orang. Contoh: Adam tulis Bab 1 dan 3; Amru tulis Bab 2. Fail berasingan.
2. Sebelum edit fail yang dikongsi, `git pull` dulu dan bagitahu dalam WhatsApp.
3. Fail yang dijana (PDF dari docx, PNG dari skrip) tak perlu dikonflik - regenerate saja.

**Jangan commit:**
- kertas rujukan dan datasheet (`00_Reference/Papers/`, `00_Reference/Datasheets/`) - sudah dalam `.gitignore`, hak cipta pihak ketiga
- fail `~$*.docx` (Word lock) - sudah di-ignore
- video besar - letak di Drive, commit pautan saja

**Saiz:** repo ni patut kekal bawah ~50 MB. Kalau `git status` tunjuk fail besar, tanya dulu sebelum commit.

---

## 6. Bila berlaku masalah

```bash
git status                   # apa yang berubah
git log --oneline -10        # sejarah ringkas
git restore <fail>           # buang perubahan yang belum commit
git pull --rebase            # kalau push ditolak sebab remote ada commit baru
```

Kalau `git pull --rebase` ada konflik pada fail teks: buka fail, cari `<<<<<<<`, pilih versi betul,
buang penanda, `git add` fail itu, `git rebase --continue`.

Kalau konflik pada `.docx`: jangan cuba selesaikan secara manual. Pilih satu versi
(`git checkout --ours` atau `--theirs`), kemudian tampal semula bahagian yang hilang dari sejarah
(`git log --oneline -- <fail>` untuk cari versi lama).
