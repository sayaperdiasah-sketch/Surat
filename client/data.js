const SESSION_KEY = "suratapp_session";
const TEMPLATES_KEY = "suratapp_templates";
const DIRUT_KEY = "suratapp_dirut";
const LETTERS_KEY = "suratapp_letters";

const DEFAULT_TEMPLATES = [
  {
    key: "konfirmasi_akta",
    nama: "Konfirmasi Keabsahan Kutipan Akta Kelahiran",
    deskripsi: "Surat konfirmasi resmi terkait keabsahan dokumen.",
    template: `<p>Dengan hormat,</p><p>Dengan ini kami menerangkan bahwa kutipan akta kelahiran atas nama <strong>{{nama_pemohon}}</strong>, NIK <strong>{{nik}}</strong>, tanggal lahir <strong>{{tanggal_lahir}}</strong>, telah dikonfirmasi keabsahannya.</p><p>{{keterangan}}</p>`,
    fields: [
      { name: "nama_pemohon", label: "Nama pemohon", type: "text", required: true },
      { name: "nik", label: "NIK", type: "text", required: true },
      { name: "tanggal_lahir", label: "Tanggal lahir", type: "date", required: true },
      { name: "keterangan", label: "Keterangan tambahan", type: "textarea", required: false },
    ],
  },
  {
    key: "surat_keterangan",
    nama: "Surat Keterangan",
    deskripsi: "Template umum untuk kebutuhan keterangan dinas.",
    template: `<p>Dengan ini menerangkan bahwa:</p><p>Nama: <strong>{{nama}}</strong><br>NIK: <strong>{{nik}}</strong></p><p>Yang bersangkutan memerlukan surat ini untuk keperluan <strong>{{keperluan}}</strong>.</p>`,
    fields: [
      { name: "nama", label: "Nama lengkap", type: "text", required: true },
      { name: "nik", label: "NIK", type: "text", required: true },
      { name: "keperluan", label: "Keperluan", type: "textarea", required: true },
    ],
  },
];

const DEFAULT_DIRUT = [
  {
    id: "dirut-001",
    nama: "Budi Santoso",
    jabatan: "Direktur Utama",
    nip: "19850101 201001 1 001",
  },
  {
    id: "dirut-002",
    nama: "Siti Rahmawati",
    jabatan: "Direktur Operasional",
    nip: "19870312 201203 2 002",
  },
];

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function patchSession(values) {
  const session = { ...getSession(), ...values };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function setTemplates(templates) {
  const normalized = Array.isArray(templates) ? templates.map(normalizeTemplate) : [];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(normalized));
  return normalized;
}

function normalizeTemplate(template) {
  const safeTemplate = template || {};
  const fields = Array.isArray(safeTemplate.fields)
    ? safeTemplate.fields.map((field, index) => ({
        name: String(field?.name || `field_${index + 1}`),
        label: String(field?.label || "Field baru"),
        type: String(field?.type || "text"),
        required: Boolean(field?.required),
        options: Array.isArray(field?.options) ? field.options : undefined,
      }))
    : [];

  const renderedTemplate = plainTextToHtml(String(safeTemplate.template || "<p>Isi template surat.</p>"));

  return {
    key: String(safeTemplate.key || slugify(safeTemplate.nama || "template_baru")),
    nama: String(safeTemplate.nama || "Template Baru"),
    deskripsi: String(safeTemplate.deskripsi || "Template surat resmi."),
    template: renderedTemplate,
    fields,
    updated_at: safeTemplate.updated_at || new Date().toISOString(),
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/^_+|_+$/g, "") || "template_baru";
}

function getTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(TEMPLATES_KEY));
    const templates = Array.isArray(saved) && saved.length ? saved : DEFAULT_TEMPLATES;
    const normalized = setTemplates(templates);
    return normalized;
  } catch (error) {
    return setTemplates(DEFAULT_TEMPLATES);
  }
}

function upsertTemplate(template) {
  const templates = getTemplates();
  const normalized = normalizeTemplate(template);
  const existingIndex = templates.findIndex((item) => item.key === normalized.key);

  if (existingIndex >= 0) {
    templates[existingIndex] = { ...templates[existingIndex], ...normalized, updated_at: new Date().toISOString() };
  } else {
    templates.unshift({ ...normalized, updated_at: new Date().toISOString() });
  }

  return setTemplates(templates);
}

function deleteTemplate(templateKey) {
  const templates = getTemplates();
  if (!templateKey || templates.length <= 1) {
    return templates;
  }

  const next = templates.filter((template) => template.key !== templateKey);
  return setTemplates(next);
}

function buildTemplatePreview(template) {
  const safeTemplate = normalizeTemplate(template);
  const sampleData = {};

  (safeTemplate.fields || []).forEach((field) => {
    const name = String(field.name || "field");
    if (field.type === "date") {
      sampleData[name] = "2026-09-21";
    } else if (field.type === "textarea") {
      sampleData[name] = `Contoh ${field.label || "isi"} untuk preview.`;
    } else {
      sampleData[name] = `Contoh ${field.label || name}`;
    }
  });

  return renderTemplate(safeTemplate.template, sampleData);
}

function getDirut() {
  try {
    const saved = JSON.parse(localStorage.getItem(DIRUT_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_DIRUT;
  } catch (error) {
    return DEFAULT_DIRUT;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlToPlainText(value) {
  const raw = String(value || "");
  if (!raw) return "";
  const withoutTags = raw.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n").replace(/<[^>]+>/g, "");
  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainTextToHtml(value) {
  const raw = String(value || "").trim();
  if (!raw) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }

  const tokens = [];
  const withTokens = raw.replace(/{{\s*([\w-]+)\s*}}/g, (match) => {
    const token = `__SURAT_TOKEN_${tokens.length}__`;
    tokens.push(match);
    return token;
  });

  const paragraphs = withTokens
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph).replace(/__SURAT_TOKEN_(\d+)__/g, (_, index) => tokens[Number(index)]);
      return `<p>${safeParagraph.replace(/\n/g, "<br>")}</p>`;
    });

  return paragraphs.join("") || "<p></p>";
}

function renderTemplate(template, data) {
  return String(template || "").replace(/{{\s*([\w-]+)\s*}}/g, (match, key) => escapeHtml(data[key] || ""));
}

function saveLetter(letter) {
  let letters = [];
  try {
    const saved = JSON.parse(localStorage.getItem(LETTERS_KEY));
    letters = Array.isArray(saved) ? saved : [];
  } catch (error) {
    letters = [];
  }
  const savedLetter = { ...letter, id: `L${String(letters.length + 1).padStart(3, "0")}`, created_at: new Date().toISOString() };
  localStorage.setItem(LETTERS_KEY, JSON.stringify([savedLetter, ...letters]));
  return savedLetter;
}
