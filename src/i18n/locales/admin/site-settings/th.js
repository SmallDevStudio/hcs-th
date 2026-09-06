const siteSettingsTh = {
  eyebrow: "ตั้งค่าเว็บไซต์",
  title: "ข้อมูลเว็บไซต์",
  description: "จัดการข้อมูลบริษัท ช่องทางติดต่อ Branding และค่า SEO เริ่มต้น",

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
