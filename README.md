# Mangawii Game Indexer

A modern, responsive game indexer built with React, featuring a beautiful UI/UX design with Arabic language support.

## Features

- **Modern React Architecture**: Built with React 18 and Vite for fast development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with smooth animations
- **Advanced Search**: Real-time search with instant filtering
- **Game Selection**: Multi-select games with visual feedback
- **Smart Pricing**: Automatic price calculation based on total size
- **Export Options**: Copy to clipboard or send via WhatsApp
- **Arabic RTL Support**: Full right-to-left language support
- **Smooth Animations**: Framer Motion for delightful interactions

Made with ❤️ by Mangawii


## 📘 دليل التحديث (عربي)

> هذا الدليل يوضح أماكن التعديل السريعة في المشروع لتحديث قائمة الألعاب، صور الغلاف، ورقم الواتساب.

### 1) تحديث قائمة الألعاب (JSON)

- ضع ملفات JSON الخاصة بالألعاب في المسارات التالية:
  - للألعاب أوفلاين: `src/data/offline-games/`
  - للألعاب أونلاين: `src/data/online-games/`

- لا تحتاج لتعديل الكود عند إضافة/حذف ملفات JSON. يتم اكتشاف جميع الملفات تلقائيًا بواسطة Vite خلال عملية البناء (`import.meta.glob`).

- شكل البيانات المدعوم داخل كل ملف JSON:

```json
[
  {
    "Name": "Game Title",
    "SizeGB": 12.5,
    "Drive": "D",
    "rawg_id": 123456
  },
  { "Name": "Another Game", "SizeGB": 8 }
]
```

- أو يمكنك استخدام كائن يحتوي على مصفوفة `games`:

```json
{
  "games": [
    { "Name": "Game 1", "SizeGB": 4 },
    { "Name": "Game 2", "SizeGB": 7.2, "Drive": "E" }
  ]
}
```

> الحقول التي يتم قراءتها: `Name` و`SizeGB` و`Drive` و`rawg_id`. أي أسماء أخرى سيتم تجاهلها.

### 2) تحديث صور الغلاف (Covers)

- ضع صور الغلاف داخل مجلد: `public/covers/`
- يدعم الامتدادات: `jpg`, `png`, `webp`, `jpeg`, `avif`
- يقوم النظام بالبحث عن الصورة بالاعتماد على اسم اللعبة مع عدة صيغ أسماء:
  - نفس الاسم كما هو
  - بأحرف صغيرة
  - مع الاستبدال بشرطة `-` أو underscore `_`
  - مثال: للعبة "Need For Speed" سيُجرّب:
    - `Need For Speed.jpg`
    - `need for speed.png`
    - `Need-For-Speed.webp`
    - `need_for_speed.jpeg`

- صورة بديلة (Fallback): إن لم تتوفر صورة للعبة، يمكن وضع صورة افتراضية باسم أحد هذه الأسماء داخل `public/covers/`:
  - `fallback.*`, `Fallback.*`, `cover.*`, `Cover.*`, `default.*`, `Default.*`

### 3) تحديث رقم الواتساب

- الملف: `public/whatsapp.json`
- غيّر رقم الهاتف في هذا الملف:

```json
{
  "phoneNumber": "201234567890"
}
```

- يتم قراءة الرقم عند تشغيل الموقع، ولا حاجة لتعديل الكود.

## 🚀 النشر على GitHub Pages (عبر GitHub Actions)

### المتطلبات

- حساب GitHub ومستودع Repository عام أو خاص.
- تفعيل GitHub Pages على بيئة `github-pages` (يتم تلقائيًا عبر الـ Actions).

### 1) ضبط المسار الأساسي في Vite

- ملف: `vite.config.js`
- الخاصية `base` يجب أن تساوي اسم المستودع مسبوقًا بشرطة مائلة:

```js
// vite.config.js
export default defineConfig({
  base: '/اسم-المستودع/',
  // ...
})
```

مثال: إذا كان اسم المستودع هو `Mangawii-Game-Indexer` فليكن:

```js
base: '/Mangawii-Game-Indexer/'
```

### 2) ملفات GitHub Actions الجاهزة

- موجودة في: `.github/workflows/`
  - `pages.yml`: ينشر تلقائيًا عند الدفع `push` على الفرعين: `main` و`Game-Indexer-Final-UI`.
  - `deploy.yml`: مثال آخر للنشر على فرع `modren-design`.

كل Workflow يقوم بـ:
- تثبيت Node 20
- `npm ci`
- `npm run build`
- رفع مخرجات البناء من مجلد `dist` ونشرها على GitHub Pages.

### 3) خطوات النشر السريع

1. حدّث قيمة `base` كما في الخطوة (1).
2. ادفع التغييرات إلى أحد الفروع المدعومة في الملفات أعلاه (مثل `main`).
3. راقب تنفيذ الـ Actions عبر تبويب `Actions` في GitHub.
4. بعد نجاح النشر، ستجد رابط الموقع في مخرجات خطوة النشر أو من إعدادات Pages للمستودع.

### 4) إعدادات Pages (اختياري)

- من صفحة المستودع في GitHub: Settings → Pages
- تأكد أن "Source" هو "GitHub Actions".

### 5) مسارات الملفات العامة

- يعتمد الموقع على `import.meta.env.BASE_URL`، لذا أي أصول ثابتة (مثل `public/covers/` و`public/images/`) ستُخدم آليًا تحت المسار الأساسي `base`.
