exports.generateApproveEmail = (senderName, recieverName, recieverEmail) => {
	return {
		from: `"BITS 22" <${senderName}>`,
		to: recieverEmail,
		subject: `Hello ${recieverName}`,
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
<table class=t75 role=presentation cellpadding=0 cellspacing=0 align=center><tr><td class=t76 style="width:350px;"><p class=t82 style="text-decoration:none;text-transform:none;color:#666666;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;font:normal 500 20px/30px BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif, 'Fira Sans';">Congradulations. Your Task ID: ${id} has been accepted and will count towards in the competition.</p></td>
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
	};
};

exports.generateRejectEmail = (senderName, recieverName, recieverEmail) => {
	return {
		from: `"BITS 22" <${senderName}>`,
		to: recieverEmail,
		subject: `Hello ${recieverName}`,
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
	};
};
