# ردیابی طراحی V4

این جدول نگاشت نما، مسیر، حالت و خانوادهٔ قرارداد است؛ وجود ردیف به معنی تأیید اتصال زنده یا برابری پیکسلی نیست. جزئیات قراردادهای کاندید در `design/v4-traceability.json` ثبت می‌شوند. ۴۱ نمای مالک به برنامهٔ جداگانه تعلق دارند.

| شناسه | صفحه PDF | نما | مسیر عملیاتی / زمینهٔ حالت | پیاده‌سازی |
|---|---:|---|---|---|
| MK-01 | 5 | شروع آشنا | /welcome | retained-connected-flow |
| MK-02 | 5 | ورود با شماره همراه | /enter | retained-connected-flow |
| MK-03 | 5 | تأیید کد | /enter?step=otp | retained-connected-flow |
| MK-04 | 6 | امروز من | /personal/education | retained-connected-flow |
| MK-05 | 6 | مطالعه یک درس | /personal/education/lessons/{lessonId} | retained-connected-flow |
| MK-06 | 6 | پاسخ به تکلیف | /personal/education/assignments/{assignmentId}/answer | retained-connected-flow |
| MK-07 | 7 | مدرس | /personal/education | retained-connected-flow |
| MK-08 | 7 | مدیر آموزشگاه | /personal/education | retained-connected-flow |
| MK-09 | 7 | والد | /personal/education | retained-connected-flow |
| MK-10 | 8 | اولین کلاس | /personal/extracurricular | retained-connected-flow |
| MK-11 | 8 | کلاس‌های من | /personal/extracurricular | retained-connected-flow |
| MK-12 | 8 | درخواست‌های تشکیل | /personal/extracurricular/requests | retained-connected-flow |
| MK-13 | 9 | ۱. مشخصات | /personal/extracurricular/requests/new?step=details | retained-connected-flow |
| MK-14 | 9 | ۲. مخاطبان | /personal/extracurricular/requests/new?step=audience | retained-connected-flow |
| MK-15 | 9 | ۳. مدیریت و مدرس | /personal/extracurricular/requests/new?step=management | retained-connected-flow |
| MK-16 | 10 | ۴. بازبینی و ارسال | /personal/extracurricular/requests/new?step=review | retained-connected-flow |
| MK-17 | 10 | رسید درخواست | /personal/extracurricular/requests/{requestId} | retained-connected-flow |
| MK-18 | 10 | اصلاح درخواست | /personal/extracurricular/requests/{requestId}/edit | retained-connected-flow |
| MK-19 | 11 | بررسی پلتفرم: اطلاعات و تصمیم کنار هم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-20 | 12 | در حال آماده‌سازی | /personal/extracurricular/classes/{classId}/setup | retained-connected-flow |
| MK-21 | 12 | تکمیل‌نشدن کانال | /personal/extracurricular/classes/{classId}/setup | retained-connected-flow |
| MK-22 | 12 | بازبینی شروع | /personal/extracurricular/classes/{classId}/setup | retained-connected-flow |
| MK-23 | 13 | نمای عضو | /personal/extracurricular/classes/{classId} | retained-connected-flow |
| MK-24 | 13 | نمای مدیر | /personal/extracurricular/classes/{classId} | retained-connected-flow |
| MK-25 | 13 | کلاس بایگانی‌شده | /personal/extracurricular/classes/{classId} | retained-connected-flow |
| MK-26 | 14 | دعوت توسط مدیر | /personal/extracurricular/classes/{classId}/invite | retained-connected-flow |
| MK-27 | 14 | پذیرش دعوت | /personal/extracurricular/invitations/{invitationId} | retained-connected-flow |
| MK-28 | 14 | درخواست پیوستن | /personal/extracurricular/join/{classId} | retained-connected-flow |
| MK-29 | 15 | بررسی درخواست‌ها | /personal/extracurricular/classes/{classId}/requests | retained-connected-flow |
| MK-30 | 15 | فهرست اعضا | /personal/extracurricular/classes/{classId}/members | retained-connected-flow |
| MK-31 | 15 | اطلاعات و پایان عضویت | /personal/extracurricular/classes/{classId}/members/{memberId} | retained-connected-flow |
| MK-32 | 16 | گروه کلاس | /personal/messages/{conversationId} | retained-connected-flow |
| MK-33 | 16 | کانال کلاس | /personal/messages/{conversationId} | retained-connected-flow |
| MK-34 | 16 | اطلاعات فضای وابسته | /personal/messages/{conversationId}/info | retained-connected-flow |
| MK-35 | 17 | صندوق یکپارچه | /personal/messages | retained-connected-flow |
| MK-36 | 17 | گفتگوی شخصی | /personal/messages/{conversationId} | retained-connected-flow |
| MK-37 | 17 | گزینه‌های پیام | /personal/messages/{conversationId} | retained-connected-flow |
| MK-38 | 18 | شروع گفتگو | /personal/assistant | retained-connected-flow |
| MK-39 | 18 | انتخاب منبع | /personal/assistant | retained-connected-flow |
| MK-40 | 18 | پاسخ نمونه | /personal/assistant | retained-connected-flow |
| MK-41 | 19 | کتابخانه من | /personal/resources | retained-connected-flow |
| MK-42 | 19 | بارگذاری | /personal/resources?upload=1 | retained-connected-flow |
| MK-43 | 19 | فایل آماده، دستیار در انتظار | /personal/resources/{resourceId} | retained-connected-flow |
| MK-44 | 20 | تکلیف‌های من | /personal/extracurricular/classes/{classId}/assignments | retained-connected-flow |
| MK-45 | 20 | صورت و شرایط تکلیف | /personal/extracurricular/classes/{classId}/assignments/{assignmentId} | retained-connected-flow |
| MK-46 | 20 | متن و فایل پاسخ | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/answer | retained-connected-flow |
| MK-60 | 21 | ساخت تکلیف | /personal/extracurricular/classes/{classId}/assignments/new | retained-connected-flow |
| MK-61 | 21 | بازبینی انتشار | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/publish-review | retained-connected-flow |
| MK-62 | 21 | صف پاسخ‌ها | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/submissions | retained-connected-flow |
| MK-63 | 22 | رسید تحویل | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/receipt | retained-connected-flow |
| MK-64 | 22 | ارزیابی پاسخ | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/submissions/{submissionId}/evaluate | retained-connected-flow |
| MK-65 | 22 | نتیجه عضو | /personal/extracurricular/classes/{classId}/assignments/{assignmentId}/result | retained-connected-flow |
| MK-66 | 23 | آزمون‌های کلاس | /personal/extracurricular/classes/{classId}/exams | retained-connected-flow |
| MK-67 | 23 | شرایط شروع | /personal/extracurricular/classes/{classId}/exams/{examId}/conditions | retained-connected-flow |
| MK-68 | 23 | پاسخ به سؤال | /personal/extracurricular/classes/{classId}/exams/{examId}/attempts/{attemptId} | retained-connected-flow |
| MK-69 | 24 | مشخصات آزمون | /personal/extracurricular/classes/{classId}/exams/new | retained-connected-flow |
| MK-70 | 24 | ویرایش سؤال | /personal/extracurricular/classes/{classId}/exams/{examId}/questions | retained-connected-flow |
| MK-71 | 24 | بازبینی انتشار | /personal/extracurricular/classes/{classId}/exams/{examId}/publish-review | retained-connected-flow |
| MK-72 | 25 | مرور پاسخ‌ها | /personal/extracurricular/classes/{classId}/exams/{examId}/attempts/{attemptId}/review | retained-connected-flow |
| MK-73 | 25 | رسید نهایی آزمون | /personal/extracurricular/classes/{classId}/exams/{examId}/attempts/{attemptId}/receipt | retained-connected-flow |
| MK-74 | 25 | نتیجه منتشرشده | /personal/extracurricular/classes/{classId}/exams/{examId}/result | retained-connected-flow |
| MK-75 | 26 | تصحیح آزمون | /personal/extracurricular/classes/{classId}/exams/{examId}/submissions/{submissionId}/evaluate | retained-connected-flow |
| MK-76 | 26 | اصلاح نتیجه | /personal/extracurricular/classes/{classId}/exams/{examId}/result/correction | retained-connected-flow |
| MK-77 | 26 | نتیجه در تم تاریک | /personal/extracurricular/classes/{classId}/exams/{examId}/result | retained-connected-flow |
| MK-78 | 27 | اتصال قطع در آزمون | /personal/extracurricular/classes/{classId}/exams/{examId}/attempts/{attemptId} | retained-connected-flow |
| MK-79 | 27 | تغییر مجوز عضویت | /personal/extracurricular/classes/{classId} | retained-connected-flow |
| MK-80 | 27 | هنوز فعالیتی نیست | /personal/extracurricular/classes/{classId}/assignments | retained-connected-flow |
| MK-81 | 28 | دسکتاپ آموزش: یک کلاس، یک میز کار | /personal/extracurricular/classes/{classId}/assignments | retained-connected-flow |
| MK-82 | 29 | دسکتاپ آزمون: سؤال، نسخه و تنظیمات کنار هم | /personal/extracurricular/classes/{classId}/exams/{examId}/questions | retained-connected-flow |
| MK-47 | 30 | پروفایل | /personal/profile | retained-connected-flow |
| MK-48 | 30 | امنیت حساب | /personal/settings/devices | retained-connected-flow |
| MK-49 | 30 | حریم ارتباط | /personal/settings/privacy | retained-connected-flow |
| MK-50 | 31 | فوق‌برنامه تاریک | /personal/extracurricular | retained-connected-flow |
| MK-51 | 31 | پیام‌ها تاریک | /personal/messages | retained-connected-flow |
| MK-52 | 31 | دستیار تاریک | /personal/assistant | retained-connected-flow |
| MK-53 | 32 | قطع اتصال با داده قبلی | /personal/extracurricular | retained-connected-flow |
| MK-54 | 32 | جستجوی بدون نتیجه | /personal/extracurricular/classes/{classId}/members?search=بی‌نتیجه | retained-connected-flow |
| MK-55 | 32 | تعارض هنگام ویرایش | /personal/extracurricular/classes/{classId}/edit | retained-connected-flow |
| MK-56 | 33 | دسکتاپ: ابزار مدیریت، با فضای کافی | /personal/extracurricular/classes/{classId}/members | retained-connected-flow |
| MK-57 | 35 | متن درشت‌تر | /personal/extracurricular/classes/{classId}/members | retained-connected-flow |
| MK-58 | 35 | تمرکز و برچسب ثابت | /personal/extracurricular/requests/new?step=details | retained-connected-flow |
| MK-59 | 35 | بدون آموزشگاه | /personal/education | retained-connected-flow |
| MK-83 | 40 | آموزشگاه‌های من | /personal/workspaces | connected-flow-mapped |
| MK-84 | 40 | تغییر فضای فعال | /personal/workspaces | connected-flow-mapped |
| MK-85 | 40 | دعوت آموزشگاه | /personal/education/invitations | connected-flow-mapped |
| MK-86 | 41 | کلاس‌های من | /personal/education/classes | connected-flow-mapped |
| MK-87 | 41 | کلاس‌های تدریس | /personal/education/classes | connected-flow-mapped |
| MK-88 | 41 | ریاضی دهم | /personal/education/classes/{classId} | connected-flow-mapped |
| MK-89 | 42 | دوره‌های آموزشی | /personal/education/courses | connected-flow-mapped |
| MK-90 | 42 | دوره تازه | /personal/education/periods/new | connected-flow-mapped |
| MK-91 | 42 | کاتالوگ درس‌ها | /personal/education/courses | connected-flow-mapped |
| MK-92 | 43 | کلاس تازه | /personal/education/classes/new | connected-flow-mapped |
| MK-93 | 43 | انتخاب درس | /personal/education/classes/new | connected-flow-mapped |
| MK-94 | 43 | بازبینی کلاس | /personal/education/classes/new | connected-flow-mapped |
| MK-95 | 44 | تنظیمات کلاس | /personal/education/classes/{classId} | connected-flow-mapped |
| MK-96 | 44 | ثبت تغییر ظرفیت | /personal/education/classes/{classId} | connected-flow-mapped |
| MK-97 | 44 | تنظیمات تازه‌تر است | /personal/education/classes/{classId} | connected-flow-mapped |
| MK-98 | 45 | دانش‌آموزان کلاس | /personal/education/classes/{classId}/members | connected-flow-mapped |
| MK-99 | 45 | انتخاب دانش‌آموز | /personal/education/classes/{classId}/members | connected-flow-mapped |
| MK-100 | 45 | پایان ثبت‌نام؟ | /personal/education/classes/{classId}/members | connected-flow-mapped |
| MK-101 | 46 | مدرسان ریاضی دهم | /personal/education/classes/{classId}/teachers/new | connected-flow-mapped |
| MK-102 | 46 | انتساب مدرس | /personal/education/classes/{classId}/teachers/new | connected-flow-mapped |
| MK-103 | 46 | پایان انتساب مدرس؟ | /personal/education/classes/{classId}/teachers/new | connected-flow-mapped |
| MK-104 | 47 | افراد آموزشگاه | /personal/education/people | connected-flow-mapped |
| MK-105 | 47 | پرونده تازه | /personal/education/people/new | connected-flow-mapped |
| MK-106 | 47 | پرونده نازنین | /personal/education/people | connected-flow-mapped |
| MK-107 | 48 | اعضا و نقش‌ها | /personal/education/members | connected-flow-mapped |
| MK-108 | 48 | افزودن نقش | /personal/education/members | connected-flow-mapped |
| MK-109 | 48 | پایان نقش مدرس؟ | /personal/education/members | connected-flow-mapped |
| MK-110 | 49 | دعوت‌های آموزشگاه | /personal/education/invitations | connected-flow-mapped |
| MK-111 | 49 | جزئیات دعوت | /personal/education/invitations | connected-flow-mapped |
| MK-112 | 49 | لغو دعوت؟ | /personal/education/invitations | connected-flow-mapped |
| MK-113 | 50 | والدهای مرتبط | /personal/education/guardians | connected-flow-mapped |
| MK-114 | 50 | دعوت والد | /personal/education/guardians/new | connected-flow-mapped |
| MK-115 | 50 | پایان رابطه والد؟ | /personal/education/guardians | connected-flow-mapped |
| MK-116 | 51 | فرزندان من | /personal/education | connected-flow-mapped |
| MK-117 | 51 | برنامه نازنین | /personal/education | connected-flow-mapped |
| MK-118 | 51 | نتایج نازنین | /personal/education | connected-flow-mapped |
| MK-119 | 52 | برنامه هفتگی | /personal/education/schedule | connected-flow-mapped |
| MK-120 | 52 | فیلتر برنامه | /personal/education/schedule | connected-flow-mapped |
| MK-121 | 52 | انتخاب تاریخ | /personal/education/schedule | connected-flow-mapped |
| MK-122 | 53 | جلسه تازه | /personal/education/classes/{classId}/sessions/new | connected-flow-mapped |
| MK-123 | 53 | بازبینی جلسه | /personal/education/classes/{classId}/sessions/new | connected-flow-mapped |
| MK-124 | 53 | جزئیات جلسه | /personal/education/sessions/{sessionId} | connected-flow-mapped |
| MK-125 | 54 | ویرایش جلسه | /personal/education/sessions/{sessionId} | connected-flow-mapped |
| MK-126 | 54 | لغو این جلسه؟ | /personal/education/sessions/{sessionId} | connected-flow-mapped |
| MK-127 | 54 | پایان جلسه | /personal/education/sessions/{sessionId} | connected-flow-mapped |
| MK-128 | 55 | حضور جلسه | /personal/education/schedule | connected-flow-mapped |
| MK-129 | 55 | اصلاح حضور نازنین | /personal/education/schedule | connected-flow-mapped |
| MK-130 | 55 | حضور من | /personal/education/schedule | connected-flow-mapped |
| MK-131 | 56 | قاعده برنامه | /personal/education/classes/{classId}/schedule-rules/new | new-connected-flow |
| MK-132 | 56 | بازه اجرای برنامه | /personal/education/classes/{classId}/schedule-rules/new | new-connected-flow |
| MK-133 | 56 | اعمال تغییر از چه روزی؟ | /personal/education/classes/{classId}/schedule-rules/new | new-connected-flow |
| MK-134 | 57 | درس تازه | /personal/education/classes/{classId}/lessons/new | connected-flow-mapped |
| MK-135 | 57 | ویرایش پیش‌نویس | /personal/education/classes/{classId}/lessons/new | connected-flow-mapped |
| MK-136 | 57 | انتشار درس؟ | /personal/education/classes/{classId}/lessons/new | connected-flow-mapped |
| MK-137 | 58 | درس‌های ریاضی | /personal/education/lessons/{lessonId} | connected-flow-mapped |
| MK-138 | 58 | معادله درجه دوم | /personal/education/lessons/{lessonId} | connected-flow-mapped |
| MK-139 | 58 | فایل دریافت نشد | /personal/education/lessons/{lessonId} | connected-flow-mapped |
| MK-140 | 59 | تکلیف‌های ریاضی | /personal/education/assignments | connected-flow-mapped |
| MK-141 | 59 | صورت تکلیف | /personal/education/assignments | connected-flow-mapped |
| MK-142 | 59 | قواعد تکلیف | /personal/education/assignments | connected-flow-mapped |
| MK-143 | 60 | پاسخ تمرین | /personal/education/assignments/{assignmentId}/answer | connected-flow-mapped |
| MK-144 | 60 | تلاش‌های من | /personal/education/assignments/{assignmentId}/answer | connected-flow-mapped |
| MK-145 | 60 | رسید تحویل | /personal/education/assignments/{assignmentId}/answer | connected-flow-mapped |
| MK-146 | 61 | صف ارزیابی | /personal/education/submissions/{attemptId}/evaluate | connected-flow-mapped |
| MK-147 | 61 | ارزیابی نازنین | /personal/education/submissions/{attemptId}/evaluate | connected-flow-mapped |
| MK-148 | 61 | انتشار نتیجه تکلیف | /personal/education/submissions/{attemptId}/evaluate | connected-flow-mapped |
| MK-149 | 62 | آزمون‌های من | /personal/education/exams | connected-flow-mapped |
| MK-150 | 62 | آزمون تازه | /personal/education/exams/{examId}/edit | connected-flow-mapped |
| MK-151 | 62 | قواعد آزمون | /personal/education/exams/{examId}/edit | connected-flow-mapped |
| MK-152 | 63 | پرسش تشریحی | /personal/education/exams/{examId}/edit | connected-flow-mapped |
| MK-153 | 63 | حذف پرسش؟ | /personal/education/exams/{examId}/edit | connected-flow-mapped |
| MK-154 | 63 | پیش‌نمایش مدرس | /personal/education/exams/{examId}/edit | connected-flow-mapped |
| MK-155 | 64 | آزمون ناتمام | /personal/education/exams/{examId} | connected-flow-mapped |
| MK-156 | 64 | ادامه روی این دستگاه؟ | /personal/education/exams/{examId} | connected-flow-mapped |
| MK-157 | 64 | زمان پاسخ تمام شد | /personal/education/exams/{examId} | connected-flow-mapped |
| MK-158 | 65 | صف تصحیح آزمون | /personal/education/exam-submissions/{attemptId}/grading | connected-flow-mapped |
| MK-159 | 65 | تکمیل ارزیابی آزمون | /personal/education/exam-submissions/{attemptId}/grading | connected-flow-mapped |
| MK-160 | 65 | اصلاح نتیجه آزمون | /personal/education/exam-submissions/{attemptId}/grading | connected-flow-mapped |
| MK-161 | 66 | پیشرفت من | /personal/education/reports | connected-flow-mapped |
| MK-162 | 66 | گزارش ریاضی دهم | /personal/education/reports | connected-flow-mapped |
| MK-163 | 66 | گزارش آموزشگاه | /personal/education/reports | connected-flow-mapped |
| MK-164 | 67 | تنظیم خروجی | /personal/education/reports | connected-flow-mapped |
| MK-165 | 67 | خروجی در حال ساخت | /personal/education/reports | connected-flow-mapped |
| MK-166 | 67 | خروجی آماده است | /personal/education/reports | connected-flow-mapped |
| MK-167 | 68 | فضاهای رسمی | /personal/education/classes/{classId} | connected-flow-mapped |
| MK-168 | 68 | فعالیت در گفتگو | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-169 | 68 | کارهای محتوایی مدرس | /personal/education/reports?kind=content-activities | connected-flow-mapped |
| MK-170 | 69 | پیام‌ها | /personal/messages | connected-flow-mapped |
| MK-171 | 69 | خوانده‌نشده‌ها | /personal/messages | connected-flow-mapped |
| MK-172 | 69 | بایگانی گفتگوها | /personal/messages | connected-flow-mapped |
| MK-173 | 70 | پوشه‌های من | /personal/messages/folders | new-connected-flow |
| MK-174 | 70 | ویرایش پوشه | /personal/messages/folders | new-connected-flow |
| MK-175 | 70 | حذف پوشه؟ | /personal/messages/folders | new-connected-flow |
| MK-176 | 71 | مخاطبین | /personal/contacts | connected-flow-mapped |
| MK-177 | 71 | مخاطب تازه | /personal/contacts | connected-flow-mapped |
| MK-178 | 71 | ویرایش مخاطب | /personal/contacts | connected-flow-mapped |
| MK-179 | 72 | مریم رضایی | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-180 | 72 | اطلاعات مریم | /personal/messages/{conversationId}/info | connected-flow-mapped |
| MK-181 | 72 | گفتگوی تازه | /personal/contacts | connected-flow-mapped |
| MK-182 | 73 | ذخیره‌شده‌ها | /personal/messages?filter=Saved | connected-flow-mapped |
| MK-183 | 73 | برچسب‌های پیام | /personal/messages?filter=Saved | connected-flow-mapped |
| MK-184 | 73 | یادداشت شخصی | /personal/messages?filter=Saved | connected-flow-mapped |
| MK-185 | 74 | جستجوی پیام‌ها | /personal/messages?q={query} | connected-flow-mapped |
| MK-186 | 74 | فیلتر جستجو | /personal/messages?q={query} | connected-flow-mapped |
| MK-187 | 74 | نتیجه در گفتگو | /personal/messages?q={query} | connected-flow-mapped |
| MK-188 | 75 | ساخت گروه | /personal/messages/new?kind=groups | connected-flow-mapped |
| MK-189 | 75 | افراد اولیه | /personal/messages/new?kind=groups | connected-flow-mapped |
| MK-190 | 75 | گروه ساخته شد | /personal/messages/new?kind=groups | connected-flow-mapped |
| MK-191 | 76 | ساخت کانال | /personal/messages/new?kind=channels | connected-flow-mapped |
| MK-192 | 76 | بازبینی کانال | /personal/messages/new?kind=channels | connected-flow-mapped |
| MK-193 | 76 | یادداشت‌های مطالعه | /personal/messages/new?kind=channels | connected-flow-mapped |
| MK-194 | 77 | اطلاعات گروه | /personal/messages/{conversationId}/info | connected-flow-mapped |
| MK-195 | 77 | ویرایش گروه | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-196 | 77 | عکس گروه | /personal/messages/{conversationId}/edit | connected-flow-mapped |
| MK-197 | 78 | اطلاعات کانال | /personal/messages/{conversationId}/info | connected-flow-mapped |
| MK-198 | 78 | ویرایش کانال | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-199 | 78 | مدیران کانال | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-200 | 79 | تنظیمات گروه | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-201 | 79 | تاریخچه عضو تازه | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-202 | 79 | قابلیت اعضای گروه | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-203 | 80 | اختیارهای مریم | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-204 | 80 | محدودیت عضو | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-205 | 80 | وضعیت ارتباط من | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-206 | 81 | اعضای گروه | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-207 | 81 | نقش امیر | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-208 | 81 | حذف امیر از گروه؟ | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-209 | 82 | انتقال مالکیت | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-210 | 82 | پذیرش مالکیت | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-211 | 82 | خروج آخرین مالک | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-212 | 83 | دعوت به گفتگو | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-213 | 83 | دعوت‌های گفتگو | /personal/messages | connected-flow-mapped |
| MK-214 | 83 | پذیرش دعوت گروه | /personal/messages | connected-flow-mapped |
| MK-215 | 84 | لینک دعوت تازه | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-216 | 84 | لینک‌های دعوت | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-217 | 84 | باطل‌کردن لینک؟ | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-218 | 85 | ورود با کد دعوت | /personal/messages/join | connected-flow-mapped |
| MK-219 | 85 | درخواست‌های گروه | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-220 | 85 | انصراف از درخواست؟ | /personal/messages/{conversationId}/invites | connected-flow-mapped |
| MK-221 | 86 | یافتن گفتگو | /personal/messages/join | connected-flow-mapped |
| MK-222 | 86 | پیش‌نمایش گروه | /personal/messages/join | connected-flow-mapped |
| MK-223 | 86 | وضعیت پیام‌رسان | /personal/settings/communication | connected-flow-mapped |
| MK-224 | 87 | موضوع‌های گروه | /personal/messages/{conversationId}/topics | connected-flow-mapped |
| MK-225 | 87 | موضوع تازه | /personal/messages/{conversationId}/topics | connected-flow-mapped |
| MK-226 | 87 | بستن موضوع؟ | /personal/messages/{conversationId}/topics | connected-flow-mapped |
| MK-227 | 88 | پاسخ در گفتگو | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-228 | 88 | ویرایش پیام من | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-229 | 88 | پیش‌نویس حفظ شود؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-230 | 89 | حذف این پیام | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-231 | 89 | حذف برای همه؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-232 | 89 | عمل مجاز نیست | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-233 | 90 | بازفرستادن پیام | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-234 | 90 | سنجاق پیام | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-235 | 90 | واکنش به پیام | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-236 | 91 | انتخاب پیوست | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-237 | 91 | پیش‌نمایش پیوست | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-238 | 91 | بارگذاری پیوست | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-239 | 92 | رسانه‌های گروه | /personal/messages/{conversationId}/media | connected-flow-mapped |
| MK-240 | 92 | مشاهده فایل | /personal/messages/{conversationId}/media | connected-flow-mapped |
| MK-241 | 92 | گزینه‌های فایل | /personal/messages/{conversationId}/media | connected-flow-mapped |
| MK-242 | 93 | نظرسنجی تازه | /personal/messages/{conversationId}/poll-new | new-connected-flow |
| MK-243 | 93 | رأی من | /personal/messages/{conversationId} | new-connected-flow |
| MK-244 | 93 | نتیجه نظرسنجی | /personal/messages/{conversationId} | new-connected-flow |
| MK-245 | 94 | پرسش کوتاه | /personal/messages/{conversationId}/quiz-new | new-connected-flow |
| MK-246 | 94 | پاسخ پرسش کوتاه | /personal/messages/{conversationId} | new-connected-flow |
| MK-247 | 94 | بستن نظرسنجی؟ | /personal/messages/{conversationId} | new-connected-flow |
| MK-248 | 95 | چک‌لیست تازه | /personal/messages/{conversationId}/checklist-new | new-connected-flow |
| MK-249 | 95 | آماده‌سازی جلسه | /personal/messages/{conversationId} | new-connected-flow |
| MK-250 | 95 | ویرایش چک‌لیست | /personal/messages/{conversationId} | new-connected-flow |
| MK-251 | 96 | زمان‌بندی پیام | /personal/messages/{conversationId}/scheduled | new-connected-flow |
| MK-252 | 96 | پیام‌های زمان‌بندی | /personal/messages/{conversationId}/scheduled | new-connected-flow |
| MK-253 | 96 | لغو ارسال زمان‌بندی؟ | /personal/messages/{conversationId}/scheduled | new-connected-flow |
| MK-254 | 97 | گزینه‌های گفتگو | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-255 | 97 | پاک‌کردن تاریخچه من؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-256 | 97 | ترک این گروه؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-257 | 98 | بی‌صداکردن گفتگو | /personal/messages/{conversationId}/info | connected-flow-mapped |
| MK-258 | 98 | تنظیمات این گفتگو | /personal/messages/{conversationId}/info | connected-flow-mapped |
| MK-259 | 98 | حریم ارتباط | /personal/settings/privacy | connected-flow-mapped |
| MK-260 | 99 | گزارش این پیام | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-261 | 99 | پیگیری گزارش | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-262 | 99 | مسدودکردن مریم؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-263 | 100 | گزارش‌های گروه | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-264 | 100 | بررسی گزارش | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-265 | 100 | پایان بررسی گزارش | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-266 | 101 | پیام در انتظار | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-267 | 101 | ارسال انجام نشد | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-268 | 101 | گفتگو به‌روز شد | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-269 | 102 | هنوز پیامی نیست | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-270 | 102 | کانال فقط خواندنی | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-271 | 102 | دسترسی تغییر کرد | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-272 | 103 | درخواست‌های من | /personal/extracurricular/requests | connected-flow-mapped |
| MK-273 | 103 | جزئیات درخواست | /personal/extracurricular/requests | connected-flow-mapped |
| MK-274 | 103 | انصراف از درخواست؟ | /personal/extracurricular/requests | connected-flow-mapped |
| MK-275 | 104 | مشخصات کلاس | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-276 | 104 | توضیحات درخواست | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-277 | 104 | خطای اطلاعات درخواست | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-278 | 105 | مدیریت پیشنهادی | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-279 | 105 | پیشنهاد مدیر دیگر | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-280 | 105 | مدرس پیشنهادی | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-281 | 106 | بازبینی درخواست | /personal/extracurricular/requests/new | connected-flow-mapped |
| MK-282 | 106 | اصلاح لازم است | /personal/extracurricular/requests/{requestId}/edit | connected-flow-mapped |
| MK-283 | 106 | رسید ارسال مجدد | /personal/extracurricular/requests/{requestId}/edit | connected-flow-mapped |
| MK-284 | 107 | درخواست‌های تشکیل | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-285 | 107 | بازبینی درخواست | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-286 | 107 | نتیجه بررسی | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-287 | 108 | تأیید درخواست | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-288 | 108 | تغییر مدیر نهایی | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-289 | 108 | درخواست تأیید شد | /personal/extracurricular/requests/{requestId} | connected-flow-mapped |
| MK-290 | 109 | آماده‌سازی کلاس | /personal/extracurricular/classes/{classId}/setup | connected-flow-mapped |
| MK-291 | 109 | فضا کامل نشد | /personal/extracurricular/classes/{classId}/setup | connected-flow-mapped |
| MK-292 | 109 | فضاهای کلاس | /personal/extracurricular/classes/{classId}/setup | connected-flow-mapped |
| MK-293 | 110 | تنظیمات کلاس | /personal/extracurricular/classes/{classId}/edit | connected-flow-mapped |
| MK-294 | 110 | کاهش ظرفیت | /personal/extracurricular/classes/{classId}/edit | connected-flow-mapped |
| MK-295 | 110 | بستن درخواست پیوستن | /personal/extracurricular/classes/{classId}/edit | connected-flow-mapped |
| MK-296 | 111 | دعوت به کلاس | /personal/extracurricular/classes/{classId}/invite | connected-flow-mapped |
| MK-297 | 111 | دعوت‌های من | /personal/extracurricular/invitations | connected-flow-mapped |
| MK-298 | 111 | پذیرش دعوت کلاس | /personal/extracurricular/invitations | connected-flow-mapped |
| MK-299 | 112 | نپذیرفتن دعوت | /personal/extracurricular/invitations | connected-flow-mapped |
| MK-300 | 112 | لغو دعوت ارسال‌شده | /personal/extracurricular/classes/{classId}/invite | connected-flow-mapped |
| MK-301 | 112 | عضویت قبلاً ثبت شد | /personal/extracurricular/invitations | connected-flow-mapped |
| MK-302 | 113 | درخواست پیوستن | /personal/extracurricular/join/{classId} | connected-flow-mapped |
| MK-303 | 113 | درخواست‌های عضویت | /personal/extracurricular/classes/{classId}/requests | connected-flow-mapped |
| MK-304 | 113 | تصمیم عضویت ریحانه | /personal/extracurricular/classes/{classId}/requests | connected-flow-mapped |
| MK-305 | 114 | اعضا و نقش‌ها | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-306 | 114 | نقش مریم در کلاس | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-307 | 114 | پایان عضویت ریحانه؟ | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-308 | 115 | اختیارهای آموزشی | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-309 | 115 | اختیار آموزش مریم | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-310 | 115 | لغو اختیار ارزیابی | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-311 | 116 | انتقال مدیریت | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-312 | 116 | پیشنهاد مدیریت | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-313 | 116 | وضعیت انتقال | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-314 | 117 | تطبیق فضاهای کلاس | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-315 | 117 | اجرای طرح ترمیم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-316 | 117 | نتیجه تطبیق | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-317 | 118 | سابقه درخواست | /personal/extracurricular/classes/{classId}/info | connected-flow-mapped |
| MK-318 | 118 | سابقه کلاس | /personal/extracurricular/classes/{classId}/info | connected-flow-mapped |
| MK-319 | 118 | جزئیات رویداد | /personal/extracurricular/classes/{classId}/info | connected-flow-mapped |
| MK-320 | 119 | تعلیق فعالیت کلاس | /personal/extracurricular/classes/{classId}/archive | connected-flow-mapped |
| MK-321 | 119 | بازبینی فعال‌سازی | /personal/extracurricular/classes/{classId}/archive | connected-flow-mapped |
| MK-322 | 119 | بایگانی کلاس؟ | /personal/extracurricular/classes/{classId}/archive | connected-flow-mapped |
| MK-323 | 120 | کارهای آموزشی من | /personal/extracurricular/classes/{classId}/learning | connected-flow-mapped |
| MK-324 | 120 | مدیریت آموزش | /personal/extracurricular/classes/{classId}/learning | connected-flow-mapped |
| MK-325 | 120 | ابزار مدرس | /personal/extracurricular/classes/{classId}/learning | connected-flow-mapped |
| MK-326 | 121 | صورت تکلیف کلاس | /personal/extracurricular/classes/{classId}/assignments/{assignmentId} | connected-flow-mapped |
| MK-327 | 121 | پاسخ من | /personal/extracurricular/classes/{classId}/assignments/{assignmentId} | connected-flow-mapped |
| MK-328 | 121 | ارزیابی پاسخ | /personal/extracurricular/classes/{classId}/assignments/{assignmentId} | connected-flow-mapped |
| MK-329 | 122 | پاسخ تشریحی | /personal/extracurricular/classes/{classId}/exams/{examId} | connected-flow-mapped |
| MK-330 | 122 | رسید آزمون مستقل | /personal/extracurricular/classes/{classId}/exams/{examId} | connected-flow-mapped |
| MK-331 | 122 | نتیجه من | /personal/extracurricular/classes/{classId}/exams/{examId} | connected-flow-mapped |
| MK-332 | 123 | ورود با شماره | /enter | connected-flow-mapped |
| MK-333 | 123 | کد تأیید | /enter | connected-flow-mapped |
| MK-334 | 123 | محدودیت ارسال کد | /enter | connected-flow-mapped |
| MK-335 | 124 | ویرایش پروفایل | /personal/profile/edit | connected-flow-mapped |
| MK-336 | 124 | انتخاب تاریخ تولد | /personal/profile/edit | connected-flow-mapped |
| MK-337 | 124 | عکس پروفایل | /personal/profile/edit | connected-flow-mapped |
| MK-338 | 125 | تنظیمات | /personal/settings | connected-flow-mapped |
| MK-339 | 125 | ظاهر برنامه | /personal/settings/appearance | connected-flow-mapped |
| MK-340 | 125 | خوانایی و نمایش | /personal/settings/appearance | connected-flow-mapped |
| MK-341 | 126 | حریم خصوصی | /personal/settings/privacy | connected-flow-mapped |
| MK-342 | 126 | چه کسی پیام بدهد؟ | /personal/settings/privacy | connected-flow-mapped |
| MK-343 | 126 | افراد مسدودشده | /personal/settings/blocked | connected-flow-mapped |
| MK-344 | 127 | اعلان‌ها | /personal/settings/notifications | connected-flow-mapped |
| MK-345 | 127 | دسته‌های اعلان | /personal/settings/notifications | connected-flow-mapped |
| MK-346 | 127 | اعلان تکلیف‌ها | /personal/settings/notifications | connected-flow-mapped |
| MK-347 | 128 | اعلان این دستگاه | /personal/settings/notifications | connected-flow-mapped |
| MK-348 | 128 | دستگاه‌های اعلان | /personal/settings/notifications | connected-flow-mapped |
| MK-349 | 128 | حذف مقصد اعلان؟ | /personal/settings/notifications | connected-flow-mapped |
| MK-350 | 129 | نشست‌های فعال | /personal/settings/devices | connected-flow-mapped |
| MK-351 | 129 | پایان نشست دستگاه؟ | /personal/settings/devices | connected-flow-mapped |
| MK-352 | 129 | خروج از حساب؟ | /personal/settings/devices | connected-flow-mapped |
| MK-353 | 130 | وضعیت ارتباط | /personal/settings/communication | connected-flow-mapped |
| MK-354 | 130 | نصب روی دستگاه | /personal/settings/install | connected-flow-mapped |
| MK-355 | 130 | راهنما و پشتیبانی | /personal/settings/help | connected-flow-mapped |
| MK-356 | 131 | منابع مجاز من | /personal/resources | connected-flow-mapped |
| MK-357 | 131 | جزئیات منبع | /personal/resources | connected-flow-mapped |
| MK-358 | 131 | منبع کتابخانه | /personal/resources | connected-flow-mapped |
| MK-359 | 132 | منبع تازه | /personal/resources | connected-flow-mapped |
| MK-360 | 132 | آماده‌سازی منبع | /personal/resources | connected-flow-mapped |
| MK-361 | 132 | نسخه تازه منبع | /personal/resources | connected-flow-mapped |
| MK-362 | 133 | انتشار این منبع؟ | /personal/resources | connected-flow-mapped |
| MK-363 | 133 | تغییر نمایش منبع | /personal/resources | connected-flow-mapped |
| MK-364 | 133 | بایگانی منبع؟ | /personal/resources | connected-flow-mapped |
| MK-365 | 134 | انتخاب زمینه دستیار | /personal/assistant | connected-flow-mapped |
| MK-366 | 134 | منابع گفتگو | /personal/assistant | connected-flow-mapped |
| MK-367 | 134 | آمادگی دستیار | /personal/assistant | connected-flow-mapped |
| MK-368 | 135 | توضیح تکلیف | /personal/assistant | connected-flow-mapped |
| MK-369 | 135 | آمادگی آزمون | /personal/assistant | connected-flow-mapped |
| MK-370 | 135 | برنامه مطالعه | /personal/assistant | connected-flow-mapped |
| MK-371 | 136 | خلاصه کلاس | /personal/assistant | connected-flow-mapped |
| MK-372 | 136 | همراهی با فرزند | /personal/assistant | connected-flow-mapped |
| MK-373 | 136 | نگاه به آموزشگاه | /personal/assistant | connected-flow-mapped |
| MK-374 | 137 | پاسخ دستیار | /personal/assistant | connected-flow-mapped |
| MK-375 | 137 | اعتبار کافی نیست | /personal/assistant | connected-flow-mapped |
| MK-376 | 137 | دستیار در دسترس نیست | /personal/assistant | connected-flow-mapped |
| MK-377 | 138 | خلاصه منبع | /personal/assistant/studio | proposal-backend-pending |
| MK-378 | 138 | فلش‌کارت مطالعه | /personal/assistant/studio | proposal-backend-pending |
| MK-379 | 138 | مرور شنیداری | /personal/assistant/studio | proposal-backend-pending |
| MK-380 | 139 | اشتراک شخصی | /personal/subscription | connected-flow-mapped |
| MK-381 | 139 | اشتراک آموزشگاه | /personal/subscription | connected-flow-mapped |
| MK-382 | 139 | انتخاب بسته | /personal/subscription | connected-flow-mapped |
| MK-383 | 140 | بازبینی پیش‌فاکتور | /personal/subscription | connected-flow-mapped |
| MK-384 | 140 | سفارش در انتظار | /personal/subscription | connected-flow-mapped |
| MK-385 | 140 | بررسی پرداخت | /personal/subscription | connected-flow-mapped |
| MK-386 | 141 | سفارش‌های من | /personal/subscription | connected-flow-mapped |
| MK-387 | 141 | جزئیات سفارش | /personal/subscription | connected-flow-mapped |
| MK-388 | 141 | کاهش بسته اشتراک | /personal/subscription | connected-flow-mapped |
| MK-389 | 142 | مدیریت ماکان | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-390 | 142 | نقش‌های پلتفرم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-391 | 142 | پایان نقش پلتفرم؟ | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-392 | 143 | کاربران پلتفرم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-393 | 143 | جزئیات حساب | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-394 | 143 | تعلیق حساب؟ | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-395 | 144 | آموزشگاه‌ها | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-396 | 144 | آموزشگاه تازه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-397 | 144 | اثر تعلیق آموزشگاه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-398 | 145 | عضویت‌های آفتاب | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-399 | 145 | دعوت مدیر آموزشگاه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-400 | 145 | پایان عضویت سازمان؟ | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-401 | 146 | راه‌اندازی‌ها | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-402 | 146 | راه‌اندازی تازه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-403 | 146 | سفارش پلتفرم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-404 | 147 | پلن‌های ماکان | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-405 | 147 | نسخه پیش‌نویس پلن | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-406 | 147 | بازبینی انتشار پلن | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-407 | 148 | قرارداد تجاری | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-408 | 148 | دسترس‌پذیری پلن | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-409 | 148 | سابقه تجاری | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-410 | 149 | منابع کتابخانه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-411 | 149 | ثبت منبع مرکزی | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-412 | 149 | نمای آموزش پلتفرم | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-413 | 150 | پرونده‌های گزارش | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-414 | 150 | شواهد پرونده | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-415 | 150 | ثبت نتیجه پرونده | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-416 | 151 | سلامت عملیات | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-417 | 151 | کارهای پس‌زمینه | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-418 | 151 | سابقه ممیزی | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-419 | 152 | دریافت کلاس‌ها | /personal/education | shared-loading-state |
| MK-420 | 152 | پیام‌های تازه | /personal/education | shared-loading-state |
| MK-421 | 152 | ادامه اعضا | /personal/education | shared-loading-state |
| MK-422 | 153 | هنوز کلاسی ندارید | /personal | shared-state-mapped |
| MK-423 | 153 | هنوز گفتگویی نیست | /personal | shared-state-mapped |
| MK-424 | 153 | نتیجه‌ای پیدا نشد | /personal | shared-state-mapped |
| MK-425 | 154 | دسترسی مجاز نیست | /personal | shared-state-mapped |
| MK-426 | 154 | دریافت انجام نشد | /personal | shared-state-mapped |
| MK-427 | 154 | عضویت پایان یافته | /personal | shared-state-mapped |
| MK-428 | 155 | نسخه تازه‌تری وجود دارد | /personal | shared-state-mapped |
| MK-429 | 155 | نتیجه ثبت روشن نیست | /personal | shared-state-mapped |
| MK-430 | 155 | تغییرات ذخیره نشده | /personal | shared-state-mapped |
| MK-431 | 156 | اصلاح زمان جلسه | /personal | shared-state-mapped |
| MK-432 | 156 | پیوست پذیرفته نشد | /personal | shared-state-mapped |
| MK-433 | 156 | نام بلند عضو | /personal | shared-state-mapped |
| MK-434 | 157 | مجوز انتخاب فایل | /personal | shared-state-mapped |
| MK-435 | 157 | اعلان این دستگاه | /personal | shared-state-mapped |
| MK-436 | 157 | اتصال برقرار نیست | /personal | shared-state-mapped |
| MK-437 | 158 | برای ادامه وارد شوید | /personal | shared-state-mapped |
| MK-438 | 158 | بررسی پیوند دعوت | /personal | shared-state-mapped |
| MK-439 | 158 | دعوت دیگر معتبر نیست | /personal | shared-state-mapped |
| MK-440 | 159 | تغییر شماره همراه | /personal/settings/phone | proposal-backend-pending |
| MK-441 | 159 | حذف حساب | /personal/settings/delete-account | proposal-backend-pending |
| MK-442 | 159 | تیکت پشتیبانی | /personal/settings/support | proposal-backend-pending |
| MK-443 | 160 | کلاس‌های تدریس | /personal/education/classes | connected-flow-mapped |
| MK-444 | 160 | حضور جلسه | /personal/education/schedule | connected-flow-mapped |
| MK-445 | 160 | درس منتشرشده | /personal/education/lessons/{lessonId} | connected-flow-mapped |
| MK-446 | 161 | باشگاه کتاب‌خوانی | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-447 | 161 | تنظیمات گروه | /personal/messages/{conversationId}/settings | connected-flow-mapped |
| MK-448 | 161 | ترک گروه؟ | /personal/messages/{conversationId} | connected-flow-mapped |
| MK-449 | 162 | اعضای کارگاه | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-450 | 162 | اختیار آموزشی | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-451 | 162 | پذیرش مدیریت | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-452 | 163 | منابع من | /personal/resources | connected-flow-mapped |
| MK-453 | 163 | آمادگی دستیار | /personal/assistant | connected-flow-mapped |
| MK-454 | 163 | بازبینی پیش‌فاکتور | /personal/subscription | connected-flow-mapped |
| MK-455 | 164 | مدیریت کلاس‌های آموزشگاه | /personal/education/classes | connected-flow-mapped |
| MK-456 | 165 | جلسه و حضور؛ برنامه کنار فهرست | /personal/education/schedule | connected-flow-mapped |
| MK-457 | 166 | مطالعه درس و منابع همان کلاس | /personal/education/lessons/{lessonId} | connected-flow-mapped |
| MK-458 | 167 | ارزیابی تکلیف؛ پاسخ و بازخورد کنار هم | /personal/education/submissions/{attemptId}/evaluate | connected-flow-mapped |
| MK-459 | 168 | تصحیح آزمون؛ سؤال، پاسخ و بارم | /personal/education/exam-submissions/{attemptId}/grading | connected-flow-mapped |
| MK-460 | 169 | پیام‌رسان؛ صندوق، گفتگو و زمینه | /personal/messages | connected-flow-mapped |
| MK-461 | 170 | تنظیمات و اعضای گفتگو | /personal/messages/{conversationId}/members | connected-flow-mapped |
| MK-462 | 171 | کلاس مستقل؛ عضویت، فضا و اختیار | /personal/extracurricular/classes/{classId}/members | connected-flow-mapped |
| MK-463 | 172 | بررسی تشکیل فوق‌برنامه در پنل | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-464 | 173 | پلن و قرارداد؛ نسخه و اثر تجاری | برنامهٔ جداگانهٔ مالک | separate-owner-application |
| MK-465 | 174 | منبع؛ محتوا، نسخه و دسترسی | /personal/resources | connected-flow-mapped |
| MK-466 | 175 | دستیار؛ گفتگو، منابع و قصد مصرف | /personal/assistant | connected-flow-mapped |
| MK-467 | 176 | گزارش آموزشگاه؛ فیلتر تا خروجی | /personal/education/reports | connected-flow-mapped |
