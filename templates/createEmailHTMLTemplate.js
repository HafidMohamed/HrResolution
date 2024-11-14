const { TranslationService } = require('../routes/translateRouter'); // Assuming you have this service

async function translateContent(targetLang) {
    const translationKeys = {
      subject: 'Schedule Update',
      greeting: 'Hi',
      introduction: 'Your schedule has been updated. Please review the changes below:',
      viewFullSchedule: 'View Full Schedule',
      scheduleChanges: 'Schedule changes:',
      changedFrom: 'Changed from',
      removedShift: 'Removed shift:',
      newShift: 'New shift:',
      questions: 'If you have any questions or concerns, please contact',
      needMoreHelp: 'Need more help?',
      hereToHelp: "We're here to help you out",
      emailDisclaimer: 'You received this email because you have an account with [Your Company Name]. If you did not request this email, you can safely ignore it.'
    };
  
    try {
      await TranslationService.readTranslations();
  
      const translations = await TranslationService.getTranslations(targetLang, Object.keys(translationKeys));
  
      for (const [key, value] of Object.entries(translationKeys)) {
        if (!translations[key]) {
          translations[key] = await TranslationService.translateAndSave(value, 'en', targetLang, key);
        }
      }
  
      return translations;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

async function createEmailHTMLTemplate(scheduleType, notificationData, targetLang ) {
    const translations = await translateContent(targetLang);

    // Convert to array if it's a single notification object
    const notifications = Array.isArray(notificationData) ? notificationData : [notificationData];

    if (notifications.length === 0) {
        throw new Error('Invalid notifications data');
    }

    const notification = notifications[0]; // We'll use the first notification for general info
    const { firstName, autherEmail } = notification;

    // Collect all changes from all notifications
    const allChanges = notifications.flatMap(n => n.changes);

    // Calculate schedule start and end dates
    const scheduleStartDate = new Date(Math.min(...allChanges.map(c => new Date(c.date)))).toDateString();
    const scheduleEndDate = new Date(Math.max(...allChanges.map(c => new Date(c.date)))).toDateString();

    // Generate the changes table
    let changesHtml = '';
    allChanges.forEach(change => {
        const changeDate = new Date(change.date).toDateString();
        let changeDescription = '';
        if (change.type === 'update') {
            const oldStart = new Date(change.oldStartTime).toLocaleTimeString();
            const oldEnd = new Date(change.oldEndTime).toLocaleTimeString();
            const newStart = new Date(change.newStartTime).toLocaleTimeString();
            const newEnd = new Date(change.newEndTime).toLocaleTimeString();
            changeDescription = `${translations.changedFrom} ${oldStart} - ${oldEnd} to ${newStart} - ${newEnd} (${change.position})`;
        } else if (change.type === 'remove') {
            const start = new Date(change.startTime).toLocaleTimeString();
            const end = new Date(change.endTime).toLocaleTimeString();
            changeDescription = `${translations.removedShift} ${start} - ${end} (${change.position})`;
        } else if (change.type === 'new') {
            const start = new Date(change.startTime).toLocaleTimeString();
            const end = new Date(change.endTime).toLocaleTimeString();
            changeDescription = `${translations.newShift} ${start} - ${end} (${change.position})`;
        }

        changesHtml += `
        <tr>
            <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                ${changeDate}
            </td>
            <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 10px;">
                ${changeDescription}
            </td>
        </tr>
        `;
    });

    // HTML template
    const template = `
<!DOCTYPE html>
<html lang="${targetLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translations.subject}</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#0056b3" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                            <a href="http://www.yourcompany.com" target="_blank">
                                <img alt="Logo" src="https://via.placeholder.com/200x50.png?text=Your+Logo" width="200" height="50" style="display: block; width: 200px; max-width: 200px; min-width: 200px; font-family: 'Lato', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;" border="0">
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#0056b3" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 0;">${translations.subject}</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">${translations.greeting} ${firstName},</p>
                            <p style="margin: 20px 0 0 0;">${translations.introduction}</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 3px;" bgcolor="#0056b3">
                                                    <a href="https://yourcompany.com/schedule" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #0056b3; display: inline-block;">${translations.viewFullSchedule}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">${translations.scheduleChanges}</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                ${changesHtml}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">${translations.questions} <a href="mailto:${autherEmail}" target="_blank" style="color: #0056b3;">${autherEmail}</a>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">${translations.needMoreHelp}</h2>
                            <p style="margin: 0;"><a href="http://www.yourcompany.com" target="_blank" style="color: #0056b3;">${translations.hereToHelp}</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                            <p style="margin: 0;">${translations.emailDisclaimer}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return template;
}

module.exports = createEmailHTMLTemplate;