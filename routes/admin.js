require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userTasks = require("../models/userTasks");
const Tasks = require("../models/tasks");
const Admin = require("../models/admin");
const Tests = require("../models/tests");
const IMP = require("../models/confidential");
const Analytics = require("../models/analytics");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
require("dotenv").config();

const coding_id = process.env.CODING_ID;
const design_id = process.env.DESIGN_ID;
const explore_id = process.env.EXPLORE_ID;

// Checking if there is a session
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

// Checking whether the current user is an admin
const isAdmin = (req, res, next) => {
  if (!req.session.adminToken) {
    return res.json({ code: 403, message: "Unauthorized" });
  }
  if (req.session.adminToken !== process.env.TOKEN) {
    res.json({ code: 400, message: "Invalid trust token" });
  } else {
    next();
  }
};

router.get("/", isAuthenticated, isAdmin, async (req, res, next) => {
  const userData = await User.findOne({ unique_id: req.session.userId });

  if (userData.adminUser) { //Fetching user profile
    const taskdata = await Admin.findOne({ number: 1 });
    
    if(!taskdata){
      let newData = new Admin({
        number: 1,
        taskData: [],
        quizData: []
      });
  
      newData.save((err, data) => {
        if(err) console.log(err)
        else {
          console.log("Successfully initialized Admin Panel")
        }
      })
    }
    
    const tasks = taskdata.taskData;

    const choosedResults = tasks.map(function (data) {
      return {
        username: data.username,
        userid: data.userId,
        task_title: data.task_title,
        task_description: data.task_description,
        task_id: data.task_id,
        task_category: data.task_category,
        project_url: data.project_url,
        feedback: data.feedback,
      };
    });

    res.render("admin", {
      taskData: choosedResults,
    });
  } else {
    res.send(
      "This is a restricted area. Please do not try to access this page."
    );
  }
});

