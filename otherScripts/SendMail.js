import nodemailer from 'nodemailer'
import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const workbook = XLSX.readFile(path.join(__dirname, 'Contacts_2025_12_18.xlsx'))

const sheet = workbook.Sheets[workbook.SheetNames[0]]
const users = XLSX.utils.sheet_to_json(sheet)


const christmasTemplate = (name = 'Valued Customer') => 
`
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgb(244,244,244)">
  <tbody>
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="padding:20px">
          <tbody>
            <tr>
              <td align="center" style="padding-bottom:20px">
                <img src="https://sysnolodge.com.au/wp-content/uploads/2025/12/chrismass.gif" alt="Merry Christmas.gif" style="width:848px;max-width:100%" data-image-whitelisted="" class="CToWUd a6T" data-bit="iit" tabindex="0">
                <div class="a6S" dir="ltr" style="opacity: 0.01; left: 489.125px; top: 1471.17px;">
                  <span data-is-tooltip-wrapper="true" class="a5q" jsaction="JIbuQc:.CLIENT">
                    <button class="VYBDae-JX-I VYBDae-JX-I-ql-ay5-ays CgzRE" jscontroller="PIVayb" jsaction="click:h5M12e;clickmod:h5M12e;pointerdown:FEiYhc;pointerup:mF5Elf;pointerenter:EX0mI;pointerleave:vpvbp;pointercancel:xyn4sd;contextmenu:xexox;focus:h06R8; blur:zjh6rb;mlnRJb:fLiPzd;" data-idom-class="CgzRE" data-use-native-focus-logic="true" jsname="hRZeKc" aria-label="Download attachment Merry Christmas.gif" data-tooltip-enabled="true" data-tooltip-id="tt-c15" data-tooltip-classes="AZPksf" id="" jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTg1MjIwMTU4ODYwOTkwODMyNiJd; 43:WyJpbWFnZS9naWYiXQ..">
                      <span class="XjoK4b VYBDae-JX-UHGRz"></span>
                      <span class="UTNHae" jscontroller="LBaJxb" jsname="m9ZlFb" soy-skip="" ssk="6:RWVI5c"></span>
                      <span class="VYBDae-JX-ank-Rtc0Jf" jsname="S5tZuc" aria-hidden="true">
                        <span class="notranslate bzc-ank" aria-hidden="true">
                          <svg viewBox="0 -960 960 960" height="20" width="20" focusable="false" class=" aoH">
                            <path d="M480-336L288-528l51-51L444-474V-816h72v342L621-579l51,51L480-336ZM263.72-192Q234-192 213-213.15T192-264v-72h72v72H696v-72h72v72q0,29.7-21.16,50.85T695.96-192H263.72Z"></path>
                          </svg>
                        </span>
                      </span>
                      <div class="VYBDae-JX-ano"></div>
                    </button>
                    <div class="ne2Ple-oshW8e-J9" id="tt-c15" role="tooltip" aria-hidden="true">Download</div>
                  </span>
                  <span data-is-tooltip-wrapper="true" class="a5q" jsaction="JIbuQc:.CLIENT">
                    <button class="VYBDae-JX-I VYBDae-JX-I-ql-ay5-ays CgzRE" jscontroller="PIVayb" jsaction="click:h5M12e;clickmod:h5M12e;pointerdown:FEiYhc;pointerup:mF5Elf;pointerenter:EX0mI;pointerleave:vpvbp;pointercancel:xyn4sd;contextmenu:xexox;focus:h06R8; blur:zjh6rb;mlnRJb:fLiPzd;" data-idom-class="CgzRE" data-use-native-focus-logic="true" jsname="XVusie" aria-label="Add attachment to Drive Merry Christmas.gif" data-tooltip-enabled="true" data-tooltip-id="tt-c16" data-tooltip-classes="AZPksf" id="" jslog="54185; u014N:xr6bB,cOuCgd,SYhH9d; 1:WyIjdGhyZWFkLWY6MTg1MjIwMTU4ODYwOTkwODMyNiJd; 4:WyIjbXNnLWY6MTg1MjIwMTU4ODYwOTkwODMyNiJd; 43:WyJpbWFnZS9naWYiLDI0OTQ2ODJd">
                      <span class="XjoK4b VYBDae-JX-UHGRz"></span>
                      <span class="UTNHae" jscontroller="LBaJxb" jsname="m9ZlFb" soy-skip="" ssk="6:RWVI5c"></span>
                      <span class="VYBDae-JX-ank-Rtc0Jf" jsname="S5tZuc" aria-hidden="true">
                        <span class="notranslate bzc-ank" aria-hidden="true">
                          <svg viewBox="0 -960 960 960" height="20" width="20" focusable="false" class=" aoH">
                            <path d="M232-120q-17,0-31.5-8.5t-22.29-22.09L80.79-320.41Q73-334 73-351t8-31L329-809q8-14 22.5-22.5t31.06-8.5H577.44q16.56,0 31.06,8.5t22.42,22.37L811-500q-21-5-42-4.5T727-500L571-768H389L146-351l92,159H575q11,21.17 25.5,39.59T634-120H232Zm68-171l-27-48L445.95-641H514L624-449q-14.32,13-26.53,28.5T576-388L480-556L369-362H565q-6,17-9.5,34.7T552-291H300ZM732-144V-252H624v-72H732V-432h72v108H912v72H804v108H732Z"></path>
                          </svg>
                        </span>
                      </span>
                      <div class="VYBDae-JX-ano"></div>
                    </button>
                    <div class="ne2Ple-oshW8e-J9" id="tt-c16" role="tooltip" aria-hidden="true">Add to Drive</div>
                  </span>
                  <span data-is-tooltip-wrapper="true" class="a5q" jsaction="JIbuQc:.CLIENT">
                    <button class="VYBDae-JX-I VYBDae-JX-I-ql-ay5-ays CgzRE" jscontroller="PIVayb" jsaction="click:h5M12e;clickmod:h5M12e;pointerdown:FEiYhc;pointerup:mF5Elf;pointerenter:EX0mI;pointerleave:vpvbp;pointercancel:xyn4sd;contextmenu:xexox;focus:h06R8; blur:zjh6rb;mlnRJb:fLiPzd;" data-idom-class="CgzRE" data-use-native-focus-logic="true" jsname="wtaDCf" aria-label="Save to Photos" data-tooltip-enabled="true" data-tooltip-id="tt-c17" data-tooltip-classes="AZPksf" id="" jslog="54186; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTg1MjIwMTU4ODYwOTkwODMyNiJd; 4:WyIjbXNnLWY6MTg1MjIwMTU4ODYwOTkwODMyNiJd; 43:WyJpbWFnZS9naWYiLDI0OTQ2ODJd">
                      <span class="XjoK4b VYBDae-JX-UHGRz"></span>
                      <span class="UTNHae" jscontroller="LBaJxb" jsname="m9ZlFb" soy-skip="" ssk="6:RWVI5c"></span>
                      <span class="VYBDae-JX-ank-Rtc0Jf" jsname="S5tZuc" aria-hidden="true">
                        <span class="notranslate bzc-ank" aria-hidden="true">
                          <svg viewBox="0 -960 960 960" height="20" width="20" focusable="false" class=" aoH">
                            <path d="M463-84q-90,0-153-62.88t-63-152.7q0-40.42 14.5-77.92T303-444H135.7Q114-444 99-459.53T84-497q0-90 62.88-153t152.7-63q40.42,0 77.92,14T444-658V-824.41Q444-846 459.53-861T497-876q90,0 153,62.88t63,152.7Q713-620 698.5-583T657-516H824.3q21.7,0 36.7,15.23t15,36.74q0,17.03-2.5,33.51T866-398q-14-11-31-20t-34-15.3q1-2.7 1.5-5.2T803-444H517q4,24 14.91,45.49T561-360q-11.33,15.37-19.62,31.64T527-294q-2-3-4.81-5.14T516-303v167.3Q516-114 500.47-99T463-84ZM157-516H443q-7-53-47.8-89T300-641t-95.2,36T157-516ZM444-157V-443q-53,7-89,47.8T319-300t36,95.2T444-157Zm72-360q54.35-7.23 89.67-47.89T641-659.78t-35.33-95.09T516-803v286ZM696-84V-192H588v-72H696V-372h72v108H876v72H768V-84H696Z"></path>
                          </svg>
                        </span>
                      </span>
                      <div class="VYBDae-JX-ano"></div>
                    </button>
                    <div class="ne2Ple-oshW8e-J9" id="tt-c17" role="tooltip" aria-hidden="true">Save to Photos</div>
                  </span>
                </div>
                <br>
              </td>
            </tr>
            <tr>
              <td style="padding:0px 35px;text-align:justify;font-size:14px;line-height:1.6;font-family:Arial,sans-serif;color:rgb(51,51,51)">
                <p style="margin:0px 0px 15px;font-family:Arial,sans-serif">Hi Valued Customer,</p>
                <p style="margin:0px 0px 15px;font-family:Arial,sans-serif"> As the year comes to a close, we'd like to thank you for your continued trust and partnership with <strong style="font-family:Arial,sans-serif;color:rgb(13,43,80)">Sysnolodge</strong>. It has been a pleasure supporting you throughout the year, and we truly appreciate the opportunity to work with you. </p>
                <p style="margin:0px 0px 15px;font-family:Arial,sans-serif"> We wish you and your team a Merry Christmas and a Happy New Year. We hope you enjoy a well-deserved break with family and friends. </p>
                <p style="margin:0px 0px 15px;font-family:Arial,sans-serif"> Please note that while our office will be operating with limited availability during the holiday period from 23 <sup style="font-family:Arial,sans-serif">rd</sup> December to 4 <sup style="font-family:Arial,sans-serif">th</sup> January, we will resume operations from 5 <sup style="font-family:Arial,sans-serif">th</sup> January. However, <strong style="font-family:Arial,sans-serif;color:rgb(13,43,80)">we remain available for emergency services throughout this period</strong>. If you require urgent assistance, please email <a href="mailto:admin_support@sysnolodge.com.au" style="text-decoration:none;font-weight:bold;font-family:Arial,sans-serif;color:rgb(13,43,80)" target="_blank">admin_support@sysnolodge.com. <wbr>au </a>. </p>
                <p style="margin:0px 0px 15px;font-family:Arial,sans-serif"> Thank you once again for working with us. We look forward to continuing our partnership in the year ahead. </p>
                <p style="margin:30px 0px 0px;font-family:Arial,sans-serif"> Warm regards, <br>
                  <strong style="font-family:Arial,sans-serif;color:rgb(13,43,80)">The Sysnolodge Team</strong>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <font color="#888888"></font>
        <font color="#888888"></font>
        <table width="600" cellpadding="0" cellspacing="0" style="padding:30px 0px;background-color:rgb(6,23,173)">
          <tbody>
            <tr>
              <td align="center" style="padding:0px 35px">
                <table cellpadding="0" cellspacing="0" style="margin-bottom:20px" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:rgb(255,255,255)">Visit our Website for More Informations.</td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top:10px">
                        <a href="https://sysnolodge.com.au" style="font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;color:rgb(255,255,255)" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://sysnolodge.com.au&amp;source=gmail&amp;ust=1766483545576000&amp;usg=AOvVaw2Rc0DmN4Jeh4ENGpzud5JC">www.sysnolodge.com.au </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table cellpadding="0" cellspacing="0" style="margin-bottom:20px" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:rgb(255,255,255)"> Email: admin_support <a href="mailto:admin_support@sysnolodge.com.au" style="text-decoration:none;font-family:Arial,sans-serif;color:rgb(255,255,255)" target="_blank">@sysnolodge.com. <wbr>au </a>
                        <br>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <font color="#888888"></font>
                <font color="#888888"></font>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.7)"> © 2025 Sysnolodge. All rights reserved. <br> This email was sent to you as part of our service communications. </td>
                    </tr>
                  </tbody>
                </table>
                <font color="#888888"></font>
              </td>
            </tr>
          </tbody>
        </table>
        <font color="#888888"></font>
      </td>
    </tr>
  </tbody>
</table>
`

