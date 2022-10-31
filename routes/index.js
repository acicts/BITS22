require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userTasks = require("../models/userTasks");
const Tasks = require("../models/tasks");
const Tests = require("../models/tests");
const Admin = require("../models/admin");
const IMP = require("../models/confidential");
const Password = require("../models/passwordReset")
const Analytics = require("../models/analytics");
const nodemailer = require("nodemailer");
const request = require('request');
const { v4: uuidv4 } = require('uuid');
const { google } = require("googleapis");

const id = process.env.REGISTER_ID;

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

const isEnabled = async (req, res, next) => {
  try {
  const data = await IMP.findOne({ power_admin: 1 });
  if(!data){
      let newData = new IMP({
      power_admin: 1,
      competition_enabled: true
    })

    newData.save((error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully added records for power admin");
      }
    })
  }
  if (!data.competition_enabled) {
    res.render("error", {
      code: "403",
      msg: "Site is undergoing a system maintenance. Check back later!",
      icon: "fa-solid fa-hammer",
      username: []
    });
  } else {
    next();
  }
    } 
           catch (e) {
              console.error('Error');
             next();
           }
};

router.get("/", isEnabled, async (req, res, next) => {
  const data = await Analytics.findOne({ analytics_id: 1043 });
  if(!data){
    let newData = new Analytics({
      total_views: 1,
      total_signup: 1,
      coding_tasks: 1,
      design_tasks: 1,
      explore_tasks: 1
    })

    newData.save((error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully added records for analytics");
      }
    })
  }

  await Analytics.updateOne({ total_views: data.total_views }, [
    {
      $set: {
        total_views: {
          $add: ["$total_views", 1],
        }
      }
    }
  ]);
   let username = [];
   if(req.session.userId) {
     username.push(req.session.username);
   }
   res.render("index.ejs", {
        username: username
   });
});