router.post(
  "/task/approve/:id/:user",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const userData = await User.findOne({ unique_id: parseInt(req.params.user) });
    const task_dat = await Tasks.findOne({ task_id: parseInt(req.params.id) });
    if (!userData || !task_dat) {
      res.sendStatus(404);
    } else {
      const taskData = await userTasks.findOne({ user_id: parseInt(req.params.user) });
      const Admindata = await Admin.findOne({ number: 1 });
      const datag = await Analytics.findOne({ analytics_id: 1043 });

        if(!datag){
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

      var currentdate = new Date();

      let id = parseInt(req.params.id) / 100;

      if(task_dat.task_category === "CODING"){
         if(id < 10){
             id = `C0${id}`
         } else {
             id = `C${id}`
         }
      } else if(task_dat.task_category === "DESIGN"){
         if(id < 10){
             id = `D0${id}`
         } else {
             id = `D${id}`
         }
      } else if(task_dat.task_category === "EXPLORE"){
         if(id < 10){
             id = `E0${id}`
         } else {
             id = `E${id}`
         }
      }

      var pendingTasksArray = taskData.pending_tasks;
      var adminTasksArray = Admindata.taskData;
      var sheetDataArray = task_dat.sheetData;

      const sheetResults = sheetDataArray
        .filter(function (data) {
          return data.userId === userData.unique_id;
        })
        .map(function (data) {
          return {
            userid: data.userId,
            sheetid: data.sheetId,
          };
        });

      const choosedResults = pendingTasksArray
        .filter(function (data) {
          return data.task_id == req.params.id;
        })
        .map(function (data) {
          return {
            id: data._id,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
          };
        });

      const adminChoosedResults = adminTasksArray
        .filter(function (data) {
          return data.task_id == req.params.id && data.userId == req.params.user;
        })
        .map(function (data) {
          return {
            id: data._id,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
            project_url: data.project_url,
          };
        });

      let type;

      if (adminChoosedResults[0].task_category === "CODING") { //Checking the task category
        type = coding_id;
        await Analytics.updateOne({ total_views: datag.total_views }, [
          {
            $set: {
             coding_tasks: {
              $add: ["$coding_tasks", 1],
            }
           }
          }
        ]);
      } else if (adminChoosedResults[0].task_category === "DESIGN") {
        type = design_id;
        await Analytics.updateOne({ total_views: datag.total_views }, [
          {
            $set: {
             design_tasks: {
              $add: ["$design_tasks", 1],
            }
           }
          }
        ]);
      } else if (adminChoosedResults[0].task_category === "EXPLORE") {
        type = explore_id;
        await Analytics.updateOne({ total_views: datag.total_views }, [
          {
            $set: {
             explore_tasks: {
              $add: ["$explore_tasks", 1],
            }
           }
          }
        ]);
      }

      (async () => {
        try {
          const { sheets } = await authentication();

          const writeReq = await sheets.spreadsheets.values.update({  //Updating spreadsheet according to the fetched data
            spreadsheetId: type,
            range: `${req.params.id}!A${sheetResults[0].sheetid}`,
            valueInputOption: "USER_ENTERED",
            resource: {
              range: `${req.params.id}!A${sheetResults[0].sheetid}`,
              majorDimension: "ROWS",
              values: [
                [
                  currentdate,
                  userData.email,
                  userData.competitor_id,
                  userData.username,
                  adminChoosedResults[0].project_url,
                  "No Feedback",
                  req.body.points,
                  "Approved",
                ],
              ],
            },
          });

          if (writeReq.status === 200) {
            console.log("Spreadsheet updated");
          } else {
            console.log("Somethign went wrong while updating the spreadsheet.");
          }
        } catch (e) {
          console.log("ERROR WHILE UPDATING THE SPREADSHEET", e);
        }
      })();

      userTasks
        .findOne({ user_id: parseInt(req.params.user) })
        .then((task) => {
          task.approved_tasks.push({
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);

      await userTasks.updateOne({ user_id: parseInt(req.params.user) }, [ //Adding points to the user profile
        {
          $set: {
            total_points: {
              $add: ["$total_points", parseInt(req.body.points)],
            },
          },
        },
      ]);

      await userTasks.update(
        { _id: taskData._id },
        { $pull: { pending_tasks: { _id: choosedResults[0].id } } }
      );
      await Admin.update(
        { _id: Admindata._id },
        { $pull: { taskData: { _id: adminChoosedResults[0].id } } }
      );

      async function main() {  //SMTP email system
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
          to: userData.email,
          subject: `Hello ${userData.username}`,
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
<body class=t0 style="min-width:100%;Margin:0px;padding:0px;background-color:#F0F0F0;"><div class=t1 style="background-color:#F0F0F0;"><table role=presentation width=100% cellpadding=0 cellspacing=0 border=0 align=center><tr><td class=t103 style="font-size:0;line-height:0;mso-line-height-rule:exactly;" valign=top align=center>
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
<td class=t58 style="background-color:#1B1E27;background-image:url(https://i.imgur.com/g9HweM6.png);background-repeat:repeat;background-size:auto;background-position:center center;"><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td><div class=t93 style="mso-line-height-rule:exactly;mso-line-height-alt:125px;line-height:125px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t95 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t96 style="background-color:unset;background-repeat:repeat;background-size:auto;background-position:center center;width:124px;"><div style="font-size:0px;"><img class=t102 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=124 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/d5acbfd3-ba3f-49fe-9ec3-d66f30b189db.png /></div></td>
</tr></table>
</td></tr><tr><td><div class=t83 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t85 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t86 style="width:315px;"><h1 class=t92 style="text-decoration:none;text-transform:none;color:#19C346;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;font:normal 700 48px/52px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Task Approved</h1></td>
</tr></table>
</td></tr><tr><td><div class=t84 style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t75 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t76 style="width:350px;"><p class=t82 style="text-decoration:none;text-transform:none;color:#666666;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 500 20px/30px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Congradulations. Your Task ID: ${id} has been accepted and will count towards in the competition. You got ${req.body.points}/10 for this task.</p></td>
</tr></table>
</td></tr><tr><td><div class=t61 style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t63 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t64 style="background-color:#0055FF;width:308px;text-align:center;line-height:58px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:14px 14px 14px 14px;"><a class=t70 href=${process.env.SITE_URL}/profile style="display:block;text-decoration:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;font:normal 600 21px/58px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';" target=_blank>Go to Profile</a></td>
</tr></table>
</td></tr><tr><td><div class=t62 style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
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
<table class=t34 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t35 style="width:350px;"><p class=t41 style="text-decoration:none;text-transform:none;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 12px/19px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">This email was sent to ${userData.email}. If you&#39;re not the intended receipient immediately remove this email from your system and all of it&#39;s content.</p></td>
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
      res.redirect("/admin");
    }
  }
);

router.post(
  "/task/decline/:id/:user",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const userData = await User.findOne({ unique_id: parseInt(req.params.user) });
    const task_dat = await Tasks.findOne({ task_id: parseInt(req.params.id) });
    if (!userData || !task_dat) {
      res.sendStatus(404);
    } else {
      const taskData = await userTasks.findOne({ user_id: parseInt(req.params.user) });
      const Admindata = await Admin.findOne({ number: 1 });

      var currentdate = new Date();

      let id = parseInt(req.params.id) / 100;

      if(task_dat.task_category === "CODING"){
         if(id < 10){
             id = `C0${id}`
         } else {
             id = `C${id}`
         }
      } else if(task_dat.task_category === "DESIGN"){
         if(id < 10){
             id = `D0${id}`
         } else {
             id = `D${id}`
         }
      } else if(task_dat.task_category === "EXPLORE"){
         if(id < 10){
             id = `E0${id}`
         } else {
             id = `E${id}`
         }
      }

      var pendingTasksArray = taskData.pending_tasks;
      var adminTasksArray = Admindata.taskData;
      var sheetDataArray = task_dat.sheetData;

      const sheetResults = sheetDataArray
        .filter(function (data) {
          return data.userId === userData.unique_id;
        })
        .map(function (data) {
          return {
            userid: data.userId,
            sheetid: data.sheetId,
          };
        });

      const choosedResults = pendingTasksArray
        .filter(function (data) {
          return data.task_id == req.params.id;
        })
        .map(function (data) {
          return {
            id: data._id,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
          };
        });

      const adminChoosedResults = adminTasksArray
        .filter(function (data) {
          return data.task_id == req.params.id && data.userId == req.params.user;
        })
        .map(function (data) {
          return {
            id: data._id,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
            project_url: data.project_url,
          };
        });

      let type;

      if (adminChoosedResults[0].task_category === "CODING") {
        type = coding_id;
      } else if (adminChoosedResults[0].task_category === "DESIGN") {
        type = design_id;
      } else if (adminChoosedResults[0].task_category === "EXPLORE") {
        type = explore_id;
      }

      (async () => {
        try {
          const { sheets } = await authentication();

          const writeReq = await sheets.spreadsheets.values.update({
            spreadsheetId: type,
            range: `${req.params.id}!A${sheetResults[0].sheetid}`,
            valueInputOption: "USER_ENTERED",
            resource: {
              range: `${req.params.id}!A${sheetResults[0].sheetid}`,
              majorDimension: "ROWS",
              values: [
                [
                  currentdate,
                  userData.email,
                  userData.competitor_id,
                  userData.username,
                  adminChoosedResults[0].project_url,
                  req.body.denialreason,
                  "0",
                  "Declined",
                ],
              ],
            },
          });

          if (writeReq.status === 200) {
            console.log("Spreadsheet updated");
          } else {
            console.log("Somethign went wrong while updating the spreadsheet.");
          }
        } catch (e) {
          console.log("ERROR WHILE UPDATING THE SPREADSHEET", e);
        }
      })();

      userTasks
        .findOne({ user_id: parseInt(req.params.user) })
        .then((task) => {
          task.declined_tasks.push({
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
            denial_reason: req.body.denialreason,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);

      await userTasks.update(
        { _id: taskData._id },
        { $pull: { pending_tasks: { _id: choosedResults[0].id } } }
      );
      await Admin.update(
        { _id: Admindata._id },
        { $pull: { taskData: { _id: adminChoosedResults[0].id } } }
      );

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
          to: userData.email,
          subject: `Hello ${userData.username}`,
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
<td class=t58 style="background-color:#1B1E27;background-image:url(https://i.imgur.com/g9HweM6.png);background-repeat:repeat;background-size:auto;background-position:center center;"><table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td><div class=t93 style="mso-line-height-rule:exactly;mso-line-height-alt:125px;line-height:125px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t95 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t96 style="background-color:unset;background-repeat:repeat;background-size:auto;background-position:center center;width:124px;"><div style="font-size:0px;"><img class=t102 style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width=124 src=https://uploads.tabular.email/e/3f50e53d-95e0-4905-aa29-22bfaa30c584/d5acbfd3-ba3f-49fe-9ec3-d66f30b189db.png /></div></td>
</tr></table>
</td></tr><tr><td><div class=t83 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t85 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t86 style="width:315px;"><h1 class=t92 style="text-decoration:none;text-transform:none;color:#FC2828;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;font:normal 700 48px/52px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Task Rejected</h1></td>
</tr></table>
</td></tr><tr><td><div class=t84 style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t75 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t76 style="width:350px;"><p class=t82 style="text-decoration:none;text-transform:none;color:#666666;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 500 20px/30px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Sorry, your task ID: ${id} got rejected for the following reason. Please fix the issue and Re-Submit from your profile or task page.</p></td>
</tr></table>
</td></tr><tr><td><div class=t103 style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t105 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t106 style="width:350px;"><p class=t112 style="text-decoration:none;text-transform:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 500 20px/30px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Reason: ${req.body.denialreason}</p></td>
</tr></table>
</td></tr><tr><td><div class=t61 style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
<table class=t63 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t64 style="background-color:#0055FF;width:308px;text-align:center;line-height:58px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:14px 14px 14px 14px;"><a class=t70 href=https://tabular.email style="display:block;text-decoration:none;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;font:normal 600 21px/58px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';" target=_blank>Go to Profile</a></td>
</tr></table>
</td></tr><tr><td><div class=t62 style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
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
<table class=t34 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t35 style="width:350px;"><p class=t41 style="text-decoration:none;text-transform:none;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;font:normal 400 12px/19px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">This email was sent to ${userData.email}. If you&#39;re not the intended receipient immediately remove this email from your system and all of it&#39;s content.</p></td>
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

      res.redirect("/admin");
    }
  }
);

router.post("/test/add", isAuthenticated, isAdmin, async (req, res, next) => {
  let c;
  Tests.findOne({}, async (err, data) => {
    if (data) {
      const testdata = await Tests.find().limit(1).sort({ $natural: -1 }); //Checking for the unique ids
      c = testdata[0].test_id + 100;
    } else {
      c = 100;
    }

    let newTest = new Tests({
      test_id: c,
      test_name: req.body.name,
      test_description: req.body.description,
      createdAt: new Date(req.body.date),
      test_grade: req.body.grade,
      test_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      time: req.body.time + `AM`,
      testEnabled: false,
      test_type: req.body.type,
    });

    newTest.save((err, Data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully added records for user tasks");
      }
    });

    res.redirect("/admin");
  });
});

router.get("/tests", isAuthenticated, isAdmin, async (req, res, next) => {
  const test_data = await Tests.find();
  res.render("tests", {
    test_data: test_data,
  });
});

router.get(
  "/tasks/coding",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Admin.findOne({ number: 1 });
    const tasks = data.taskData;

    var codingTasksArray = tasks
      .filter(function (data) {
        return data.task_category === "CODING";
      })
      .map(function (data) {
        return {
          id: data._id,
          task_title: data.task_title,
          task_description: data.task_description,
          task_id: data.task_id,
          task_category: data.task_category,
        };
      });

    const uniqueArray = [
      ...new Map(codingTasksArray.map((m) => [m.task_id, m])).values(),  //Mapping values to the array
    ];

    let length = [];

    uniqueArray.forEach((data) => {
      var array = tasks
        .filter(function (mesure) {
          return mesure.task_id === data.task_id;
        })
        .map(function (mesure) {
          return {
            id: mesure._id,
            task_id: mesure.task_id,
          };
        });

      length.push(array.length);
    });

    res.render("coding", {
      uniqueArray: uniqueArray,
      length: length,
    });
  }
);

router.get(
  "/tasks/design",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Admin.findOne({ number: 1 });
    const tasks = data.taskData;

    const designTasksArray = tasks
      .filter(function (data) {
        return data.task_category === "DESIGN";
      })
      .map(function (data) {
        return {
          id: data._id,
          task_title: data.task_title,
          task_description: data.task_description,
          task_id: data.task_id,
          task_category: data.task_category,
        };
      });

    const uniqueArray = [
      ...new Map(designTasksArray.map((m) => [m.task_id, m])).values(),
    ];

    let length = [];

    uniqueArray.forEach((data) => {
      var array = tasks
        .filter(function (mesure) {
          return mesure.task_id === data.task_id;
        })
        .map(function (mesure) {
          return {
            id: mesure._id,
            task_id: mesure.task_id,
          };
        });

      length.push(array.length);
    });

    res.render("design", {
      uniqueArray: uniqueArray,
      length: length,
    });
  }
);

router.get(
  "/tasks/explore",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Admin.findOne({ number: 1 });
    const tasks = data.taskData;

    const exploreTasksArray = tasks
      .filter(function (data) {
        return data.task_category === "EXPLORE";
      })
      .map(function (data) {
        return {
          id: data._id,
          task_title: data.task_title,
          task_description: data.task_description,
          task_id: data.task_id,
          task_category: data.task_category,
        };
      });

    const uniqueArray = [
      ...new Map(exploreTasksArray.map((m) => [m.task_id, m])).values(),
    ];

    let length = [];

    uniqueArray.forEach((data) => {
      var array = tasks
        .filter(function (mesure) {
          return mesure.task_id === data.task_id;
        })
        .map(function (mesure) {
          return {
            id: mesure._id,
            task_id: mesure.task_id,
          };
        });

      length.push(array.length);
    });

    res.render("explore", {
      uniqueArray: uniqueArray,
      length: length,
    });
  }
);

router.get(
  "/tasks/coding/:id",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Tasks.findOne({ task_id: req.params.id });
    const admin = await Admin.findOne({ number: 1 });
    const tasks = admin.taskData;
    if (data) {
      const codingTasksArray = tasks
        .filter(function (data) {
          return data.task_id === parseInt(req.params.id);
        })
        .map(function (data) {
          return {
            id: data._id,
            username: data.username,
            userid: data.userId,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
            project_url: data.project_url,
            feedback: data.feedback,
          };
        });

      res.render("codingpage", {
        codingTasksArray: codingTasksArray,
      });
    } else {
      return res.json({
        code: 404,
        message:
          "Task ID not found. If you think this is a mistake please message +94776976673",
      });
    }
  }
);

router.get(
  "/tasks/design/:id",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Tasks.findOne({ task_id: req.params.id });
    const admin = await Admin.findOne({ number: 1 });
    const tasks = admin.taskData;
    if (data) {
      const designTasksArray = tasks
        .filter(function (data) {
          return data.task_id === parseInt(req.params.id);
        })
        .map(function (data) {
          return {
            id: data._id,
            username: data.username,
            userid: data.userId,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
            project_url: data.project_url,
            feedback: data.feedback,
          };
        });

      res.render("designpage", {
        designTasksArray: designTasksArray,
      });
    } else {
      return res.json({
        code: 404,
        message:
          "Task ID not found. If you think this is a mistake please message +94776976673",
      });
    }
  }
);

