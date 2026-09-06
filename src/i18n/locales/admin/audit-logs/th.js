const auditLogsTh = {
  eyebrow: "กิจกรรมในระบบ",
  title: "ประวัติการใช้งาน",
  description: "ตรวจสอบการเข้าสู่ระบบและการเปลี่ยนแปลงข้อมูลโดยผู้ดูแลระบบ",

  filters: {
    action: "การดำเนินการ",
    entityType: "ประเภทข้อมูล",
    actorUid: "UID ผู้ใช้งาน",
    dateFrom: "ตั้งแต่วันที่",
    dateTo: "ถึงวันที่",
    allActions: "ทุกการดำเนินการ",
    allEntities: "ทุกประเภทข้อมูล",
    actorPlaceholder: "Firebase user UID",
    apply: "ใช้ตัวกรอง",
    reset: "ล้างตัวกรอง",
  },

  table: {
    date: "วันที่",
    user: "ผู้ใช้งาน",
    action: "การดำเนินการ",
    entity: "ข้อมูล",
    source: "แหล่งที่มา",
    details: "รายละเอียด",
    unknownUser: "ไม่ทราบผู้ใช้งาน",
    system: "ระบบ",
    view: "ดู",
  },

  actions: {
    AUTH_LOGIN: "เข้าสู่ระบบ",
    AUTH_LOGOUT: "ออกจากระบบ",
    USER_CREATE: "สร้างผู้ดูแลระบบ",
    USER_UPDATE: "แก้ไขผู้ดูแลระบบ",
    USER_DELETE: "ลบผู้ดูแลระบบ",
    USER_RESTORE: "กู้คืนผู้ดูแลระบบ",
    USER_PREFERENCE_UPDATE: "แก้ไขการตั้งค่า",
    SITE_SETTINGS_CREATE: "สร้างข้อมูลเว็บไซต์",
    SITE_SETTINGS_UPDATE: "แก้ไขข้อมูลเว็บไซต์",
  },

  entities: {
    auth: "การเข้าสู่ระบบ",
    user: "ผู้ดูแลระบบ",
    siteSettings: "ข้อมูลเว็บไซต์",
    page: "หน้าเว็บไซต์",
    category: "หมวดหมู่",
    product: "สินค้า",
    solution: "โซลูชัน",
    project: "โครงการ",
    standard: "มาตรฐาน",
    download: "ไฟล์ดาวน์โหลด",
    media: "ไฟล์สื่อ",
    message: "ข้อความ",
    trash: "ถังขยะ",
  },

  details: {
    title: "รายละเอียดกิจกรรม",
    action: "การดำเนินการ",
    entity: "ข้อมูล",
    entityId: "Document ID",
    actor: "ดำเนินการโดย",
    date: "วันที่และเวลา",
    ipAddress: "IP Address",
    userAgent: "User Agent",
    changes: "รายการเปลี่ยนแปลง",
    before: "ข้อมูลเดิม",
    after: "ข้อมูลใหม่",
    noChanges: "ไม่มีรายละเอียดการเปลี่ยนแปลง",
    close: "ปิด",
  },

  pagination: {
    showing: "กำลังแสดง {{count}} รายการ",
    loadMore: "โหลดเพิ่มเติม",
    loading: "กำลังโหลด...",
    end: "ไม่มีข้อมูลเพิ่มเติม",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดประวัติการใช้งานได้",
    noResults: "ไม่พบประวัติการใช้งานที่ตรงกับตัวกรอง",
  },
};

export default auditLogsTh;
