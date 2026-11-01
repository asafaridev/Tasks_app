# راه‌اندازی ورود با گوگل و همگام‌سازی (یک‌بار، حدود ۱۰ دقیقه)

بدون این مراحل برنامه کاملاً کار می‌کند، فقط داده‌ها روی همان دستگاه می‌مانند.

## ۱. ساخت پروژه
1. برو به https://console.firebase.google.com و با گوگل وارد شو.
2. **Add project** و یک اسم بده (مثلاً `tasks-fa`). آنالیتیکس را می‌توانی خاموش کنی.

## ۲. روشن کردن ورود با گوگل
1. منوی **Build > Authentication > Get started**
2. تب **Sign-in method** > **Google** > Enable > ایمیل پشتیبانی را انتخاب کن > Save
3. تب **Settings > Authorized domains** > **Add domain** و این را اضافه کن:
   `asafaridev.github.io`

## ۳. ساخت پایگاه‌داده
1. منوی **Build > Firestore Database > Create database**
2. حالت **Production mode** و نزدیک‌ترین منطقه (مثلاً `eur3`)
3. تب **Rules** را باز کن، همه‌ی متن را پاک کن و این را بگذار، بعد **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/sync/{part} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid
                         && part.matches('main|log-[0-9]{4}');
    }
  }
}
```

این قانون یعنی: هر کاربر فقط به داده‌ی خودش دسترسی دارد و هیچ مسیر دیگری باز نیست.

## ۴. گرفتن تنظیمات
1. **Project settings** (چرخ‌دنده) > پایین صفحه **Your apps** > آیکن وب `</>`
2. یک اسم بده و **Register app** را بزن (Hosting لازم نیست).
3. از بلوک `firebaseConfig` چهار مقدار `apiKey`، `authDomain`، `projectId` و `appId` را کپی کن.

## ۵. گذاشتن در برنامه
فایل `config.js` را در گیت‌هاب باز کن، مداد (Edit) را بزن، مقادیر را بین گیومه‌ها بگذار و Commit کن.
(این مقادیر محرمانه نیستند؛ امنیت را قوانین مرحله‌ی ۳ و دامنه‌های مجاز مرحله‌ی ۲ تامین می‌کنند.)

بعد از یکی دو دقیقه برنامه را باز کن؛ در تنظیمات (آیکن پروفایل) دکمه‌ی «ورود با گوگل» فعال است.

## نکته‌ها
- اگر ورود در شبکه‌ی ایران انجام نشد، با VPN یک‌بار امتحان کن تا مطمئن شوی مشکل از تنظیمات نیست. بعضی سرویس‌های گوگل از ایران محدودند.
- هزینه: برای مصرف شخصی در طرح رایگان Spark می‌ماند.
