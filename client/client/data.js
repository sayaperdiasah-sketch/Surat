// Storage keys
const K_TPL = "surat_templates";
const K_LTR = "surat_letters";

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Templates ----
function getTemplates() { return load(K_TPL, []); }
function saveTemplates(list) { save(K_TPL, list); }
function getTemplate(key) { return getTemplates().find(t => t.key === key); }
function upsertTemplate(t) {
  const list = getTemplates();
  const i = list.findIndex(x => x.key === t.key);
  if (i >= 0) list[i] = t; else list.push(t);
  saveTemplates(list);
}
function deleteTemplate(key) {
  saveTemplates(getTemplates().filter(t => t.key !== key));
}

// ---- Letters ----
function getLetters() { return load(K_LTR, []); }
function saveLetters(list) { save(K_LTR, list); }
function getLetter(id) { return getLetters().find(l => l.id === id); }
function addLetter(letter) {
  const list = getLetters();
  letter.id = "L" + String(list.length + 1).padStart(3, "0");
  letter.created_at = new Date().toISOString();
  list.unshift(letter);
  saveLetters(list);
  return letter;
}
function deleteLetter(id) {
  saveLetters(getLetters().filter(l => l.id !== id));
}

// ---- Render ----
function renderTemplate(tpl, data) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? "");
}

// ---- Seed ----
function seedIfEmpty() {
  if (getTemplates().length > 0) return;

  saveTemplates([
    {
      key: "konfirmasi_akta",
      nama: "Konfirmasi Keabsahan Kutipan Akta Kelahiran",
      template: `<h3>PEMERINTAH KABUPATEN TUBAN</h3>
<h3>DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL</h3>
<hr>

<table style="width:100%">
  <tr><td style="width:100px">Nomor</td><td>: {{nomor_surat}}</td></tr>
  <tr><td>Sifat</td><td>: {{sifat}}</td></tr>
  <tr><td>Lampiran</td><td>: {{lampiran}}</td></tr>
  <tr><td>Perihal</td><td>: {{perihal}}</td></tr>
</table>

<p style="margin-top:20px">{{tempat}}, {{tanggal}}</p>

<p>K e p a d a<br>
Yth. {{tujuan_nama}}<br>
{{tujuan_alamat}}<br>
di {{tujuan_kota}}</p>

<p>Menindak lanjuti surat Tanggal {{ref_surat_tanggal}}, Nomor {{ref_surat_nomor}} perihal sebagaimana tersebut pada pokok surat, maka dengan ini di informasikan bahwa Kutipan Akta Kelahiran ;</p>

<table style="width:100%">
  <tr><td style="width:180px">Nomor</td><td>: {{akta_nomor}}</td></tr>
  <tr><td>Nama</td><td>: {{nama}}</td></tr>
  <tr><td>Tempat tanggal lahir</td><td>: {{ttl}}</td></tr>
  <tr><td>Nama Bapak</td><td>: {{nama_bapak}}</td></tr>
  <tr><td>Nama Ibu</td><td>: {{nama_ibu}}</td></tr>
  <tr><td>Tanggal Terbit Akta</td><td>: {{akta_tanggal_terbit}}</td></tr>
</table>

<p><b>{{status_akta}}</b> di Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tuban.</p>

<p>Demikian disampaikan dan atas perhatian nya diucapkan terima kasih.</p>

<div style="margin-top:40px;text-align:right">
  <p style="margin:0">{{signer_jabatan}}</p>
  <br><br><br>
  <p style="margin:0"><b>{{signer_nama}}</b></p>
  <p style="margin:0">NIP. {{signer_nip}}</p>
</div>`,
      fields: [
        { name: "nomor_surat",         label: "Nomor Surat",         type: "text",     required: true },
        { name: "sifat",               label: "Sifat",               type: "select",   options: ["Biasa","Segera","Penting","Rahasia"], required: true },
        { name: "lampiran",            label: "Lampiran",            type: "text",     required: true },
        { name: "perihal",             label: "Perihal",             type: "text",     required: true },
        { name: "tempat",              label: "Tempat",              type: "text",     required: true },
        { name: "tanggal",             label: "Tanggal Surat",       type: "date",     required: true },
        { name: "tujuan_nama",         label: "Nama Tujuan",         type: "text",     required: true },
        { name: "tujuan_alamat",       label: "Alamat Tujuan",       type: "textarea", required: true },
        { name: "tujuan_kota",         label: "Kota Tujuan",         type: "text",     required: true },
        { name: "ref_surat_tanggal",   label: "Tgl Surat Referensi", type: "date",     required: false },
        { name: "ref_surat_nomor",     label: "No. Surat Referensi", type: "text",     required: false },
        { name: "akta_nomor",          label: "Nomor Akta",          type: "text",     required: true },
        { name: "nama",                label: "Nama",                type: "text",     required: true },
        { name: "ttl",                 label: "Tempat Tgl Lahir",    type: "text",     required: true },
        { name: "nama_bapak",          label: "Nama Bapak",          type: "text",     required: true },
        { name: "nama_ibu",            label: "Nama Ibu",            type: "text",     required: true },
        { name: "akta_tanggal_terbit", label: "Tgl Terbit Akta",     type: "date",     required: true },
        { name: "status_akta",         label: "Status Akta",         type: "select",   options: ["TERCATAT","TIDAK TERCATAT"], required: true }
      ]
    }
  ]);
}
seedIfEmpty();
