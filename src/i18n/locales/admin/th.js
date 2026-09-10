const adminTh = {
  common: {
    adminPanel: "ระบบแอดมิน",
    administration: "ระบบจัดการ HCS",
    websiteManagement: "ระบบจัดการเว็บไซต์",
    viewWebsite: "ดูหน้าเว็บไซต์",
    logout: "ออกจากระบบ",
    loggingOut: "กำลังออกจากระบบ...",
    changeLanguage: "เปลี่ยนภาษา",
    languageUpdated: "เปลี่ยนภาษาเรียบร้อยแล้ว",
    languageUpdateFailed: "ไม่สามารถบันทึกภาษาได้",
    save: "บันทึก",
    saving: "กำลังบันทึก...",
    cancel: "ยกเลิก",
    edit: "แก้ไข",
    delete: "ลบ",
    restore: "กู้คืน",
    search: "ค้นหา",
    actions: "จัดการ",
    loading: "กำลังโหลด...",
    noData: "ไม่พบข้อมูล",
  },

  roles: {
    superadmin: "ผู้ดูแลระบบสูงสุด",
    admin: "ผู้ดูแลระบบ",
    editor: "ผู้แก้ไขเนื้อหา",
  },

  navigation: {
    dashboard: "ภาพรวมระบบ",

    groups: {
      content: "จัดการเนื้อหา",
      catalog: "สินค้าและบริการ",
      business: "ข้อมูลบริษัท",
      communication: "การติดต่อ",
      system: "ระบบ",
    },

    home: "หน้าแรก",
    pages: "หน้าเว็บไซต์",
    siteSettings: "ข้อมูลเว็บไซต์",

    products: "สินค้า",
    categories: "หมวดหมู่สินค้า",
    solutions: "โซลูชัน",

    projects: "โครงการอ้างอิง",
    standards: "มาตรฐานและใบรับรอง",
    downloads: "ไฟล์ดาวน์โหลด",
    media: "คลังไฟล์และรูปภาพ",

    messages: "ข้อความติดต่อ",

    users: "ผู้ดูแลระบบ",
    userGroups: "กลุ่มสิทธิ์",
    auditLogs: "ประวัติการใช้งาน",
    trash: "ถังขยะ",
    manual: "คู่มือการใช้งาน",
  },

  header: {
    title: "ระบบจัดการเว็บไซต์",
    subtitle: "ระบบบริหารเนื้อหาเว็บไซต์ HCS Thailand",
    openNavigation: "เปิดเมนู",
    closeNavigation: "ปิดเมนู",
  },

  dashboard: {
    eyebrow: "ระบบจัดการ HCS",
    welcome: "ยินดีต้อนรับ, {{name}}",
    description:
      "จัดการข้อมูล เนื้อหา และการตั้งค่าของเว็บไซต์ HCS Thailand ได้จากระบบนี้",
    permission: "สิทธิ์ผู้ใช้งาน",

    overview: "ภาพรวม",
    overviewTitle: "ภาพรวมข้อมูลเว็บไซต์",

    statistics: {
      products: "สินค้า",
      categories: "หมวดหมู่",
      projects: "โครงการ",
      media: "ไฟล์สื่อ",
    },

    gettingStarted: "เริ่มต้นใช้งาน",
    readyTitle: "ระบบพร้อมสำหรับเริ่มสร้างโมดูลจัดการข้อมูล",
    readyDescription:
      "ตัวเลขบน Dashboard จะเชื่อมต่อกับ Firestore หลังจากสร้างโมดูลสินค้า หมวดหมู่ โครงการ และคลังไฟล์เรียบร้อยแล้ว",
  },

  login: {
    eyebrow: "ผู้ดูแลระบบ",
    title: "เข้าสู่ระบบ Admin",
    description: "กรุณาใช้อีีเมลและรหัสผ่านของผู้ดูแลระบบ",

    email: "อีเมล",
    emailPlaceholder: "admin@hcsthailand.com",
    password: "รหัสผ่าน",
    passwordPlaceholder: "กรอกรหัสผ่าน",

    submit: "เข้าสู่ระบบ",
    submitting: "กำลังเข้าสู่ระบบ...",
    restricted: "ระบบนี้สำหรับผู้ดูแลเว็บไซต์ HCS Thailand เท่านั้น",

    panelEyebrow: "ระบบจัดการเนื้อหา HCS",
    panelTitle: "จัดการเว็บไซต์",
    panelTitleHighlight: "อย่างเป็นมืออาชีพ",
    panelDescription:
      "ระบบบริหารข้อมูลเว็บไซต์ HCS Thailand สำหรับจัดการเนื้อหาและข้อมูลสำคัญจากศูนย์กลางเดียว",

    features: {
      data: {
        title: "จัดการข้อมูลทั้งหมด",
        description: "สินค้า หมวดหมู่ โครงการ ดาวน์โหลด และเนื้อหาบนเว็บไซต์",
      },
      central: {
        title: "ควบคุมเว็บไซต์จากจุดเดียว",
        description: "แก้ไขเนื้อหาภาษาอังกฤษและภาษาไทยได้อย่างเป็นระบบ",
      },
      seo: {
        title: "รองรับ SEO",
        description: "บริหาร Metadata และข้อมูลสำหรับ Search Engine",
      },
    },

    validation: {
      emailRequired: "กรุณากรอกอีเมล",
      emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
      passwordRequired: "กรุณากรอกรหัสผ่าน",
      passwordMinimum: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    },

    errors: {
      invalidCredential: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      invalidEmail: "รูปแบบอีเมลไม่ถูกต้อง",
      userDisabled: "บัญชีผู้ใช้นี้ถูกปิดใช้งาน",
      tooManyRequests:
        "มีการเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอสักครู่แล้วลองใหม่",
      network: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบอินเทอร์เน็ต",
      default: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
    },
  },

  siteSettings: {
    eyebrow: "ตั้งค่าเว็บไซต์",
    title: "ข้อมูลเว็บไซต์",
    description:
      "จัดการข้อมูลบริษัท ช่องทางติดต่อ Social Media และค่า SEO เริ่มต้น",

    tabs: {
      company: "ข้อมูลบริษัท",
      contact: "ช่องทางติดต่อ",
      social: "Social Media",
      seo: "SEO เริ่มต้น",
      integrations: "การเชื่อมต่อ",
    },
  },
  forcedPassword: {
    eyebrow: "จำเป็นต้องดำเนินการด้านความปลอดภัย",
    title: "สร้างรหัสผ่านใหม่",
    description:
      "ผู้ดูแลระบบกำหนดให้คุณเปลี่ยนรหัสผ่านเริ่มต้นก่อนเข้าใช้งานระบบ",

    account: "บัญชีผู้ดูแลระบบ",

    currentPassword: "รหัสผ่านปัจจุบัน",
    newPassword: "รหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",

    showPassword: "แสดงรหัสผ่าน",
    hidePassword: "ซ่อนรหัสผ่าน",

    requirements:
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และต้องแตกต่างจากรหัสผ่านปัจจุบัน",

    submit: "เปลี่ยนรหัสผ่าน",
    submitting: "กำลังเปลี่ยนรหัสผ่าน...",

    validation: {
      currentRequired: "กรุณากรอกรหัสผ่านปัจจุบัน",
      minimum: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร",
      maximum: "รหัสผ่านใหม่ต้องไม่เกิน 128 ตัวอักษร",
      notMatched: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
      mustBeDifferent: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
    },

    errors: {
      invalidCredential: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      weakPassword: "รหัสผ่านใหม่มีความปลอดภัยไม่เพียงพอ",
      reauthenticationRequired:
        "กรุณายืนยันรหัสผ่านปัจจุบันแล้วลองใหม่อีกครั้ง",
      network: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบอินเทอร์เน็ต",
      default: "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
    },
  },
};

export default adminTh;
