const usersTh = {
  eyebrow: "การจัดการสิทธิ์เข้าถึง",
  title: "ผู้ใช้งาน",
  description: "จัดการบัญชีผู้ดูแลระบบ บทบาท กลุ่มสิทธิ์ และสถานะการเข้าใช้งาน",

  common: {
    cancel: "ยกเลิก",
    close: "ปิด",
  },

  actions: {
    create: "เพิ่มผู้ใช้งาน",
    edit: "แก้ไขผู้ใช้งาน",
    delete: "ลบผู้ใช้งาน",
    search: "ค้นหา",
    clear: "ล้างตัวกรอง",
    refresh: "รีเฟรช",
    loadMore: "โหลดเพิ่มเติม",
    passwordReset: "รีเซ็ตรหัสผ่าน",
    myAccount: "บัญชีของฉัน",
    manageGroups: "กลุ่มสิทธิ์",
    setPassword: "ตั้งรหัสผ่าน",
  },

  filters: {
    search: "ค้นหาผู้ใช้งาน",
    searchPlaceholder: "ค้นหาจากชื่อ อีเมล บทบาท หรือกลุ่ม...",
    role: "บทบาท",
    status: "สถานะ",
    allRoles: "ทุกบทบาท",
    allStatuses: "ทุกสถานะ",
  },

  roles: {
    superadmin: "ผู้ดูแลระบบสูงสุด",
    admin: "ผู้ดูแลระบบ",
    editor: "ผู้แก้ไขข้อมูล",
  },

  statuses: {
    active: "ใช้งาน",
    inactive: "ระงับการใช้งาน",
  },

  line: {
    connected: "เชื่อมต่อแล้ว",
    disconnected: "ยังไม่เชื่อมต่อ",
  },

  table: {
    user: "ผู้ใช้งาน",
    role: "บทบาท",
    groups: "กลุ่มสิทธิ์",
    line: "LINE",
    status: "สถานะ",
    lastLogin: "เข้าใช้ล่าสุด",
    actions: "จัดการ",
    noName: "ยังไม่มีชื่อ",
    noGroups: "ไม่มีกลุ่ม",
    you: "คุณ",
  },

  empty: {
    title: "ไม่พบผู้ใช้งาน",
    description: "ยังไม่มีบัญชีผู้ดูแลระบบที่จะแสดง",
    filteredDescription:
      "ไม่พบผู้ใช้งานที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนเงื่อนไขการค้นหา",
  },

  passwordReset: {
    title: "ส่งอีเมลรีเซ็ตรหัสผ่านหรือไม่",
    text: "ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยัง {{name}}",
    confirm: "ส่งอีเมลรีเซ็ต",
  },

  delete: {
    title: "ลบผู้ใช้งานถาวรหรือไม่",
    text: "{{name}} จะไม่สามารถเข้าใช้งานระบบได้ทันที",
    permanentWarning:
      "การดำเนินการนี้จะลบบัญชี Firebase Authentication และข้อมูลผู้ใช้งานอย่างถาวร ไม่สามารถกู้คืนได้",
    confirm: "ลบถาวร",
    confirmationTitle: "ยืนยันครั้งสุดท้าย",
    confirmationLabel: 'พิมพ์คำว่า "DELETE" เพื่อยืนยันการลบถาวร',
    confirmationInvalid: 'กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง',
  },

  validation: {
    emailRequired: "กรุณาระบุอีเมล",
    displayNameRequired: "กรุณาระบุชื่อผู้ใช้งาน",
    roleRequired: "กรุณาเลือกบทบาท",
    statusRequired: "กรุณาเลือกสถานะบัญชี",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
    createSuccess: "สร้างผู้ใช้งานและส่งอีเมลสำหรับตั้งรหัสผ่านเรียบร้อยแล้ว",
    createSuccessEmailFailed:
      "สร้างผู้ใช้งานเรียบร้อยแล้ว แต่ไม่สามารถส่งอีเมลสำหรับตั้งรหัสผ่านได้",
    createFailed: "ไม่สามารถสร้างผู้ใช้งานได้",
    updateSuccess: "แก้ไขผู้ใช้งานเรียบร้อยแล้ว",
    updateFailed: "ไม่สามารถแก้ไขผู้ใช้งานได้",
    deleteSuccess: "ลบผู้ใช้งานถาวรเรียบร้อยแล้ว",
    deleteFailed: "ไม่สามารถลบผู้ใช้งานได้",
    passwordResetSent: "ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
    passwordResetEmailFailed:
      "ระบบบันทึกคำขอแล้ว แต่ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้",
    passwordResetFailed: "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้",
    passwordSetSuccess: "ตั้งรหัสผ่านให้ผู้ใช้งานเรียบร้อยแล้ว",
    passwordSetFailed: "ไม่สามารถตั้งรหัสผ่านให้ผู้ใช้งานได้",
  },

  form: {
    createEyebrow: "ผู้ดูแลระบบใหม่",
    createTitle: "เพิ่มผู้ใช้งาน",
    createDescription:
      "สร้างบัญชีผู้ดูแลระบบและกำหนดสิทธิ์ให้เหมาะสมกับหน้าที่",

    editEyebrow: "สิทธิ์การเข้าใช้งาน",
    editTitle: "แก้ไขผู้ใช้งาน",
    editDescription: "แก้ไขสถานะ บทบาท กลุ่มสิทธิ์ และสิทธิ์เฉพาะของผู้ใช้งาน",

    accountInformation: "ข้อมูลบัญชี",
    accountInformationDescription: "ข้อมูลประจำตัว ภาษา และสถานะการเข้าใช้งาน",

    email: "อีเมล",
    emailCannotChange:
      "ไม่สามารถเปลี่ยนอีเมลจากหน้านี้ได้ เนื่องจากอีเมลเชื่อมกับ Firebase Authentication",

    displayName: "ชื่อที่แสดง",
    role: "บทบาท",
    status: "สถานะ",
    preferredLocale: "ภาษาที่ต้องการใช้",

    languages: {
      th: "ภาษาไทย",
      en: "ภาษาอังกฤษ",
    },

    permissionGroups: "กลุ่มสิทธิ์",
    permissionGroupsDescription:
      "ระบบจะรวมสิทธิ์จากกลุ่มที่เปิดใช้งานเข้ากับสิทธิ์เฉพาะของผู้ใช้งาน",

    loadingGroups: "กำลังโหลดกลุ่มสิทธิ์...",
    groupsLoadFailed: "ไม่สามารถโหลดกลุ่มสิทธิ์ได้",
    noGroups: "ยังไม่มีกลุ่มสิทธิ์ให้เลือก",
    inactiveGroup: "ปิดใช้งาน",

    directPermissions: "สิทธิ์เฉพาะผู้ใช้งาน",
    directPermissionsDescription:
      "กำหนดสิทธิ์เพิ่มเติมให้ผู้ใช้งานรายนี้ นอกเหนือจากสิทธิ์ของบทบาทและกลุ่ม",

    superadminAllPermissions:
      "ผู้ดูแลระบบสูงสุดได้รับสิทธิ์จัดการระบบทั้งหมดโดยอัตโนมัติ",

    selectCategory: "เลือกทั้งหมด",
    clearCategory: "ล้าง",

    saving: "กำลังบันทึก...",
    saveChanges: "บันทึกการแก้ไข",
    createUser: "สร้างผู้ใช้งาน",
  },

  permissionCategories: {
    dashboard: "แดชบอร์ด",
    users: "ผู้ใช้งาน",
    groups: "กลุ่มสิทธิ์",
    siteSettings: "ตั้งค่าเว็บไซต์",
    pages: "หน้าเว็บไซต์",
    categories: "หมวดหมู่",
    products: "สินค้า",
    solutions: "โซลูชัน",
    projects: "โครงการ",
    standards: "มาตรฐาน",
    downloads: "ดาวน์โหลด",
    media: "คลังสื่อ",
    messages: "ข้อความติดต่อ",
    auditLogs: "ประวัติการใช้งาน",
    trash: "ถังขยะ",
  },

  permissionActions: {
    view: "ดูข้อมูล",
    create: "เพิ่มข้อมูล",
    update: "แก้ไขข้อมูล",
    delete: "ลบข้อมูล",
    publish: "เผยแพร่",
    upload: "อัปโหลด",
    restore: "กู้คืน",
    deletePermanently: "ลบถาวร",
  },
  password: {
    eyebrow: "ความปลอดภัยของบัญชี",
    title: "ตั้งรหัสผ่านผู้ใช้งาน",
    description:
      "กำหนดรหัสผ่านใหม่ให้ผู้ใช้งาน Session ที่กำลังใช้งานอยู่จะถูกยกเลิกหลังเปลี่ยนรหัสผ่าน",

    initialPassword: "รหัสผ่านเริ่มต้น",
    newPassword: "รหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่าน",

    showPassword: "แสดงรหัสผ่าน",
    hidePassword: "ซ่อนรหัสผ่าน",

    forceChange: "บังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป",
    forceChangeDescription:
      "ผู้ใช้งานสามารถเข้าสู่ระบบด้วยรหัสผ่านนี้ แต่ต้องสร้างรหัสผ่านใหม่ก่อนเข้าใช้งานระบบจัดการ",

    sessionWarning:
      "การเปลี่ยนรหัสผ่านจะยกเลิก Session เดิมที่ผู้ใช้งานกำลังใช้อยู่",

    requirements:
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และควรหลีกเลี่ยงรหัสผ่านที่คาดเดาได้ง่าย",

    saving: "กำลังบันทึกรหัสผ่าน...",
    save: "ตั้งรหัสผ่าน",

    validation: {
      minimum: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
      maximum: "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร",
      notMatched: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
    },
  },
};

export default usersTh;