router.post("/update", (req, res, next) => {
   const time_in_sec = req.body.timeSpend / 1000;

   Analytics
        .findOne({ analytics_id: 1043 })
        .then((data) => {
          data.time_spend.push({ 
            time: time_in_sec
          }),
          data.total_page_clicks.push({
            clicks: req.body.totalClicks
          }),
          data.total_button_clicks.push({ 
            clicks: req.body.totalButtonClicks.total
          }),
          data.total_link_press.push({ 
            clicks: req.body.totalLinkClickCount
          }),
          data.total_mouse_movement.push({ 
            movement: req.body.totalMouseMovementCount
          });
          data
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);
})

router.get("/signup", (req, res, next) => {
   let username = [];
   if(req.session.userId) {
     username.push(req.session.username);
   }
  let site_key = process.env.RECAPTCHA_SITE_KEY
  return res.render("signup.ejs", {
    site_key: site_key,
    username: username
  });
});

/* NOTE: 
HTTP 400 => Bad Request => { responseError: "err" }
HTTP 200 => Invalid Data => { Success: "msg" }
HTTP 201 => Successfull => { Success: "msg" }
*/
router.post("/signup", async (req, res, next) => {
  let personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, async (err, data) => {
        if (!data) {
          let c;
          User.findOne({}, (err, data) => {
            if (data) {
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            let bits_id = com_id();
            let bitshype = false;
            let hype = false;

            if (req.body.competition === "bitshype") {
              bitshype = true;
            } else {
              hype = true;
            }

            let newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              school: personInfo.school,
              fullname: personInfo.fullname,
              age: personInfo.age,
              competitor_id: "bits22-" + bits_id,
              grade: personInfo.grade,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
              adminUser: false,
              bitsUser: bitshype,
              hypertextUser: hype,
              admissionNo: req.body.admission,
            });

            let newUserTasks = new userTasks({
              user_id: c,
              total_points: 0,
              pending_tasks: [],
              approved_tasks: [],
              declined_tasks: [],
            });

            newUserTasks.save((err, Data) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Successfully added records for user tasks");
              }
            });

            (async () => {
              try {
                const { sheets } = await authentication();
                const { fullname, email, school, grade, age, admission, phone } = req.body;

                const writeReq = await sheets.spreadsheets.values.append({
                  spreadsheetId: id,
                  range: "Sheet1",
                  valueInputOption: "USER_ENTERED",
                  resource: {
                    values: [
                      [
                        fullname,
                        email,
                        age,
                        "Ananda College",
                        grade,
                        "bits22-" + bits_id,
                        admission,
                        phone
                      ],
                    ],
                  },
                });

                if (writeReq.status === 200) {
                  console.log("Spreadsheet updated");
                } else {
                  console.log(
                    "Somethign went wrong while updating the spreadsheet."
                  );
                }
              } catch (e) {
                console.log("ERROR WHILE UPDATING THE SPREADSHEET", e);
              }
            })();

            newPerson.save((err, Person) => {
              if (err) console.log(err);
              else if (bitshype === true) {
                async function main() {
                  let transporter = nodemailer.createTransport({
                    host: process.env.SMTP_SERVER,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: true,
                    auth: {
                      user: process.env.USERNAME,
                      pass: process.env.PASSWORD,
                    },
                  });

                  let info = await transporter.sendMail({
                    from: `"BITS Organizing Community" <${process.env.USERNAME}>`,
                    to: personInfo.email,
                    subject: `Welcome ${personInfo.username}`,
                    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns=http://www.w3.org/1999/xhtml xmlns:v=urn:schemas-microsoft-com:vml xmlns:o=urn:schemas-microsoft-com:office:office lang="en">
<head>
<meta name=x-apple-disable-message-reformatting>
<meta http-equiv=X-UA-Compatible>
<meta charset=utf-8>
<meta name=viewport content=target-densitydpi=device-dpi>
<meta content=true name=HandheldFriendly>
<meta content=width=device-width name=viewport>
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
* {
line-height: inherit;
text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
-moz-text-size-adjust: 100%;
-o-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
html {
-webkit-text-size-adjust: none !important
}
img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
font-family: inherit;
font-weight: inherit;
font-size: inherit;
line-height: 1;
color: inherit;
background: none;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
color: inherit;
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit !important;
text-decoration: none !important
}
@media only screen and (min-width: 481px) {
.hd { display: none!important }
}
@media only screen and (max-width: 480px) {
.hm { display: none!important }
}
[style*="Fira Sans"] {font-family: 'Fira Sans', BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif !important;} [style*="Lato"] {font-family: 'Lato', BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif !important;}
</style>
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&family=Lato:wght@400;700&display=swap" rel="stylesheet" type="text/css">
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body class=t0 style="min-width:100%;Margin:0px;padding:0px;background-color:#1B1E27;"><div class=t1 style="background-color:#1B1E27;"><table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td class=t154 style="background-image:url(https://i.imgur.com/g9HweM6.png);background-repeat:repeat;background-size:auto;background-position:center center;font-size:0;line-height:0;mso-line-height-rule:exactly;" valign=top align=center>
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill size=1728px,1147px position=0,0 origin=0,0 type=tile src=https://i.imgur.com/g9HweM6.png color=#1B1E27 />
</v:background>
<![endif]-->
<table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td><div class=t3 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t5 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t6 style="width:154px;"><div style="font-size:0px;"><img class=t12 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=154 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/48c793a1-75de-4336-b2ca-d63bb3ab045c.png /></div></td>
</tr></table>
</td></tr><tr><td><div class=t45 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t47 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t48 style="width:600px;"><h1 class=t54 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;font:normal 500 35px/34px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Welcome to</h1></td>
</tr></table>
</td></tr><tr><td><div class=t13 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t15 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t16 style="width:600px;"><h1 class=t22 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:-5px;font:normal 500 50px/34px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';"> BITS &#39;22</h1></td>
</tr></table>
</td></tr><tr><td><div class=t23 style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t25 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t26 style="width:600px;"><p class=t32 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Hello there, Welcome to BITS&#39;22 with Hypertext organized by ACICTS of Ananda College Colombo. Please verify all information below before continuing, If there are any issues please contact one of our site admins immediately. If everything is correct you are good to go.</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t67 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t68 style="width:506px;"><div class=t74 style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
<!--[if mso]>
<table role=presentation cellpadding=0 cellspacing=0 align=left valign=top><tr><td width=280.33241 valign=top><![endif]-->
<div class=t88 style="display:inline-table;text-align:initial;vertical-align:inherit;width:55.40166%;max-width:800px;"><div class=t85 style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;</div>
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t90><tr>
<td class=t91><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td><div class=t104 style="mso-line-height-rule:exactly;mso-line-height-alt:70px;line-height:70px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t106 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t107 style="width:600px;"><p class=t113 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Fullname:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t116 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t117 style="width:600px;"><p class=t123 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.fullname}</p></td>
</tr></table>
</td></tr><tr><td><div class=t115 style="mso-line-height-rule:exactly;mso-line-height-alt:7px;line-height:7px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t126 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t127 style="width:600px;"><p class=t133 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">Username:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t136 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t137 style="width:600px;"><p class=t143 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.username}</p></td>
</tr></table>
</td></tr><tr><td><div class=t135 style="mso-line-height-rule:exactly;mso-line-height-alt:7px;line-height:7px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t146 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t147 style="width:600px;"><p class=t153 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">Email Address:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t96 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t97 style="width:600px;"><p class=t103 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.email}</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width=225.66759 valign=top><![endif]-->
<div class=t80 style="display:inline-table;text-align:initial;vertical-align:inherit;width:44.59834%;max-width:644px;">
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t82><tr>
<td class=t83 style="padding:0 0 33px 0;"><div style="font-size:0px;"><img class=t84 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=225.6675900277008 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/128041ba-b200-4416-93d6-729b20cbf598.png /></div></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr><tr><td><div class=t33 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t35 role=presentation cellpadding=0 cellspacing=0 align=center><tr>
<!--[if !mso]><!--><td class=t36 style="background-color:#0055FF;width:130px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:15px 15px 15px 15px;">
<!--<![endif]-->
<!--[if mso]><td style="background-color:#0055FF;width:150px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:15px 15px 15px 15px;"><![endif]-->
<a class=t42 href=${process.env.SITE_URL}/profile style="display:block;text-decoration:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/24px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';" target=_blank>Go to Profile</a></td>
</tr></table>
</td></tr><tr><td><div class=t34 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t57 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t58 style="width:600px;"><p class=t64 style="text-decoration:none;text-transform:none;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';"></p></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`, // plain text body
                  });

                  console.log("Message sent: %s", info.messageId);
                }
                main().catch(console.error);
              } else if (hype === true) {
                async function main() {
                  let transporter = nodemailer.createTransport({
                    host: process.env.SMTP_SERVER,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: true,
                    auth: {
                      user: process.env.USERNAME,
                      pass: process.env.PASSWORD,
                    },
                  });

                  let info = await transporter.sendMail({
                    from: `"Hypertext Organizing Community" <${process.env.USERNAME}>`,
                    to: personInfo.email,
                    subject: `Welcome ${personInfo.username}`,
                    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns=http://www.w3.org/1999/xhtml xmlns:v=urn:schemas-microsoft-com:vml xmlns:o=urn:schemas-microsoft-com:office:office lang="en">
<head>
<meta name=x-apple-disable-message-reformatting>
<meta http-equiv=X-UA-Compatible>
<meta charset=utf-8>
<meta name=viewport content=target-densitydpi=device-dpi>
<meta content=true name=HandheldFriendly>
<meta content=width=device-width name=viewport>
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
* {
line-height: inherit;
text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
-moz-text-size-adjust: 100%;
-o-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
html {
-webkit-text-size-adjust: none !important
}
img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
font-family: inherit;
font-weight: inherit;
font-size: inherit;
line-height: 1;
color: inherit;
background: none;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
color: inherit;
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit !important;
text-decoration: none !important
}
@media only screen and (min-width: 481px) {
.hd { display: none!important }
}
@media only screen and (max-width: 480px) {
.hm { display: none!important }
}
[style*="Fira Sans"] {font-family: 'Fira Sans', BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif !important;} [style*="Lato"] {font-family: 'Lato', BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif !important;}
</style>
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&family=Lato:wght@400;700&display=swap" rel="stylesheet" type="text/css">
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body class=t0 style="min-width:100%;Margin:0px;padding:0px;background-color:#1B1E27;"><div class=t1 style="background-color:#1B1E27;"><table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td class=t154 style="background-image:url(https://i.imgur.com/g9HweM6.png);background-repeat:repeat;background-size:auto;background-position:center center;font-size:0;line-height:0;mso-line-height-rule:exactly;" valign=top align=center>
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill size=1728px,1147px position=0,0 origin=0,0 type=tile src=https://i.imgur.com/g9HweM6.png color=#1B1E27 />
</v:background>
<![endif]-->
<table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td><div class=t3 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t5 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t6 style="width:154px;"><div style="font-size:0px;"><img class=t12 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=154 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/48c793a1-75de-4336-b2ca-d63bb3ab045c.png /></div></td>
</tr></table>
</td></tr><tr><td><div class=t45 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t47 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t48 style="width:600px;"><h1 class=t54 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;font:normal 500 35px/34px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Welcome to</h1></td>
</tr></table>
</td></tr><tr><td><div class=t13 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t15 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t16 style="width:600px;"><h1 class=t22 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:-5px;font:normal 500 50px/34px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';"> HyperText '22</h1></td>
</tr></table>
</td></tr><tr><td><div class=t23 style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t25 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t26 style="width:600px;"><p class=t32 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Hello there, Welcome to Hypertext organized by ACICTS of Ananda College Colombo. Please verify all information below before continuing, If there are any issues please contact one of our site admins immediately. If everything is correct you are good to go.</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t67 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t68 style="width:506px;"><div class=t74 style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
<!--[if mso]>
<table role=presentation cellpadding=0 cellspacing=0 align=left valign=top><tr><td width=280.33241 valign=top><![endif]-->
<div class=t88 style="display:inline-table;text-align:initial;vertical-align:inherit;width:55.40166%;max-width:800px;"><div class=t85 style="mso-line-height-rule:exactly;mso-line-height-alt:5px;line-height:5px;font-size:1px;display:block;">&nbsp;</div>
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t90><tr>
<td class=t91><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td><div class=t104 style="mso-line-height-rule:exactly;mso-line-height-alt:70px;line-height:70px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t106 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t107 style="width:600px;"><p class=t113 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Fullname:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t116 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t117 style="width:600px;"><p class=t123 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.fullname}</p></td>
</tr></table>
</td></tr><tr><td><div class=t115 style="mso-line-height-rule:exactly;mso-line-height-alt:7px;line-height:7px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t126 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t127 style="width:600px;"><p class=t133 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">Username:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t136 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t137 style="width:600px;"><p class=t143 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.username}</p></td>
</tr></table>
</td></tr><tr><td><div class=t135 style="mso-line-height-rule:exactly;mso-line-height-alt:7px;line-height:7px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t146 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t147 style="width:600px;"><p class=t153 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 13px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">Email Address:</p></td>
</tr></table>
</td></tr><tr><td>
<table class=t96 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t97 style="width:600px;"><p class=t103 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';">${personInfo.email}</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width=225.66759 valign=top><![endif]-->
<div class=t80 style="display:inline-table;text-align:initial;vertical-align:inherit;width:44.59834%;max-width:644px;">
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t82><tr>
<td class=t83 style="padding:0 0 33px 0;"><div style="font-size:0px;"><img class=t84 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=225.6675900277008 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/128041ba-b200-4416-93d6-729b20cbf598.png /></div></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr><tr><td><div class=t33 style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t35 role=presentation cellpadding=0 cellspacing=0 align=center><tr>
<!--[if !mso]><!--><td class=t36 style="background-color:#0055FF;width:130px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:15px 15px 15px 15px;">
<!--<![endif]-->
<!--[if mso]><td style="background-color:#0055FF;width:150px;text-align:center;line-height:24px;mso-line-height-rule:exactly;mso-text-raise:2px;padding:10px 10px 10px 10px;border-radius:15px 15px 15px 15px;"><![endif]-->
<a class=t42 href=${process.env.SITE_URL}/profile style="display:block;text-decoration:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 700 16px/24px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';" target=_blank>Go to Profile</a></td>
</tr></table>
</td></tr><tr><td><div class=t34 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t57 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t58 style="width:600px;"><p class=t64 style="text-decoration:none;text-transform:none;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 16px/22px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Lato';"></p></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`, // plain text body
                  });

                  console.log("Message sent: %s", info.messageId);
                }
                main().catch(console.error);
              }
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          res.status(201).send({ Success: "You are registered,You can login now." });
        } else {
          res.status(200).send({ Success: "Email Already Used" });
        }
      });
    } else {
      res.status(200).send({ Success: "Passwords Not Matched" });
    }
  }
});