router.get(
  "/tasks/explore/:id",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const data = await Tasks.findOne({ task_id: req.params.id });
    const admin = await Admin.findOne({ number: 1 });
    const tasks = admin.taskData;
    if (data) {
      const exploreTasksArray = tasks
        .filter(function (data) {
          return data.task_id === parseInt(req.params.id);
        })
        .map(function (data) {
          return {
            id: data._id,
            username: data.username,
            userid: data.userId,
            task_title: data.task_title,
            task_description: data.task_description,
            task_id: data.task_id,
            task_category: data.task_category,
            project_url: data.project_url,
            feedback: data.feedback,
          };
        });

      res.render("explorepage", {
        exploreTasksArray: exploreTasksArray,
      });
    } else {
      return res.json({
        code: 404,
        message:
          "Task ID not found. If you think this is a mistake please message +94776976673",
      });
    }
  }
);
 // Most important route in the competition
router.get("/power", isAuthenticated, isAdmin, async (req, res, next) => {
  const data = await IMP.findOne({ power_admin: 1 });
  if(!data){
    let newData = new IMP({
      power_admin: 1,
      competition_enabled: true
    });

    newData.save((err, data) => {
      if(err) console.log(err)
      else {
        console.log("Successfully initialized Power Admin Sequence")
      }
    })
  }
  if (1 !== req.session.userId) {
    return res.json({
      code: 403,
      message: "You are not authorized to access this page",
    });
  } else {
    res.render("power", {
      data: data,
    });
  }
});

