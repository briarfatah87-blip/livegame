// lang.js — Multi-language support (English / Arabic)
(function () {
  const translations = {
    en: {
      // Navbar
      "nav.home": "Home",
      "nav.news": "News",
      "nav.schedule": "Schedule",
      "nav.admin": "Admin",
      "nav.installApp": "Install App",
      "nav.theme": "Theme",
      "nav.language": "Language",
      "site.name": 'Koora<span>Live</span>',

      // Hero
      "hero.tag": "P2P Powered Streaming",
      "hero.title": 'Watch Football<br><span class="highlight">Live & Free</span>',
      "hero.subtitle": "HD quality streams powered by P2P technology. No buffering, no delays — pure football action.",
      "hero.liveNow": "Live Now",
      "hero.upcoming": "Upcoming",
      "hero.technology": "Technology",
      "hero.quality": "Quality",

      // Sections
      "section.liveNow": "Live Now",
      "section.upcomingMatches": "Upcoming Matches",
      "section.recentResults": "Recent Results",
      "section.viewAll": "View All →",

      // Filters
      "filter.allLeagues": "All Leagues",
      "filter.all": "All",
      "filter.live": "Live",
      "filter.upcoming": "Upcoming",
      "filter.finished": "Finished",

      // Empty states
      "empty.noLive": "No live matches right now. Check the schedule for upcoming games!",
      "empty.noUpcoming": "No upcoming matches found.",
      "empty.noResults": "No recent results.",
      "empty.noMatches": "No matches found.",

      // Footer
      "footer.home": "Home",
      "footer.schedule": "Schedule",
      "footer.admin": "Admin",
      "footer.copy": "© 2024 Koora Live. P2P Streaming Platform.",

      // Watch page
      "watch.back": "← Back",
      "watch.football": "Football",
      "watch.share": "Share",
      "watch.peers": "Peers",
      "watch.p2pDownload": "P2P Download",
      "watch.p2pUpload": "P2P Upload",
      "watch.cdnSaved": "CDN Saved",
      "watch.p2pActive": "P2P Active",
      "watch.home": "Home",
      "watch.away": "Away",
      "watch.fullTime": "Full Time",
      "watch.loading": "Loading stream...",
      "watch.noStream": "No stream URL configured for this match.",
      "watch.networkError": "Network error — retrying...",
      "watch.streamError": "Stream error. Please try refreshing.",
      "watch.browserNoHls": "Your browser does not support HLS streaming.",
      "watch.initP2P": "Initializing P2P engine...",
      "watch.matchStarting": "Match is starting! Connecting to stream...",
      "watch.linkCopied": "Link copied!",
      "player.error403": "Stream host returned 403 Forbidden. Check source server hotlink/referrer rules.",
      "player.networkUnstable": "Network unstable. Please refresh stream.",
      "player.mediaErrorRetry": "Media error. Tap play to retry.",
      "player.mediaErrorReload": "Media error. Please reload the page.",

      // Chat
      "chat.title": "Live Chat",
      "chat.viewers": "viewers",
      "chat.viewer": "viewer",
      "chat.enterName": "Enter your name to join the chat",
      "chat.yourName": "Your name...",
      "chat.saySomething": "Say something...",
      "chat.isTyping": "is typing...",
      "chat.banned": "You have been banned from this chat.",
      "chat.bannedShort": "You have been banned.",

      // Countdown
      "countdown.days": "Days",
      "countdown.hours": "Hours",
      "countdown.mins": "Mins",
      "countdown.secs": "Secs",
      "countdown.matchIn": "Match in",

      // Schedule page
      "schedule.title": "Match Schedule",
      "schedule.subtitle": "All matches — live, upcoming, and recent results",
      "schedule.search": "Search teams or competitions...",
      "schedule.today": "Today",
      "schedule.tomorrow": "Tomorrow",

      // Admin page
      "admin.title": "Admin Panel",
      "admin.subtitle": "Enter your admin password to continue",
      "admin.password": "Admin password...",
      "admin.login": "Login",
      "admin.wrongPassword": "Wrong password. Try again.",
      "admin.management": "Management",
      "admin.matches": "Matches",
      "admin.addMatch": "Add Match",
      "admin.bannedUsers": "Banned Users",
      "admin.account": "Account",
      "admin.logout": "Logout",
      "admin.allMatches": "All Matches",
      "admin.addNewMatch": "Add New Match",
      "admin.matchTitle": "Match Title *",
      "admin.homeTeam": "Home Team *",
      "admin.homeTeamLogo": "Home Team Logo URL",
      "admin.awayTeam": "Away Team *",
      "admin.awayTeamLogo": "Away Team Logo URL",
      "admin.competition": "Competition",
      "admin.stadium": "Stadium",
      "admin.startTime": "Start Time *",
      "admin.status": "Status",
      "admin.homeScore": "Home Score",
      "admin.awayScore": "Away Score",
      "admin.minute": "Minute (if live)",
      "admin.streamUrl": "Stream URL (HLS .m3u8) - Main Video",
      "admin.standingsUrl": "Standings / Rankings (Iframe)",
      "admin.seoDesc": "SEO Description (Title & Meta)",
      "admin.saveMatch": "Save Match",
      "admin.cancel": "Cancel",
      "admin.banUser": "Ban a User",
      "admin.usernameBan": "Username to ban...",
      "admin.reasonBan": "Reason (optional)...",
      "admin.ban": "Ban",
      "admin.loading": "Loading...",
      "admin.teams": "Teams",
      "admin.score": "Score",
      "admin.time": "Time",
      "admin.actions": "Actions",
      "admin.username": "Username",
      "admin.reason": "Reason",
      "admin.bannedAt": "Banned At",
      "admin.action": "Action",

      // Match cards (dynamic)
      "card.watchLive": "Watch Live",
      "card.finished": "Finished",
      "card.upcoming": "Upcoming",

      // Status
      "status.upcoming": "Upcoming",
      "status.live": "Live",
      "status.finished": "Finished",

      // Dynamic admin strings
      "admin.addNewMatchTitle": "Add New Match",
      "admin.editMatchTitle": "Edit Match",
      "admin.saveMatchBtn": "Save Match",
      "admin.updateMatchBtn": "Update Match",
      "admin.saving": "Saving...",
      "admin.noMatches": "No matches yet. Add one!",
      "admin.errorLoadingMatches": "Error loading matches.",
      "admin.failedLoadMatch": "Failed to load match",
      "admin.fillRequired": "Please fill in all required fields (*)",
      "admin.matchUpdated": "Match updated!",
      "admin.matchCreated": "Match created!",
      "admin.errorSaving": "Error saving match",
      "admin.networkError": "Network error",
      "admin.deleteConfirm": "Delete match? This will also delete its chat history.",
      "admin.matchDeleted": "Match deleted",
      "admin.errorDeleting": "Error deleting match",
      "admin.enterUsername": "Enter a username",
      "admin.userBanned": "banned",
      "admin.errorBanning": "Error banning user",
      "admin.userUnbanned": "unbanned",
      "admin.errorUnbanning": "Error unbanning",
      "admin.noBans": "No banned users.",
      "admin.errorLoadingBans": "Error loading bans.",
      "admin.unban": "Unban",

      // Remaining player/home strings
      "player.errorLoadingMatch": "Error loading match info",
      "player.copyManually": "Copy manually: ",
      "home.failedLoadMatches": "Failed to load matches",

      // News page
      "news.title": "Latest News",
      "news.subtitle": "All football updates and match stories in one place.",
      "news.noNews": "No news available yet.",
      "news.backToAll": "← Back To All News",
      "news.openSource": "Open Source Link",
      "news.notFound": "News item not found.",
      "news.fontIncrease": "Increase Font",
      "news.fontDecrease": "Decrease Font",
      "section.viewAllNews": "View All →",

      // More Admin
      "admin.matchNews": "Match Short News",
      "admin.newsTitleEn": "Title (English)",
      "admin.newsTitleAr": "Title (Arabic)",
      "admin.add": "Add",
      "admin.addNews": "Add News",
      "admin.editNews": "Edit News",
      "admin.saveNews": "Save News",
      "admin.updateNews": "Update News",
      "admin.newsTitle": "Title *",
      "admin.summary": "Summary",
      "admin.imageUrl": "Image URL",
      "admin.linkUrl": "Link URL (optional)",
      "admin.published": "Published",
      "admin.yes": "Yes",
      "admin.no": "No",
      "admin.reset": "Reset",
      "admin.created": "Created",
      "admin.noNewsPosts": "No news posts yet.",
      "admin.errorLoadingNews": "Failed to load news.",
      "admin.newsSaved": "News created.",
      "admin.newsUpdated": "News updated.",
      "admin.newsDeleted": "News deleted.",
      "admin.errorSavingNews": "Failed to save news.",
      "admin.deleteNewsConfirm": "Delete this news item?",
      "admin.matchNewsNoItems": "No short news yet.",
      "admin.matchNewsEnterTitle": "Enter at least one title",
      "admin.matchNewsAdded": "News added",
      "admin.matchNewsDeleted": "Deleted",
      "admin.matchNewsDeleteConfirm": "Delete this news item?",
      "admin.lineupPlaceholder": "Paste lineup iframe embeds here, e.g. <iframe ...></iframe>",
      "watch.lineup": "Lineup",
      "section.latestNews": "Latest News",
      "nav.live": "LIVE",
      "Premier League": "Premier League",
      "La Liga": "La Liga",
      "Champions League": "Champions League",
      "Serie A": "Serie A",
      "Bundesliga": "Bundesliga",
      "Europa League": "Europa League",
      "Ligue 1": "Ligue 1",
    },

    ar: {
      // Navbar
      "nav.home": "الرئيسية",
      "nav.news": "الأخبار",
      "nav.schedule": "الجدول",
      "nav.admin": "الإدارة",
      "nav.installApp": "تثبيت التطبيق",
      "nav.theme": "المظهر",
      "nav.language": "اللغة",
      "site.name": 'كورة<span>لايف</span>',

      // Hero
      "hero.tag": "بث مدعوم بتقنية P2P",
      "hero.title": 'شاهد كرة القدم<br><span class="highlight">مباشر ومجاني</span>',
      "hero.subtitle": "بث عالي الجودة بتقنية P2P. بدون تقطيع، بدون تأخير — كرة قدم حقيقية.",
      "hero.liveNow": "مباشر الآن",
      "hero.upcoming": "القادمة",
      "hero.technology": "التقنية",
      "hero.quality": "الجودة",

      // Sections
      "section.liveNow": "مباشر الآن",
      "section.upcomingMatches": "المباريات القادمة",
      "section.recentResults": "النتائج الأخيرة",
      "section.viewAll": "عرض الكل ←",

      // Filters
      "filter.allLeagues": "كل الدوريات",
      "filter.all": "الكل",
      "filter.live": "مباشر",
      "filter.upcoming": "القادمة",
      "filter.finished": "انتهت",

      // Empty states
      "empty.noLive": "لا توجد مباريات مباشرة الآن. تفقد الجدول للمباريات القادمة!",
      "empty.noUpcoming": "لا توجد مباريات قادمة.",
      "empty.noResults": "لا توجد نتائج حديثة.",
      "empty.noMatches": "لم يتم العثور على مباريات.",

      // Footer
      "footer.home": "الرئيسية",
      "footer.schedule": "الجدول",
      "footer.admin": "الإدارة",
      "footer.copy": "© 2024 كورة لايف. منصة البث P2P.",

      // Watch page
      "watch.back": "← رجوع",
      "watch.football": "كرة القدم",
      "watch.share": "مشاركة",
      "watch.peers": "الأقران",
      "watch.p2pDownload": "تحميل P2P",
      "watch.p2pUpload": "رفع P2P",
      "watch.cdnSaved": "توفير CDN",
      "watch.p2pActive": "P2P نشط",
      "watch.home": "المضيف",
      "watch.away": "الضيف",
      "watch.fullTime": "نهاية المباراة",
      "watch.loading": "جاري تحميل البث...",
      "watch.noStream": "لا يوجد رابط بث لهذه المباراة.",
      "watch.networkError": "خطأ في الشبكة — جاري إعادة المحاولة...",
      "watch.streamError": "خطأ في البث. يرجى تحديث الصفحة.",
      "watch.browserNoHls": "متصفحك لا يدعم بث HLS.",
      "watch.initP2P": "جاری تهيئة محرك P2P...",
      "watch.matchStarting": "المباراة تبدأ! جاري الاتصال بالبث...",
      "watch.linkCopied": "تم نسخ الرابط!",
      "player.error403": "أرجع خادم البث خطأ 403 (غير مسموح). تحقق من قواعد الارتباط المباشر.",
      "player.networkUnstable": "الشبكة غير مستقرة. يرجى تحديث البث.",
      "player.mediaErrorRetry": "خطأ في الوسائط. اضغط على تشغيل للمحاولة مرة أخرى.",
      "player.mediaErrorReload": "خطأ في الوسائط. يرجى إعادة تحميل الصفحة.",

      // Chat
      "chat.title": "الدردشة المباشرة",
      "chat.viewers": "مشاهد",
      "chat.viewer": "مشاهد",
      "chat.enterName": "أدخل اسمك للانضمام إلى الدردشة",
      "chat.yourName": "اسمك...",
      "chat.saySomething": "قل شيئاً...",
      "chat.isTyping": "يكتب...",
      "chat.banned": "تم حظرك من هذه الدردشة.",
      "chat.bannedShort": "تم حظرك.",

      // Countdown
      "countdown.days": "أيام",
      "countdown.hours": "ساعات",
      "countdown.mins": "دقائق",
      "countdown.secs": "ثواني",
      "countdown.matchIn": "مباراة في",

      // Schedule page
      "schedule.title": "جدول المباريات",
      "schedule.subtitle": "جميع المباريات — مباشرة، قادمة، ونتائج حديثة",
      "schedule.search": "ابحث عن فرق أو مسابقات...",
      "schedule.today": "اليوم",
      "schedule.tomorrow": "غداً",

      // Admin page
      "admin.title": "لوحة الإدارة",
      "admin.subtitle": "أدخل كلمة مرور المسؤول للمتابعة",
      "admin.password": "كلمة مرور المسؤول...",
      "admin.login": "تسجيل الدخول",
      "admin.wrongPassword": "كلمة المرور خاطئة. حاول مرة أخرى.",
      "admin.management": "الإدارة",
      "admin.matches": "المباريات",
      "admin.addMatch": "إضافة مباراة",
      "admin.bannedUsers": "المستخدمون المحظورون",
      "admin.account": "الحساب",
      "admin.logout": "تسجيل الخروج",
      "admin.allMatches": "كل المباريات",
      "admin.addNewMatch": "إضافة مباراة جديدة",
      "admin.matchTitle": "عنوان المباراة *",
      "admin.homeTeam": "الفريق المضيف *",
      "admin.homeTeamLogo": "رابط شعار الفريق المضيف",
      "admin.awayTeam": "الفريق الضيف *",
      "admin.awayTeamLogo": "رابط شعار الفريق الضيف",
      "admin.competition": "المسابقة",
      "admin.stadium": "الملعب",
      "admin.startTime": "وقت البداية *",
      "admin.status": "الحالة",
      "admin.homeScore": "نتيجة المضيف",
      "admin.awayScore": "نتيجة الضيف",
      "admin.minute": "الدقيقة (إذا مباشر)",
      "admin.streamUrl": "رابط البث (HLS .m3u8) - مشغل الفيديو الأساسي",
      "admin.standingsUrl": "ترتيب الفرق / الإحصائيات (Iframe)",
      "admin.seoDesc": "وصف محركات البحث (العنوان والوصف)",
      "admin.saveMatch": "حفظ المباراة",
      "admin.cancel": "إلغاء",
      "admin.banUser": "حظر مستخدم",
      "admin.usernameBan": "اسم المستخدم للحظر...",
      "admin.reasonBan": "السبب (اختياري)...",
      "admin.ban": "حظر",
      "admin.loading": "جاري التحميل...",
      "admin.teams": "الفرق",
      "admin.score": "النتيجة",
      "admin.time": "الوقت",
      "admin.actions": "الإجراءات",
      "admin.username": "اسم المستخدم",
      "admin.reason": "السبب",
      "admin.bannedAt": "تاريخ الحظر",
      "admin.action": "إجراء",

      // Match cards (dynamic)
      "card.watchLive": "شاهد مباشر",
      "card.finished": "انتهت",
      "card.upcoming": "قادمة",

      // Status
      "status.upcoming": "قادمة",
      "status.live": "مباشر",
      "status.finished": "انتهت",

      // Dynamic admin strings
      "admin.addNewMatchTitle": "إضافة مباراة جديدة",
      "admin.editMatchTitle": "تعديل المباراة",
      "admin.saveMatchBtn": "حفظ المباراة",
      "admin.updateMatchBtn": "تحديث المباراة",
      "admin.saving": "جاري الحفظ...",
      "admin.noMatches": "لا توجد مباريات بعد. أضف واحدة!",
      "admin.errorLoadingMatches": "خطأ في تحميل المباريات.",
      "admin.failedLoadMatch": "فشل تحميل المباراة",
      "admin.fillRequired": "يرجى ملء جميع الحقول المطلوبة (*)",
      "admin.matchUpdated": "تم تحديث المباراة!",
      "admin.matchCreated": "تم إنشاء المباراة!",
      "admin.errorSaving": "خطأ في حفظ المباراة",
      "admin.networkError": "خطأ في الشبكة",
      "admin.deleteConfirm": "حذف المباراة؟ سيتم حذف سجل الدردشة أيضاً.",
      "admin.matchDeleted": "تم حذف المباراة",
      "admin.errorDeleting": "خطأ في حذف المباراة",
      "admin.enterUsername": "أدخل اسم المستخدم",
      "admin.userBanned": "تم حظره",
      "admin.errorBanning": "خطأ في حظر المستخدم",
      "admin.userUnbanned": "تم رفع الحظر عنه",
      "admin.errorUnbanning": "خطأ في رفع الحظر",
      "admin.noBans": "لا يوجد مستخدمون محظورون.",
      "admin.errorLoadingBans": "خطأ في تحميل قائمة المحظورين.",
      "admin.unban": "رفع الحظر",

      // Remaining player/home strings
      "player.errorLoadingMatch": "خطأ في تحميل معلومات المباراة",
      "player.copyManually": "انسخ يدوياً: ",
      "home.failedLoadMatches": "فشل تحميل المباريات",

      // News page
      "news.title": "آخر الأخبار",
      "news.subtitle": "جميع تحديثات كرة القدم وقصص المباريات في مكان واحد.",
      "news.noNews": "لا توجد أخبار متاحة بعد.",
      "news.backToAll": "← العودة إلى جميع الأخبار",
      "news.openSource": "فتح رابط المصدر",
      "news.notFound": "لم يتم العثور على الخبر.",
      "news.fontIncrease": "تكبير الخط",
      "news.fontDecrease": "تصغير الخط",
      "section.viewAllNews": "عرض الكل ←",

      // More Admin
      "admin.matchNews": "أخبار المباراة المختصرة",
      "admin.newsTitleEn": "العنوان (إنجليزي)",
      "admin.newsTitleAr": "العنوان (عربي)",
      "admin.add": "إضافة",
      "admin.addNews": "إضافة خبر",
      "admin.editNews": "تعديل الخبر",
      "admin.saveNews": "حفظ الخبر",
      "admin.updateNews": "تحديث الخبر",
      "admin.newsTitle": "العنوان *",
      "admin.summary": "الملخص",
      "admin.imageUrl": "رابط الصورة",
      "admin.linkUrl": "رابط المصدر (اختياري)",
      "admin.published": "منشور",
      "admin.yes": "نعم",
      "admin.no": "لا",
      "admin.reset": "إعادة تعيين",
      "admin.created": "تم الإنشاء",
      "admin.noNewsPosts": "لا توجد منشورات إخبارية بعد.",
      "admin.errorLoadingNews": "فشل تحميل الأخبار.",
      "admin.newsSaved": "تم إنشاء الخبر.",
      "admin.newsUpdated": "تم تحديث الخبر.",
      "admin.newsDeleted": "تم حذف الخبر.",
      "admin.errorSavingNews": "فشل حفظ الخبر.",
      "admin.deleteNewsConfirm": "هل تريد حذف هذا الخبر؟",
      "admin.matchNewsNoItems": "لا توجد أخبار مختصرة بعد.",
      "admin.matchNewsEnterTitle": "أدخل عنواناً واحداً على الأقل",
      "admin.matchNewsAdded": "تمت إضافة الخبر",
      "admin.matchNewsDeleted": "تم الحذف",
      "admin.matchNewsDeleteConfirm": "حذف هذا الخبر؟",
      "admin.lineupPlaceholder": "الصق كود التشكيلة هنا، مثال: <iframe ...></iframe>",
      "watch.lineup": "التشكيلة",
      "section.latestNews": "آخر الأخبار",
      "nav.live": "مباشر",
      "Premier League": "الدوري الإنجليزي",
      "La Liga": "الدوري الإسباني",
      "Champions League": "دوري أبطال أوروبا",
      "Serie A": "الدوري الإيطالي",
      "Bundesliga": "الدوري الألماني",
      "Europa League": "الدوري الأوروبي",
      "Ligue 1": "الدوري الفرنسي",
    }
  };

  // Get saved language or default to English
  const savedLang = localStorage.getItem('lang') || 'en';
  document.documentElement.setAttribute('lang', savedLang);
  document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');

  // Expose translation helper globally
  window.__lang = savedLang;
  window.__translations = translations;

  window.t = function (key) {
    return (translations[window.__lang] && translations[window.__lang][key]) || translations.en[key] || key;
  };

  // Apply translations to elements with data-i18n attribute
  window.applyTranslations = function () {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      var val = t(key);
      if (attr === 'placeholder') {
        el.placeholder = val;
      } else if (attr === 'title') {
        el.title = val;
      } else if (val.includes('<')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
  };

  // Toggle language
  window.toggleLang = function () {
    var next = window.__lang === 'en' ? 'ar' : 'en';
    window.__lang = next;
    localStorage.setItem('lang', next);
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');

    // Update toggle button text
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = next === 'ar' ? 'EN' : 'عربي';

    applyTranslations();
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Set toggle button initial text
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = savedLang === 'ar' ? 'EN' : 'عربي';

    applyTranslations();
  });
})();
