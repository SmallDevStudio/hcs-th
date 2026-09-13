export const LEGAL_PAGE_TYPES = Object.freeze({
  PRIVACY: "privacy",
  TERMS: "terms",
});

const privacyContent = {
  en: {
    eyebrow: "Legal & Privacy",

    title: "Privacy Policy",

    description:
      "This Privacy Policy explains how HCS collects, uses, discloses and protects personal information when you visit our website or contact us.",

    effectiveDate: "Effective date: September 13, 2026",

    introduction: [
      "HCS respects your privacy and is committed to protecting personal information in accordance with applicable data protection laws.",
      "This policy applies to information collected through this website, contact forms, product and project enquiries, and other communications submitted to HCS.",
    ],

    sections: [
      {
        id: "information-we-collect",

        title: "1. Information we collect",

        paragraphs: [
          "We may collect personal information that you provide directly when submitting an enquiry, requesting product information, asking for technical support, or otherwise communicating with us.",
        ],

        items: [
          "Name, company name and job title",
          "Email address and telephone number",
          "Address, project location or delivery-related information",
          "Product, specification and project requirements",
          "Files or documents attached to an enquiry",
          "Communications and correspondence with HCS",
          "Technical information such as IP address, browser type, device information and website usage data",
        ],
      },

      {
        id: "collection-methods",

        title: "2. How we collect information",

        paragraphs: [
          "We collect information directly from you, automatically through website technologies, and where appropriate from business partners or publicly available business sources.",
          "You may choose not to provide certain information. However, this may prevent us from responding to an enquiry or providing a requested service.",
        ],

        items: [],
      },

      {
        id: "purposes",

        title: "3. Purposes of processing",

        paragraphs: [
          "We use personal information only where necessary for legitimate business operations, to respond to your request, to perform a contract, to comply with legal obligations, or where you have provided consent.",
        ],

        items: [
          "Responding to product, sales, technical and project enquiries",
          "Preparing quotations, specifications and project recommendations",
          "Providing customer service and technical support",
          "Managing business relationships and communications",
          "Improving our website, products and services",
          "Maintaining website security and preventing misuse",
          "Complying with legal, regulatory, accounting and audit requirements",
          "Sending marketing information where permitted by law or consented to by you",
        ],
      },

      {
        id: "cookies",

        title: "4. Cookies and website technologies",

        paragraphs: [
          "The website may use essential cookies required for security and operation, as well as analytics technologies used to understand website performance.",
          "Where legally required, optional cookies will be used only after obtaining your consent. You can manage cookies through your browser settings, although disabling essential cookies may affect website functionality.",
        ],

        items: [],
      },

      {
        id: "disclosure",

        title: "5. Disclosure of personal information",

        paragraphs: [
          "We do not sell personal information. We may disclose information only where reasonably necessary to operate our business, deliver requested services, or comply with legal obligations.",
        ],

        items: [
          "HCS employees and authorised personnel who need the information",
          "IT, hosting, cloud storage, analytics and communications providers",
          "Professional advisers, auditors and insurers",
          "Manufacturers, distributors or project partners where required to fulfil your request",
          "Government authorities, regulators or law-enforcement agencies where required by law",
          "A successor organisation involved in a lawful merger, restructuring or transfer of business",
        ],
      },

      {
        id: "international-transfer",

        title: "6. International transfer",

        paragraphs: [
          "Some service providers or business partners may process information outside Thailand. Where this occurs, HCS will take reasonable steps to ensure appropriate protection and safeguards are applied in accordance with applicable law.",
        ],

        items: [],
      },

      {
        id: "retention",

        title: "7. Retention of information",

        paragraphs: [
          "We retain personal information only for as long as necessary for the purpose for which it was collected, for the duration of a business relationship, and for any additional period required by legal, accounting, audit or dispute-resolution obligations.",
          "When information is no longer required, it will be deleted, destroyed or anonymised using reasonable measures.",
        ],

        items: [],
      },

      {
        id: "security",

        title: "8. Information security",

        paragraphs: [
          "We use reasonable administrative, technical and organisational safeguards designed to protect personal information against accidental loss, unauthorised access, disclosure, alteration or destruction.",
          "No internet transmission or storage system can be guaranteed to be completely secure. You should avoid sending unnecessary sensitive information through general website forms.",
        ],

        items: [],
      },

      {
        id: "rights",

        title: "9. Your rights",

        paragraphs: [
          "Subject to applicable law and any permitted limitations, you may request to exercise rights relating to your personal information.",
        ],

        items: [
          "Request access to and a copy of your personal information",
          "Request correction of inaccurate or incomplete information",
          "Request deletion, destruction or anonymisation",
          "Request restriction of processing",
          "Object to certain processing",
          "Request transfer of information where applicable",
          "Withdraw consent where processing is based on consent",
          "Submit a complaint to the relevant data protection authority",
        ],
      },

      {
        id: "children",

        title: "10. Children’s information",

        paragraphs: [
          "This website is intended for business and professional audiences and is not directed to children. We do not knowingly request personal information from children through this website.",
        ],

        items: [],
      },

      {
        id: "third-party-links",

        title: "11. Third-party links",

        paragraphs: [
          "The website may contain links to third-party websites. HCS is not responsible for the content, security or privacy practices of those websites. You should review their policies before providing personal information.",
        ],

        items: [],
      },

      {
        id: "changes",

        title: "12. Changes to this policy",

        paragraphs: [
          "We may update this Privacy Policy when our practices, services or legal obligations change. The latest version will be published on this page together with its effective date.",
        ],

        items: [],
      },

      {
        id: "contact",

        title: "13. Contact us",

        paragraphs: [
          "For questions about this policy or to exercise your data protection rights, please contact HCS through the contact details shown below or through our Contact page.",
        ],

        items: [],
      },
    ],

    contactAction: "Contact HCS",

    backAction: "Back to home",
  },

  th: {
    eyebrow: "กฎหมายและความเป็นส่วนตัว",

    title: "นโยบายความเป็นส่วนตัว",

    description:
      "นโยบายนี้อธิบายวิธีที่ HCS เก็บรวบรวม ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคล เมื่อท่านเข้าชมเว็บไซต์หรือติดต่อเรา",

    effectiveDate: "มีผลใช้บังคับวันที่ 13 กันยายน 2569",

    introduction: [
      "HCS ให้ความสำคัญกับความเป็นส่วนตัวและมุ่งมั่นคุ้มครองข้อมูลส่วนบุคคลตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลที่ใช้บังคับ",
      "นโยบายนี้ใช้กับข้อมูลที่เก็บผ่านเว็บไซต์ แบบฟอร์มติดต่อ การสอบถามสินค้าและโครงการ รวมถึงการติดต่อสื่อสารอื่นที่ส่งถึง HCS",
    ],

    sections: [
      {
        id: "information-we-collect",

        title: "1. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม",

        paragraphs: [
          "เราอาจเก็บข้อมูลส่วนบุคคลที่ท่านให้แก่เราโดยตรง เมื่อส่งคำถาม ขอข้อมูลผลิตภัณฑ์ ขอรับการสนับสนุนทางเทคนิค หรือติดต่อกับเราในรูปแบบอื่น",
        ],

        items: [
          "ชื่อ นามสกุล ชื่อบริษัท และตำแหน่งงาน",
          "อีเมลและหมายเลขโทรศัพท์",
          "ที่อยู่ สถานที่ตั้งโครงการ หรือข้อมูลเกี่ยวกับการจัดส่ง",
          "ความต้องการด้านสินค้า ข้อกำหนดทางเทคนิค และรายละเอียดโครงการ",
          "ไฟล์หรือเอกสารที่แนบมากับคำขอ",
          "ประวัติการติดต่อสื่อสารกับ HCS",
          "ข้อมูลทางเทคนิค เช่น IP address ประเภทเบราว์เซอร์ อุปกรณ์ และข้อมูลการใช้งานเว็บไซต์",
        ],
      },

      {
        id: "collection-methods",

        title: "2. วิธีการเก็บรวบรวมข้อมูล",

        paragraphs: [
          "เราเก็บข้อมูลจากท่านโดยตรง เก็บโดยอัตโนมัติผ่านเทคโนโลยีของเว็บไซต์ และในกรณีที่เหมาะสมอาจได้รับจากคู่ค้าทางธุรกิจหรือแหล่งข้อมูลทางธุรกิจที่เปิดเผยต่อสาธารณะ",
          "ท่านสามารถเลือกไม่ให้ข้อมูลบางประเภทได้ แต่อาจทำให้เราไม่สามารถตอบคำถามหรือให้บริการตามที่ร้องขอได้อย่างครบถ้วน",
        ],

        items: [],
      },

      {
        id: "purposes",

        title: "3. วัตถุประสงค์ในการประมวลผลข้อมูล",

        paragraphs: [
          "เราใช้ข้อมูลส่วนบุคคลเท่าที่จำเป็นต่อการดำเนินธุรกิจ เพื่อตอบคำขอของท่าน เพื่อปฏิบัติตามสัญญา เพื่อปฏิบัติตามกฎหมาย หรือเมื่อได้รับความยินยอมจากท่าน",
        ],

        items: [
          "ตอบคำถามเกี่ยวกับสินค้า การขาย เทคนิค และโครงการ",
          "จัดทำใบเสนอราคา ข้อกำหนด และคำแนะนำสำหรับโครงการ",
          "ให้บริการลูกค้าและการสนับสนุนทางเทคนิค",
          "บริหารความสัมพันธ์และการติดต่อทางธุรกิจ",
          "ปรับปรุงเว็บไซต์ ผลิตภัณฑ์ และบริการ",
          "รักษาความปลอดภัยของเว็บไซต์และป้องกันการใช้งานโดยมิชอบ",
          "ปฏิบัติตามกฎหมาย ระเบียบ บัญชี และการตรวจสอบ",
          "ส่งข้อมูลทางการตลาดเมื่อกฎหมายอนุญาตหรือได้รับความยินยอม",
        ],
      },

      {
        id: "cookies",

        title: "4. คุกกี้และเทคโนโลยีเว็บไซต์",

        paragraphs: [
          "เว็บไซต์อาจใช้คุกกี้ที่จำเป็นต่อความปลอดภัยและการทำงาน รวมถึงเทคโนโลยีวิเคราะห์เพื่อทำความเข้าใจประสิทธิภาพของเว็บไซต์",
          "ในกรณีที่กฎหมายกำหนด เราจะใช้คุกกี้ทางเลือกเมื่อได้รับความยินยอมแล้ว ท่านสามารถจัดการคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ แต่การปิดคุกกี้ที่จำเป็นอาจส่งผลต่อการทำงานของเว็บไซต์",
        ],

        items: [],
      },

      {
        id: "disclosure",

        title: "5. การเปิดเผยข้อมูลส่วนบุคคล",

        paragraphs: [
          "เราไม่ขายข้อมูลส่วนบุคคล และจะเปิดเผยข้อมูลเมื่อมีความจำเป็นอย่างสมเหตุสมผลต่อการดำเนินงาน การให้บริการตามคำขอ หรือการปฏิบัติตามกฎหมาย",
        ],

        items: [
          "พนักงานและบุคลากรที่ได้รับอนุญาตของ HCS",
          "ผู้ให้บริการด้านไอที โฮสติ้ง ระบบคลาวด์ การวิเคราะห์ และการสื่อสาร",
          "ที่ปรึกษาวิชาชีพ ผู้ตรวจสอบบัญชี และบริษัทประกัน",
          "ผู้ผลิต ผู้จัดจำหน่าย หรือพันธมิตรโครงการที่จำเป็นต่อการดำเนินการตามคำขอ",
          "หน่วยงานรัฐ หน่วยงานกำกับดูแล หรือเจ้าหน้าที่ตามที่กฎหมายกำหนด",
          "องค์กรผู้รับช่วงธุรกิจจากการควบรวม ปรับโครงสร้าง หรือโอนธุรกิจโดยชอบด้วยกฎหมาย",
        ],
      },

      {
        id: "international-transfer",

        title: "6. การส่งข้อมูลไปต่างประเทศ",

        paragraphs: [
          "ผู้ให้บริการหรือพันธมิตรทางธุรกิจบางรายอาจประมวลผลข้อมูลนอกประเทศไทย ในกรณีดังกล่าว HCS จะดำเนินมาตรการที่สมเหตุสมผลเพื่อให้ข้อมูลได้รับการคุ้มครองตามกฎหมายที่ใช้บังคับ",
        ],

        items: [],
      },

      {
        id: "retention",

        title: "7. ระยะเวลาการเก็บรักษาข้อมูล",

        paragraphs: [
          "เราเก็บข้อมูลส่วนบุคคลตราบเท่าที่จำเป็นตามวัตถุประสงค์ที่เก็บข้อมูล ตลอดระยะเวลาความสัมพันธ์ทางธุรกิจ และตามระยะเวลาเพิ่มเติมที่กฎหมาย บัญชี การตรวจสอบ หรือการระงับข้อพิพาทกำหนด",
          "เมื่อหมดความจำเป็น เราจะลบ ทำลาย หรือทำให้ข้อมูลไม่สามารถระบุตัวบุคคลได้ด้วยมาตรการที่เหมาะสม",
        ],

        items: [],
      },

      {
        id: "security",

        title: "8. การรักษาความมั่นคงปลอดภัย",

        paragraphs: [
          "เราใช้มาตรการด้านการบริหาร เทคนิค และองค์กรที่สมเหตุสมผล เพื่อป้องกันข้อมูลจากการสูญหาย การเข้าถึง เปิดเผย แก้ไข หรือทำลายโดยไม่ได้รับอนุญาต",
          "อย่างไรก็ตาม การส่งหรือจัดเก็บข้อมูลผ่านอินเทอร์เน็ตไม่สามารถรับประกันความปลอดภัยได้ทั้งหมด ท่านจึงไม่ควรส่งข้อมูลอ่อนไหวที่ไม่จำเป็นผ่านแบบฟอร์มทั่วไป",
        ],

        items: [],
      },

      {
        id: "rights",

        title: "9. สิทธิของเจ้าของข้อมูลส่วนบุคคล",

        paragraphs: [
          "ภายใต้กฎหมายและข้อจำกัดที่กฎหมายอนุญาต ท่านอาจร้องขอใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่านได้",
        ],

        items: [
          "ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคล",
          "ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วน",
          "ขอลบ ทำลาย หรือทำให้ข้อมูลไม่สามารถระบุตัวบุคคลได้",
          "ขอระงับการประมวลผล",
          "คัดค้านการประมวลผลบางประเภท",
          "ขอรับหรือโอนย้ายข้อมูลเมื่อสามารถใช้สิทธิดังกล่าวได้",
          "ถอนความยินยอมเมื่อการประมวลผลอาศัยความยินยอม",
          "ร้องเรียนต่อหน่วยงานคุ้มครองข้อมูลส่วนบุคคลที่เกี่ยวข้อง",
        ],
      },

      {
        id: "children",

        title: "10. ข้อมูลของผู้เยาว์",

        paragraphs: [
          "เว็บไซต์นี้จัดทำสำหรับผู้ใช้งานทางธุรกิจและวิชาชีพ มิได้มุ่งหมายสำหรับผู้เยาว์ และเราไม่มีเจตนาเก็บข้อมูลส่วนบุคคลของผู้เยาว์ผ่านเว็บไซต์นี้",
        ],

        items: [],
      },

      {
        id: "third-party-links",

        title: "11. ลิงก์ไปยังเว็บไซต์ภายนอก",

        paragraphs: [
          "เว็บไซต์อาจมีลิงก์ไปยังเว็บไซต์ของบุคคลภายนอก HCS ไม่รับผิดชอบต่อเนื้อหา ความปลอดภัย หรือนโยบายความเป็นส่วนตัวของเว็บไซต์ดังกล่าว ท่านควรตรวจสอบนโยบายก่อนให้ข้อมูล",
        ],

        items: [],
      },

      {
        id: "changes",

        title: "12. การเปลี่ยนแปลงนโยบาย",

        paragraphs: [
          "เราอาจปรับปรุงนโยบายนี้เมื่อแนวปฏิบัติ บริการ หรือหน้าที่ตามกฎหมายเปลี่ยนแปลง โดยจะเผยแพร่ฉบับล่าสุดและวันที่มีผลใช้บังคับไว้บนหน้านี้",
        ],

        items: [],
      },

      {
        id: "contact",

        title: "13. ติดต่อเรา",

        paragraphs: [
          "หากมีคำถามเกี่ยวกับนโยบายนี้ หรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล กรุณาติดต่อ HCS ผ่านข้อมูลติดต่อด้านล่างหรือผ่านหน้าติดต่อเรา",
        ],

        items: [],
      },
    ],

    contactAction: "ติดต่อ HCS",

    backAction: "กลับหน้าหลัก",
  },
};