router.post(
  "/competition/enable",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    if (1 !== req.session.userId) {
      return res.json({
        code: 403,
        message: "You are not authorized to access this page",
      });
    } else {
      await IMP.updateOne(
        {
          power_admin: 1,
        },
        {
          competition_enabled: true,
        }
      );
    }

    res.redirect("/admin/power");
  }
);

router.post(
  "/competition/disable",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    if (1 !== req.session.userId) {
      return res.json({
        code: 403,
        message: "You are not authorized to access this page",
      });
    } else {
      await IMP.updateOne(
        {
          power_admin: 1,
        },
        {
          competition_enabled: false,
        }
      );
    }

    res.redirect("/admin/power");
  }
);

router.get("/email/send", isAuthenticated, isAdmin, async (req, res, next) => {
  res.render("email");
});

router.post(
  "/email/send/bits",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const user_data = await User.find({ bitsUser: true });
    const emails = user_data.map(function (data) {
      return data.email;
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
        to: emails,
        subject: req.body.subject,
        text: req.body.message, // plain text body
      });

      console.log("Message sent: %s", info.messageId);
    }
    main().catch(console.error);
    res.redirect("/admin/email/send");
  }
);

router.post(
  "/email/send/hypertext",
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    const user_data = await User.find({ hypertextUser: true });
    const emails = user_data.map(function (data) {
      return data.email;
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
        to: emails,
        subject: req.body.subject,
        text: req.body.message, // plain text body
      });

      console.log("Message sent: %s", info.messageId);
    }
    main().catch(console.error);
    res.redirect("/admin/email/send");
  }
);