router.get(
  "/tasks",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    let username = [];
    if(req.session.userId) {
      username.push(req.session.username);
    }
    let tasks = await Tasks.find();
    const user_tasks = await userTasks.findOne({ user_id: req.session.userId });
    const approved = user_tasks.approved_tasks;
    const declined = user_tasks.declined_tasks;
    const pending = user_tasks.pending_tasks;
    const approvedArray = approved.map(function (data) {
      return data.task_id;
    });
    const declineArray = declined.map(function (data) {
      return data.task_id;
    });
    const pendingArray = pending.map(function (data) {
      return data.task_id;
    });

    for(i = 0; i < tasks.length; i++) {
        tasks[i].task_id = tasks[i].task_id / 100
    }

    res.render("taskdata", {
      tasks: tasks,
      approvedArray: approvedArray,
      declineArray: declineArray,
      pendingArray: pendingArray,
      username: username
    });
  }
);

router.get(
  "/quiz",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    let username = [];
    if(req.session.userId) {
      username.push(req.session.username);
    }
    const user_data = await User.findOne({ unique_id: req.session.userId });
    const test_data = await Tests.find();
    const str = user_data.grade;

    const replaced = str.replace(/\D/g, "");

    let user_type;
    if (replaced >= 6 && replaced <= 9) {  //Checking the users grade.
      user_type = "junior";
    } else if (replaced == 10 || replaced == 11 || replaced == 1000) {
      user_type = "senior";
    }

    const filteredQuiz = test_data
      .filter(function (data) {
        return data.test_type === user_type;
      })
      .map(function (data) {
        return {
          id: data._id,
          createdAt: data.createdAt,
          test_id: data.test_id,
          test_name: data.test_name,
          test_description: data.test_description,
          test_link: data.test_link,
          time: data.time,
          test_enabled: data.testEnabled,
        };
      });

    for(i = 0; i < filteredQuiz.length; i++) {
        filteredQuiz[i].createdAt = filteredQuiz[i].createdAt.toString()
    }

    for(i = 0; i < filteredQuiz.length; i++) {
        filteredQuiz[i].createdAt = filteredQuiz[i].createdAt.replace('00:00:00 GMT+0000 (Coordinated Universal Time)', '')
    }

    res.render("onlinetests", {
      filteredQuiz: filteredQuiz,
      username: username
    });
  }
);