const termsContent = {
  en: {
    eyebrow: "Legal Information",

    title: "Terms of Use",

    description:
      "These Terms of Use govern access to and use of the HCS website, information, documents and other content made available through it.",

    effectiveDate: "Effective date: September 13, 2026",

    introduction: [
      "By accessing or using this website, you acknowledge that you have read and agree to these Terms of Use.",
      "If you do not agree with these terms, please discontinue use of the website.",
    ],

    sections: [
      {
        id: "website-purpose",

        title: "1. Website purpose",

        paragraphs: [
          "This website provides general corporate, product, technical, project and contact information about HCS. Website content is provided for general information and enquiry purposes.",
        ],

        items: [],
      },

      {
        id: "no-offer",

        title: "2. Product information and quotations",

        paragraphs: [
          "Product descriptions, images, dimensions, finishes, specifications and availability shown on the website may be changed without notice and do not constitute a binding offer.",
          "A purchase, supply or project commitment becomes binding only when confirmed through an authorised quotation, order confirmation, contract or other written agreement issued by HCS.",
        ],

        items: [],
      },

      {
        id: "technical-information",

        title: "3. Technical information",

        paragraphs: [
          "Technical information is provided as general guidance. Product suitability depends on the door assembly, installation environment, applicable standards, project requirements and other conditions.",
          "Users should obtain professional advice and written confirmation from HCS before specifying, purchasing or installing a product.",
        ],

        items: [],
      },

      {
        id: "acceptable-use",

        title: "4. Acceptable use",

        paragraphs: [
          "You agree to use this website only for lawful purposes and in a manner that does not damage, disable or compromise the website or interfere with other users.",
        ],

        items: [
          "Do not attempt unauthorised access to systems, accounts or data",
          "Do not introduce malware, harmful code or automated attacks",
          "Do not scrape or systematically extract website content without permission",
          "Do not misrepresent your identity or submit false information",
          "Do not use website content for unlawful, deceptive or infringing activities",
        ],
      },

      {
        id: "intellectual-property",

        title: "5. Intellectual property",

        paragraphs: [
          "Unless otherwise stated, website content—including text, graphics, photographs, drawings, product information, documents, logos and design—is owned by or licensed to HCS and protected by applicable intellectual property laws.",
          "You may view or download content for legitimate internal evaluation or project-reference purposes. Content may not be reproduced, distributed, modified, commercially exploited or publicly displayed without prior written permission.",
        ],

        items: [],
      },

      {
        id: "third-party-content",

        title: "6. Third-party content and links",

        paragraphs: [
          "References and links to third-party products, standards, manufacturers or websites are provided for convenience. HCS does not control and is not responsible for external content, availability, security or privacy practices.",
        ],

        items: [],
      },

      {
        id: "availability",

        title: "7. Website availability",

        paragraphs: [
          "We aim to maintain reliable website access but do not guarantee uninterrupted, error-free or secure availability. We may modify, suspend or discontinue any part of the website without notice.",
        ],

        items: [],
      },

      {
        id: "disclaimer",

        title: "8. Disclaimer",

        paragraphs: [
          "To the extent permitted by law, website content is provided on an “as available” basis without warranties regarding completeness, accuracy, suitability, availability or fitness for a particular purpose.",
          "Nothing in these terms excludes a right or liability that cannot lawfully be excluded.",
        ],

        items: [],
      },

      {
        id: "liability",

        title: "9. Limitation of liability",

        paragraphs: [
          "To the extent permitted by law, HCS will not be liable for indirect, incidental, consequential or special loss arising from use of, inability to use, or reliance on this website.",
          "Users remain responsible for independently verifying information before making commercial, technical, safety or installation decisions.",
        ],

        items: [],
      },

      {
        id: "privacy",

        title: "10. Privacy",

        paragraphs: [
          "Personal information submitted through the website is handled in accordance with our Privacy Policy.",
        ],

        items: [],
      },

      {
        id: "changes",

        title: "11. Changes to these terms",

        paragraphs: [
          "We may update these Terms of Use from time to time. The updated version becomes effective when published on this page unless otherwise stated.",
        ],

        items: [],
      },

      {
        id: "governing-law",

        title: "12. Governing law",

        paragraphs: [
          "These terms are governed by the laws of Thailand. Disputes relating to this website will be subject to the jurisdiction of the competent courts of Thailand, unless otherwise required by applicable law.",
        ],

        items: [],
      },

      {
        id: "contact",

        title: "13. Contact",

        paragraphs: [
          "If you have questions about these Terms of Use, please contact HCS through the Contact page.",
        ],

        items: [],
      },
    ],

    contactAction: "Contact HCS",

    backAction: "Back to home",
  },

  th: {
    eyebrow: "ข้อมูลทางกฎหมาย",

    title: "ข้อกำหนดการใช้งาน",

    description:
      "ข้อกำหนดนี้ใช้กับการเข้าถึงและใช้งานเว็บไซต์ ข้อมูล เอกสาร และเนื้อหาอื่นที่ HCS เผยแพร่ผ่านเว็บไซต์",

    effectiveDate: "มีผลใช้บังคับวันที่ 13 กันยายน 2569",

    introduction: [
      "เมื่อเข้าถึงหรือใช้งานเว็บไซต์นี้ ถือว่าท่านได้รับทราบและยอมรับข้อกำหนดการใช้งานฉบับนี้",
      "หากท่านไม่ยอมรับข้อกำหนด กรุณาหยุดใช้งานเว็บไซต์",
    ],

    sections: [
      {
        id: "website-purpose",

        title: "1. วัตถุประสงค์ของเว็บไซต์",

        paragraphs: [
          "เว็บไซต์นี้ให้ข้อมูลทั่วไปเกี่ยวกับบริษัท ผลิตภัณฑ์ เทคนิค โครงการ และช่องทางติดต่อของ HCS เพื่อประกอบการศึกษาและสอบถามข้อมูล",
        ],

        items: [],
      },

      {
        id: "no-offer",

        title: "2. ข้อมูลสินค้าและใบเสนอราคา",

        paragraphs: [
          "รายละเอียดสินค้า รูปภาพ ขนาด สีผิว ข้อกำหนด และสถานะสินค้าบนเว็บไซต์อาจเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า และไม่ถือเป็นข้อเสนอที่มีผลผูกพัน",
          "การซื้อขาย การจัดหา หรือข้อผูกพันของโครงการจะมีผลเมื่อได้รับการยืนยันผ่านใบเสนอราคา ใบยืนยันคำสั่งซื้อ สัญญา หรือข้อตกลงเป็นลายลักษณ์อักษรจากผู้มีอำนาจของ HCS",
        ],

        items: [],
      },

      {
        id: "technical-information",

        title: "3. ข้อมูลทางเทคนิค",

        paragraphs: [
          "ข้อมูลทางเทคนิคเป็นคำแนะนำทั่วไป ความเหมาะสมของสินค้าขึ้นอยู่กับชุดประตู สภาพแวดล้อมการติดตั้ง มาตรฐาน ข้อกำหนดของโครงการ และเงื่อนไขอื่น",
          "ผู้ใช้งานควรขอคำแนะนำจากผู้เชี่ยวชาญและการยืนยันเป็นลายลักษณ์อักษรจาก HCS ก่อนระบุสเปก สั่งซื้อ หรือติดตั้งสินค้า",
        ],

        items: [],
      },

      {
        id: "acceptable-use",

        title: "4. การใช้งานที่ยอมรับได้",

        paragraphs: [
          "ท่านตกลงใช้เว็บไซต์เพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมาย และไม่ดำเนินการที่ทำให้เว็บไซต์เสียหาย หยุดทำงาน ไม่ปลอดภัย หรือรบกวนผู้ใช้งานรายอื่น",
        ],

        items: [
          "ไม่พยายามเข้าถึงระบบ บัญชี หรือข้อมูลโดยไม่ได้รับอนุญาต",
          "ไม่นำมัลแวร์ โค้ดอันตราย หรือการโจมตีอัตโนมัติเข้าสู่ระบบ",
          "ไม่เก็บหรือดึงข้อมูลเว็บไซต์อย่างเป็นระบบโดยไม่ได้รับอนุญาต",
          "ไม่แอบอ้างตัวตนหรือส่งข้อมูลอันเป็นเท็จ",
          "ไม่ใช้เนื้อหาเพื่อการกระทำที่ผิดกฎหมาย หลอกลวง หรือละเมิดสิทธิ",
        ],
      },

      {
        id: "intellectual-property",

        title: "5. ทรัพย์สินทางปัญญา",

        paragraphs: [
          "เว้นแต่ระบุเป็นอย่างอื่น เนื้อหาบนเว็บไซต์ รวมถึงข้อความ กราฟิก ภาพถ่าย แบบ ภาพผลิตภัณฑ์ เอกสาร เครื่องหมายการค้า และการออกแบบ เป็นกรรมสิทธิ์หรือได้รับอนุญาตให้ใช้โดย HCS และได้รับความคุ้มครองตามกฎหมาย",
          "ท่านอาจดูหรือดาวน์โหลดเนื้อหาเพื่อประเมินภายในหรือใช้อ้างอิงโครงการโดยชอบ แต่ห้ามทำซ้ำ แจกจ่าย แก้ไข ใช้เชิงพาณิชย์ หรือเผยแพร่ต่อสาธารณะโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร",
        ],

        items: [],
      },

      {
        id: "third-party-content",

        title: "6. เนื้อหาและลิงก์ของบุคคลภายนอก",

        paragraphs: [
          "การอ้างอิงหรือลิงก์ไปยังสินค้า มาตรฐาน ผู้ผลิต หรือเว็บไซต์ของบุคคลภายนอกจัดไว้เพื่อความสะดวก HCS ไม่ได้ควบคุมและไม่รับผิดชอบต่อเนื้อหา ความพร้อมใช้งาน ความปลอดภัย หรือนโยบายความเป็นส่วนตัวของเว็บไซต์ภายนอก",
        ],

        items: [],
      },

      {
        id: "availability",

        title: "7. ความพร้อมใช้งานของเว็บไซต์",

        paragraphs: [
          "เรามุ่งรักษาความพร้อมใช้งานของเว็บไซต์ แต่ไม่รับประกันว่าจะใช้งานได้ต่อเนื่อง ปราศจากข้อผิดพลาด หรือปลอดภัยตลอดเวลา เราอาจแก้ไข ระงับ หรือยุติบางส่วนของเว็บไซต์โดยไม่แจ้งล่วงหน้า",
        ],

        items: [],
      },

      {
        id: "disclaimer",

        title: "8. ข้อจำกัดการรับประกัน",

        paragraphs: [
          "ภายใต้ขอบเขตที่กฎหมายอนุญาต เนื้อหาเว็บไซต์ให้บริการตามสภาพที่มีอยู่ โดยไม่มีการรับประกันเกี่ยวกับความครบถ้วน ความถูกต้อง ความเหมาะสม ความพร้อมใช้งาน หรือความเหมาะสมสำหรับวัตถุประสงค์เฉพาะ",
          "ข้อกำหนดนี้ไม่ตัดสิทธิหรือความรับผิดที่กฎหมายไม่อนุญาตให้ตัดออก",
        ],

        items: [],
      },

      {
        id: "liability",

        title: "9. ข้อจำกัดความรับผิด",

        paragraphs: [
          "ภายใต้ขอบเขตที่กฎหมายอนุญาต HCS ไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายต่อเนื่อง หรือความเสียหายพิเศษจากการใช้ ไม่สามารถใช้ หรือเชื่อถือข้อมูลบนเว็บไซต์",
          "ผู้ใช้งานมีหน้าที่ตรวจสอบข้อมูลอย่างเป็นอิสระก่อนตัดสินใจด้านธุรกิจ เทคนิค ความปลอดภัย หรือการติดตั้ง",
        ],

        items: [],
      },

      {
        id: "privacy",

        title: "10. ความเป็นส่วนตัว",

        paragraphs: [
          "ข้อมูลส่วนบุคคลที่ส่งผ่านเว็บไซต์จะได้รับการจัดการตามนโยบายความเป็นส่วนตัวของเรา",
        ],

        items: [],
      },

      {
        id: "changes",

        title: "11. การเปลี่ยนแปลงข้อกำหนด",

        paragraphs: [
          "เราอาจปรับปรุงข้อกำหนดนี้เป็นครั้งคราว ฉบับที่แก้ไขจะมีผลเมื่อเผยแพร่บนหน้านี้ เว้นแต่จะกำหนดไว้เป็นอย่างอื่น",
        ],

        items: [],
      },

      {
        id: "governing-law",

        title: "12. กฎหมายที่ใช้บังคับ",

        paragraphs: [
          "ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทที่เกี่ยวข้องกับเว็บไซต์อยู่ภายใต้เขตอำนาจของศาลไทยที่มีอำนาจ เว้นแต่กฎหมายกำหนดไว้เป็นอย่างอื่น",
        ],

        items: [],
      },

      {
        id: "contact",

        title: "13. ติดต่อเรา",

        paragraphs: [
          "หากมีคำถามเกี่ยวกับข้อกำหนดนี้ กรุณาติดต่อ HCS ผ่านหน้าติดต่อเรา",
        ],

        items: [],
      },
    ],

    contactAction: "ติดต่อ HCS",

    backAction: "กลับหน้าหลัก",
  },
};

export const legalContent = Object.freeze({
  [LEGAL_PAGE_TYPES.PRIVACY]: privacyContent,
  [LEGAL_PAGE_TYPES.TERMS]: termsContent,
});

export function getLegalContent(type, locale) {
  const content = legalContent[type];

  if (!content) {
    return null;
  }

  return content[locale] || content.en;
}