router.get('/analytics', isAdmin, async(req, res, next) => {
  const data = await Analytics.findOne({ analytics_id: 1043 });
  const userdata = await User.find({ adminUser: false });
  const points = await userTasks.find()
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

  const ageArray = userdata.map(function(data){
    return data.age;
  });

  let pointsArray = points.map(function(data){
    return data.total_points
  });

  let timeSpendArray = data.time_spend.map(function(data){
    return data.time
  });

  let pageClicksArray = data.total_page_clicks.map(function(data){
    return data.clicks
  });

  let buttonClicksArray = data.total_button_clicks.map(function(data){
    return data.clicks
  });

  let linkPressArray = data.total_link_press.map(function(data){
    return data.clicks
  });

  const strigifiedData = JSON.stringify(ageArray);
  const stringifiedPoints = JSON.stringify(pointsArray);
  const stringifiedTime = JSON.stringify(timeSpendArray);
  const stringifiedPageClicks = JSON.stringify(pageClicksArray);
  const stringifiedButtonClicks = JSON.stringify(buttonClicksArray);
  const stringifiedLinkPress = JSON.stringify(linkPressArray)

  let date = new Date()

  res.render("analytics", {
    strigifiedData: strigifiedData,
    data: data,
    userdata: userdata,
    date: date,
    stringifiedPoints: stringifiedPoints,
    stringifiedTime: stringifiedTime,
    stringifiedPageClicks: stringifiedPageClicks,
    stringifiedButtonClicks: stringifiedButtonClicks,
    stringifiedLinkPress: stringifiedLinkPress
  })
})

//Google sheets authentication
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