router.get("/login", isEnabled, (req, res, next) => {
    let username = [];
    if(req.session.userId) {
      username.push(req.session.username);
    }
    res.render("login.ejs", {
        username: username
    });
});

router.post("/login", isEnabled, (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    if (data) {
      if (data.password == req.body.password) {
        if (data.adminUser) {
          req.session.adminToken = process.env.TOKEN;
        }
        req.session.bitsUser = data.bitsUser;
        req.session.hypertextUser = data.hypertextUser;
        req.session.userId = data.unique_id;
        req.session.username = data.username;
        // res.send({ Success: "Success!" });
        res.sendStatus(200)
      } else {
        res.status(401).json({"message": "password incorrect"})
        // res.send({ Success: "Wrong email or password!" });
      }
    } else {
      res.status(401).json({"message": "email unregistered"})
      // res.send({ Success: "This Email Is not regestered!" });
    }
  });
});

router.get(
  "/profile",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    const data = await Analytics.findOne({ analytics_id: 1043 });
  if(!data){
    let newData = new Analytics({
      total_views: 1,
      total_signup: 1,
      coding_tasks: 1,
      design_tasks: 1,
      explore_tasks: 1
    })

    newData.save((error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully added records for analytics");
      }
    })
  }

  await Analytics.updateOne({ total_views: data.total_views }, [
    {
      $set: {
        total_views: {
          $add: ["$total_views", 1],
        }
      }
    }
  ]);
    let username = [];
    if(req.session.userId) {
      username.push(req.session.username);
    }
    const taskData = await userTasks.findOne({ user_id: req.session.userId });
    const userData = await User.findOne({ unique_id: req.session.userId });
    var approvedTasksArray = taskData.approved_tasks;
    var declinedTasksArray = taskData.declined_tasks;
    var pendingTasksArray = taskData.pending_tasks;

    const approvedResults = approvedTasksArray.map(function (data) {
      return {
        task_title: data.task_title,
        task_description: data.task_description,
        task_id: data.task_id / 100,
        task_category: data.task_category,
      };
    });

    const declinedResults = declinedTasksArray.map(function (data) {
      return {
        task_title: data.task_title,
        task_description: data.task_description,
        task_id: data.task_id / 100,
        task_category: data.task_category,
        denial_reason: data.denial_reason,
      };
    });

    const pendingResults = pendingTasksArray.map(function (data) {
      return {
        task_title: data.task_title,
        task_description: data.task_description,
        task_id: data.task_id / 100,
        task_category: data.task_category,
      };
    });

    res.render("data", {
      approvedResults: approvedResults,
      declinedResults: declinedResults,
      pendingResults: pendingResults,
      userData: userData,
      username: username
    });
  }
);