const createModifiedList = () =>{
    //  Filter users (non-public email domains)
    const blockedDomains = [
        '@gmail.com',
        '@yahoo.com',
        '@hotmail.com',
        '@outlook.com',
        '@zoho.com',
        '@zohocorp.com',
    ]
    const filteredUsers = users.filter(user => {
      if (!user.Email) return false

      const email = user.Email.toLowerCase();
      const fUser=!blockedDomains.some(domain => email.endsWith(domain));
      return fUser
    })

    // Create new workbook
    const newWorkbook = XLSX.utils.book_new()
    const newSheet = XLSX.utils.json_to_sheet(filteredUsers)

    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Filtered Contacts')

    //  Write to new Excel file
    const OUTPUT_FILE = path.join(__dirname, 'Modified Contact.xlsx')
    XLSX.writeFile(newWorkbook, OUTPUT_FILE)

    console.log(`✅ ${filteredUsers.length} contacts saved to "Modified Contact.xlsx"`)

}

const sendChristmasEmails = async () => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP,  
        port: 465,
        secure: true,
        auth: {
          user: process.env.SYS_EMAIL,
          pass: process.env.SYS_PASS,
        }
      })

    await transporter.verify()
    console.log('SMTP server ready')
      
    for (const user of users) {
      if (!user['Email']) continue
        
      try {
       const messageId= await transporter.sendMail({
          from: `${process.env.COMPANY} 🎄 <${process.env.SYS_EMAIL}>`,
          to: user['Email'],
          subject: '🎅 Merry Christmas from Sysnolodge',
          html: christmasTemplate(user['Contact Name']),
        })
        
        // console.log("messageId: ", messageId);
        console.log(`Sent to ${user.Email}`)
  
        await new Promise(r =>{
            setTimeout(r, 1500);
        } )
      } catch (err) {
        console.error(`Failed: ${user.Email}`, err.message)
      }
    }
  }
  
//   createModifiedList();
  // await sendChristmasEmails()


