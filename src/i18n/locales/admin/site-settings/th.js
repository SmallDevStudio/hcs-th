const siteSettingsTh = {
  eyebrow: "ตั้งค่าเว็บไซต์",

  title: "ข้อมูลเว็บไซต์",

  description:
    "จัดการข้อมูลบริษัท ช่องทางติดต่อ Branding, SEO และระบบแจ้งเตือน",

  actions: {
    save: "บันทึกการเปลี่ยนแปลง",

    saving: "กำลังบันทึก...",

    saved: "อัปเดตข้อมูลเว็บไซต์เรียบร้อยแล้ว",

    saveFailed: "ไม่สามารถอัปเดตข้อมูลเว็บไซต์ได้",
  },

  tabs: {
    company: "ข้อมูลบริษัท",

    contact: "ช่องทางติดต่อ",

    social: "Social Media",

    brandingSeo: "Branding และ SEO",

    integrations: "การเชื่อมต่อ",

    notifications: "การแจ้งเตือน",
  },

  sections: {
    company: {
      title: "ข้อมูลบริษัท",

      description: "ข้อมูลทั่วไปที่นำไปแสดงในส่วนต่าง ๆ ของเว็บไซต์",
    },

    contact: {
      title: "ข้อมูลการติดต่อ",

      description: "เบอร์โทรศัพท์ อีเมล ที่อยู่ และเวลาทำการของบริษัท",
    },

    social: {
      title: "Social Media",

      description: "ลิงก์ที่นำไปแสดงใน Header, Footer และหน้าติดต่อ",
    },

    branding: {
      title: "Branding",

      description:
        "สีหลัก โลโก้บริษัท และรูปเริ่มต้นสำหรับแชร์ผ่าน Social Media",
    },

    seo: {
      title: "SEO เริ่มต้น",

      description:
        "Metadata สำรองสำหรับหน้าที่ยังไม่ได้กำหนดข้อมูล SEO โดยเฉพาะ",
    },

    integrations: {
      title: "Search Engine และ Analytics",

      description:
        "รหัสยืนยัน Search Engine และการตั้งค่าระบบวิเคราะห์เว็บไซต์",
    },
  },

  notifications: {
    channels: {
      title: "ช่องทางการแจ้งเตือน",

      description:
        "เลือกช่องทางแจ้งเตือนผู้ดูแลระบบเมื่อมีผู้ส่งข้อความใหม่ผ่านเว็บไซต์",

      inApp: "ภายในระบบ",

      inAppDescription: "แสดงข้อความใหม่และสถานะยังไม่ได้อ่านใน Admin Panel",

      email: "อีเมล",

      emailDescription: "ส่งรายละเอียดข้อความไปยังอีเมลผู้รับที่กำหนด",

      line: "LINE",

      lineDescription:
        "ส่งข้อความแจ้งเตือนไปยังผู้ใช้ที่เลือกผ่าน LINE Messaging API",
    },

    email: {
      title: "แจ้งเตือนทางอีเมล",

      description:
        "ตั้งค่า SMTP Server และรายชื่อผู้รับแจ้งเตือนจากหน้า Contact",

      smtpTitle: "ตั้งค่า SMTP",

      smtpDescription: "รหัสผ่าน SMTP จะถูกเข้ารหัสก่อนจัดเก็บ",
    },

    line: {
      title: "แจ้งเตือนทาง LINE",

      description:
        "ตั้งค่า LINE Messaging API, LINE Login และเลือกผู้ใช้ที่เชื่อมบัญชีแล้วเพื่อรับการแจ้งเตือน",

      messagingApiTitle: "LINE Messaging API",

      messagingApiDescription:
        "ใช้ Channel Access Token ของ LINE Official Account สำหรับส่ง Push Message",

      loginTitle: "การเชื่อมต่อ LINE Login",

      loginDescription:
        "LINE Login ใช้เชื่อมบัญชีผู้ดูแลระบบกับ LINE อย่างปลอดภัย โดยไม่ต้องกรอก LINE User ID ด้วยตนเอง",

      noConnectedUsers: "ยังไม่มีผู้ใช้ที่เชื่อมต่อ LINE",

      noConnectedUsersDescription:
        "ผู้ใช้จะปรากฏที่นี่หลังจากเชื่อม LINE จากหน้าบัญชี โดยจะแสดงเฉพาะผู้ใช้ที่ Active และยังเชื่อมต่ออยู่เท่านั้น",

      connected: "เชื่อมต่อแล้ว",
    },

    fields: {
      smtpHost: "SMTP Host",

      smtpPort: "SMTP Port",

      smtpSecure: "ใช้การเชื่อมต่อ SMTP แบบ Secure",

      smtpSecureDescription:
        "เปิดสำหรับ Implicit TLS ซึ่งโดยทั่วไปใช้กับ Port 465",

      smtpUsername: "ชื่อผู้ใช้งาน SMTP",

      smtpPassword: "รหัสผ่าน SMTP",

      fromName: "ชื่อผู้ส่ง",

      fromEmail: "อีเมลผู้ส่ง",

      emailRecipients: "อีเมลผู้รับแจ้งเตือน",

      lineToken: "Channel Access Token",

      lineLoginChannelId: "LINE Login Channel ID",

      lineLoginChannelSecret: "LINE Login Channel Secret",

      lineRecipients: "ผู้รับแจ้งเตือนทาง LINE",
    },

    placeholders: {
      smtpPassword: "กรอกรหัสผ่าน SMTP",

      lineToken: "กรอก Channel Access Token จาก LINE Messaging API",

      lineLoginChannelSecret: "กรอก Channel Secret จาก LINE Login",

      secretConfigured: "มีข้อมูลลับบันทึกไว้แล้ว เว้นว่างไว้เพื่อใช้ค่าเดิม",

      emailRecipients: "sales@hcsthailand.com\nsupport@hcsthailand.com",
    },

    hints: {
      secret: "เว้นว่างไว้หากไม่ต้องการเปลี่ยนข้อมูลลับที่บันทึกไว้",

      multipleValues:
        "กรอกหนึ่งรายการต่อหนึ่งบรรทัด หรือคั่นด้วย comma หรือ semicolon",

      lineRecipients:
        "สามารถเลือกได้เฉพาะผู้ใช้สถานะ Active ที่เชื่อมบัญชี LINE แล้ว",
    },

    status: {
      passwordConfigured: "ตั้งค่ารหัสผ่าน SMTP แล้ว",

      passwordMissing: "ยังไม่ได้ตั้งค่ารหัสผ่าน SMTP",

      tokenConfigured: "ตั้งค่า LINE Token แล้ว",

      tokenMissing: "ยังไม่ได้ตั้งค่า LINE Token",

      loginSecretConfigured: "ตั้งค่า LINE Login Secret แล้ว",

      loginSecretMissing: "ยังไม่ได้ตั้งค่า LINE Login Secret",
    },

    actions: {
      testEmail: "ส่งอีเมลทดสอบ",

      testingEmail: "กำลังส่งอีเมลทดสอบ...",

      testLine: "ส่ง LINE ทดสอบ",

      testingLine: "กำลังส่ง LINE ทดสอบ...",

      reloadUsers: "โหลดรายชื่อใหม่",
    },

    messages: {
      saveBeforeTest: "กรุณาบันทึกการตั้งค่าก่อนทดสอบ",

      recipientRequired: "กรุณากรอกอีเมลผู้รับแจ้งเตือนอย่างน้อยหนึ่งรายการ",

      lineRecipientRequired:
        "กรุณาเลือกผู้ใช้ที่เชื่อม LINE แล้วอย่างน้อยหนึ่งคน",

      emailTestSent: "ส่งอีเมลทดสอบไปยัง {{email}} สำเร็จ",

      emailTestFailed: "ไม่สามารถส่งอีเมลทดสอบได้",

      lineTestSent: "ส่ง LINE ทดสอบสำเร็จ {{count}} คน",

      lineTestFailed: "ไม่สามารถส่ง LINE ทดสอบได้",

      lineRecipientsLoadFailed: "ไม่สามารถโหลดรายชื่อผู้ใช้ที่เชื่อม LINE ได้",
    },
  },

  language: {
    english: "ภาษาอังกฤษ",

    thai: "ภาษาไทย",
  },

  fields: {
    displayName: "ชื่อที่ใช้แสดง",

    legalName: "ชื่อบริษัทตามกฎหมาย",

    tagline: "ข้อความแนะนำบริษัท",

    description: "รายละเอียดบริษัท",

    registrationNumber: "เลขทะเบียนบริษัท",

    foundedYear: "ปีที่ก่อตั้ง",

    phone: "เบอร์โทรศัพท์หลัก",

    secondaryPhone: "เบอร์โทรศัพท์สำรอง",

    email: "อีเมลทั่วไป",

    salesEmail: "อีเมลฝ่ายขาย",

    address: "ที่อยู่",

    googleMapsUrl: "ลิงก์ Google Maps",

    googleMapsEmbedUrl: "ลิงก์ Google Maps Embed",

    lineId: "LINE ID",

    businessHours: "เวลาทำการ",

    facebook: "ลิงก์ Facebook",

    instagram: "ลิงก์ Instagram",

    youtube: "ลิงก์ YouTube",

    linkedin: "ลิงก์ LinkedIn",

    line: "ลิงก์ LINE",

    primaryColor: "สีหลัก",

    secondaryColor: "สีรอง",

    logoPrimary: "โลโก้สีหลัก",

    logoWhite: "โลโก้สีขาว",

    defaultOgImage: "รูป Open Graph เริ่มต้น",

    indexable: "อนุญาตให้ Search Engine จัดทำดัชนี",

    indexableDescription:
      "Search Engine สามารถเก็บและแสดงเว็บไซต์ Public ในผลการค้นหาได้",

    seoTitle: "ชื่อ SEO",

    seoDescription: "คำอธิบาย SEO",

    seoKeywords: "คำค้นหา SEO",

    googleSiteVerification: "รหัสยืนยัน Google",

    bingSiteVerification: "รหัสยืนยัน Bing",

    googleAnalyticsMeasurementId: "Google Analytics Measurement ID",
  },

  placeholders: {
    displayName: "HCS Thailand",

    legalName: "บริษัท เอชซีเอส (ประเทศไทย) จำกัด",

    tagline: "อุปกรณ์ประตูและระบบรักษาความปลอดภัย",

    description: "อธิบายข้อมูลบริษัทและบริการ",

    registrationNumber: "เลขทะเบียนนิติบุคคล",

    foundedYear: "2020",

    phone: "+66 2 038 9650",

    secondaryPhone: "เบอร์โทรศัพท์เพิ่มเติม",

    email: "info@hcsthailand.com",

    salesEmail: "sales@hcsthailand.com",

    address: "ที่อยู่บริษัท",

    googleMapsUrl: "https://maps.google.com/...",

    googleMapsEmbedUrl: "https://www.google.com/maps/embed?...",

    lineId: "@hcsthailand",

    businessHours: "วันจันทร์ – วันศุกร์ เวลา 08:30 – 17:30 น.",

    socialUrl: "https://...",

    logoPath: "/images/brand/...",

    ogImagePath: "/images/seo/...",

    seoTitle: "ชื่อหน้าที่แสดงบน Search Engine",

    seoDescription: "คำอธิบายสั้นที่แสดงบน Search Engine",

    seoKeywords: "อุปกรณ์ประตู, โช้คอัพประตู, ระบบรักษาความปลอดภัย",

    googleSiteVerification: "รหัสยืนยันจาก Google",

    bingSiteVerification: "รหัสยืนยันจาก Bing",

    googleAnalyticsMeasurementId: "G-XXXXXXXXXX",
  },

  hints: {
    localized: "กรอกเนื้อหาภาษาอังกฤษและภาษาไทยแยกจากกัน",

    keywords: "คั่นคำค้นหาแต่ละคำด้วย comma และใส่ได้สูงสุด 30 คำ",

    seoAutoFill:
      "หากเว้นว่าง ระบบจะสร้างค่าจากชื่อบริษัท Tagline และรายละเอียดบริษัทโดยอัตโนมัติ",

    imagePath: "ระบุ path จาก Media Library หรือ path ของรูปภายใน public",

    verification:
      "กรอกเฉพาะ verification token ไม่ต้องใส่ HTML meta tag ทั้งหมด",

    analytics:
      "การเปลี่ยน Analytics อาจต้อง Deploy ใหม่ ขึ้นอยู่กับรูปแบบการติดตั้ง Tracking",
  },

  counter: {
    title: "{{count}}/70 ตัวอักษร",

    description: "{{count}}/180 ตัวอักษร",
  },

  validation: {
    invalidUrl: "กรุณากรอก URL ให้ถูกต้อง",

    invalidEmail: "กรุณากรอกอีเมลให้ถูกต้อง",

    invalidColor: "กรุณากรอกรหัสสี Hexadecimal ให้ถูกต้อง",

    invalidYear: "กรุณากรอกปีเป็นตัวเลข 4 หลัก",
  },

  status: {
    neverUpdated: "ข้อมูลชุดนี้ยังไม่เคยถูกบันทึก",

    lastUpdated: "แก้ไขล่าสุด {{date}}",
  },
};

export default siteSettingsTh;