router.get("/help", (req, res, next) => {
  let username = [];
  if(req.session.userId) {
    username.push(req.session.username);
  }
  res.render("help", {
      username: username
  });
})

router.post(
  "/test/submit",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    const user_data = await User.findOne({ unique_id: req.session.userId });
    Admin.findOne({ number: 1 })
      .then((task) => {
        task.quizData.push({
          quiz_name: req.body.name,
          quiz_id: req.body.id,
          username: user_data.username,
          userId: user_data.unique_id,
        });
        task
          .save()
          .then(() => {
            return "Success";
          })
          .catch(console.log);
      })
      .catch(console.log);

    res.redirect(req.body.link);
  }
);

router.get("/leaderboard", isEnabled, async (req, res, next) => {
   let username = [];
   if(req.session.userId) {
     username.push(req.session.username);
   }
  const Database = await userTasks.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "unique_id",
        as: "same",
      },
    },
    {
      $match: { same: { $ne: [] } },
    },
    {
      $sort: { total_points: -1 },
    },
  ]);

  const filteredArray = Database
  .filter(function (data){
        return data.same[0].bitsUser === true && data.same[0].adminUser === false && data.total_points !== 0;
  })

  res.render("leaderboard", {
    db: filteredArray,
    i: 1,
    username: username
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

router.get("/forgetpass", (req, res, next) => {
   let username = [];
   if(req.session.userId) {
     username.push(req.session.username);
   }
  res.render("forget.ejs", {
     username: username
  });
});

router.post("/forgetpass", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    if (!data) {
      res.status(200).send({ "msg": "EmailUnregistered" });
    } else {
        let reset = uuidv4();

        let pass = new Password({
           user_id: data.unique_id,
           reset_link: reset,
           expired: false
        })

        pass.save((err, Person) => {
          if (err) console.log(err);
          else console.log("Success");
          res.status(201).send();
        });

     async function main() {
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.USERNAME,
          pass: process.env.PASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: `"BITS 22" <${process.env.USERNAME}>`,
        to: data.email,
        subject: "Password Reset Request",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns=http://www.w3.org/1999/xhtml xmlns:v=urn:schemas-microsoft-com:vml xmlns:o=urn:schemas-microsoft-com:office:office lang="en">
<head>
<meta name=x-apple-disable-message-reformatting>
<meta http-equiv=X-UA-Compatible>
<meta charset=utf-8>
<meta name=viewport content=target-densitydpi=device-dpi>
<meta content=true name=HandheldFriendly>
<meta content=width=device-width name=viewport>
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
* {
line-height: inherit;
text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
-moz-text-size-adjust: 100%;
-o-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
html {
-webkit-text-size-adjust: none !important
}
img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
font-family: inherit;
font-weight: inherit;
font-size: inherit;
line-height: 1;
color: inherit;
background: none;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
color: inherit;
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit !important;
text-decoration: none !important
}
@media only screen and (min-width: 481px) {
.hd { display: none!important }
}
@media only screen and (max-width: 480px) {
.hm { display: none!important }
}
[style*="Fira Sans"] {font-family: 'Fira Sans', BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif !important;}
</style>
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css">
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body class=t0 style="min-width:100%;Margin:0px;padding:0px;background-color:#F0F0F0;"><div class=t1 style="background-color:#F0F0F0;"><table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td class=t113 style="font-size:0;line-height:0;mso-line-height-rule:exactly;" valign=top align=center>
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color=#F0F0F0 />
</v:background>
<![endif]-->
<table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td>
<table class=t44 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t45 style="background-color:#1B1E27;"><div class=t51 style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
<!--[if mso]>
<table role=presentation cellpadding=0 cellspacing=0 align=center valign=top><tr><td width=600 valign=top><![endif]-->
<div class=t55 style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:600px;">
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t57><tr>
<td class=t58 style="background-color:#1B1E27;background-image:url(https://i.imgur.com/g9HweM6.png);background-repeat:repeat;background-size:auto;background-position:center center;"><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td><div class=t103 style="mso-line-height-rule:exactly;mso-line-height-alt:125px;line-height:125px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t105 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t106 style="background-color:unset;background-repeat:repeat;background-size:auto;background-position:center center;width:180px;"><div style="font-size:0px;"><img class=t112 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=180 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/d5acbfd3-ba3f-49fe-9ec3-d66f30b189db.png /></div></td>
</tr></table>
</td></tr><tr><td><div class=t93 style="mso-line-height-rule:exactly;mso-line-height-alt:55px;line-height:55px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t95 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t96 style="width:315px;"><h1 class=t102 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;font:normal 700 48px/52px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Forgot your password?</h1></td>
</tr></table>
</td></tr><tr><td><div class=t94 style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t85 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t86 style="width:350px;"><p class=t92 style="text-decoration:none;text-transform:none;color:#666666;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 500 20px/30px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">To reset your password, click the button below.</p></td>
</tr></table>
</td></tr><tr><td><div class=t71 style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t73 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t74 style="background-color:#0055FF;width:308px;text-align:center;line-height:58px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:14px 14px 14px 14px;"><a class=t80 href=${process.env.SITE_URL}/pass/forget/${reset} style="display:block;text-decoration:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;font:normal 600 21px/58px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';" target=_blank>Reset your password</a></td>
</tr></table>
</td></tr><tr><td><div class=t72 style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t63 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t64 style="width:350px;"><p class=t70 style="text-decoration:none;text-transform:none;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 400 16px/25px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">If you do not want to change your password or didn&#39;t request a reset, you can ignore and delete this email.</p></td>
</tr></table>
</td></tr><tr><td><div class=t62 style="mso-line-height-rule:exactly;mso-line-height-alt:125px;line-height:125px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr><tr><td>
<table class=t5 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t6 style="background-color:unset;"><div class=t12 style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
<!--[if mso]>
<table role=presentation cellpadding=0 cellspacing=0 align=center valign=top><tr><td width=600 valign=top><![endif]-->
<div class=t16 style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:600px;">
<table role=presentation width=100% cellpadding=0 cellspacing=0 class=t18><tr>
<td class=t19 style="background-color:unset;padding:40px 0 40px 0;"><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td>
<table class=t34 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t35 style="width:350px;"><p class=t41 style="text-decoration:none;text-transform:none;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 12px/19px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">This email was sent to ${data.email}. If you&#39;re not the intended receipient immediately remove this email from your system and all of it&#39;s content.</p></td>
</tr></table>
</td></tr><tr><td><div class=t33 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t24 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t25 style="width:350px;"><p class=t31 style="text-decoration:none;text-transform:none;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 12px/19px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">2022 Bits Management. All rights reserved</p></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`, // plain text body
      });

      console.log("Message sent: %s", info.messageId);
    }
    main().catch(console.error);
    }
  });
});

router.get("/pass/forget/:id", async(req, res, next) => {
      let username = [];
     if(req.session.userId) {
       username.push(req.session.username);
     } 
     Password.findOne({ reset_link: req.params.id }, async(err, data) => {
             if(!data){
                res.sendStatus(404)
             } else if(data.expired === true){
                res.sendStatus(404)
             } else {
                const UserData = await User.findOne({ unique_id: data.user_id });

                let link = req.params.id

                res.render("forgotpass", {
                    UserData: UserData,
                    link: link,
                    username: username
                })
             }
     })
});

router.post("/pass/forget", (req, res, next) => {
    console.log(req.body.user)
    User.findOne({ unique_id: parseInt(req.body.user) }, async(err, data) => {
        if(!data){
           res.sendStatus(404)
        } else {
           data.password = req.body.password
           data.passwordConf = req.body.password

           data.save((err, Person) => {
                if(err) console.log(err);
                console.log("Success")
           });

           await Password.findOneAndUpdate({ reset_link: req.body.link }, {$set: { expired: true }})

           res.redirect("/login")
        }
    })
})

//Generating random ids for the competitors
const com_id = () => {
  var val = Math.floor(1000 + Math.random() * 9000);
  return val;
};

const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  });
  return { sheets };
};

module.exports = router;
