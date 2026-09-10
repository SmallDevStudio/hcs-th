const accountTh = {
  eyebrow: "บัญชีของฉัน",

  title: "บัญชีและความปลอดภัย",

  description:
    "จัดการความปลอดภัยของบัญชีและเชื่อมต่อ LINE สำหรับรับการแจ้งเตือนของผู้ดูแลระบบ",

  profile: {
    eyebrow: "ข้อมูลผู้ดูแลระบบ",

    active: "บัญชีเปิดใช้งาน",
  },

  password: {
    title: "เปลี่ยนรหัสผ่าน",

    description: "ยืนยันรหัสผ่านปัจจุบันก่อนตั้งรหัสผ่านใหม่",

    currentPassword: "รหัสผ่านปัจจุบัน",

    newPassword: "รหัสผ่านใหม่",

    confirmPassword: "ยืนยันรหัสผ่านใหม่",

    action: "เปลี่ยนรหัสผ่าน",

    changing: "กำลังเปลี่ยนรหัสผ่าน...",

    messages: {
      changed: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
    },

    errors: {
      invalidCurrentPassword: "รหัสผ่านปัจจุบันไม่ถูกต้อง",

      weakPassword: "รหัสผ่านใหม่ยังไม่ปลอดภัยเพียงพอ",

      tooManyRequests: "มีการลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่",

      reauthenticate: "กรุณายืนยันรหัสผ่านปัจจุบันอีกครั้ง",

      network: "ไม่สามารถเชื่อมต่อ Firebase ได้ กรุณาตรวจสอบอินเทอร์เน็ต",

      default: "ไม่สามารถเปลี่ยนรหัสผ่านได้",
    },
  },

  line: {
    title: "บัญชี LINE",

    description:
      "เชื่อมบัญชี LINE เพื่อรับการแจ้งเตือนของผู้ดูแลระบบ โดยไม่ต้องกรอก LINE User ID ด้วยตนเอง",

    lineAccount: "บัญชี LINE",

    connected: "เชื่อมต่อแล้ว",

    connectedDescription:
      "บัญชี LINE นี้สามารถถูกเลือกเป็นผู้รับแจ้งเตือนในหน้าตั้งค่าเว็บไซต์ได้",

    notConnected: "ยังไม่ได้เชื่อมต่อ LINE",

    notConnectedDescription:
      "เชื่อมต่อ LINE เพื่อให้บัญชีนี้ปรากฏในรายชื่อผู้รับแจ้งเตือนทาง LINE",

    connect: "เชื่อมต่อ LINE",

    disconnect: "ยกเลิกการเชื่อมต่อ",

    disconnecting: "กำลังยกเลิกการเชื่อมต่อ...",

    disconnectConfirmation:
      "ต้องการยกเลิกการเชื่อมต่อ LINE จากบัญชีผู้ดูแลระบบนี้หรือไม่?",

    messages: {
      connected: "เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว",

      disconnected: "ยกเลิกการเชื่อมต่อบัญชี LINE เรียบร้อยแล้ว",

      cancelled: "ยกเลิกขั้นตอนการเชื่อมต่อ LINE แล้ว",

      connectFailed: "ไม่สามารถเชื่อมต่อบัญชี LINE ได้",

      disconnectFailed: "ไม่สามารถยกเลิกการเชื่อมต่อบัญชี LINE ได้",
    },
  },
};

export default accountTh;
