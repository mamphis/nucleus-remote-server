import { User } from "@prisma/client";
import nodemailer, { Transporter } from 'nodemailer';
import { Logger } from "./logger";

const templateRegistration = (username: string, otp: string, baseUrl: string) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen beim Nucleus Remote Server</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table cellpadding="0" cellspacing="0" width="100%"
        style="background-color: #ffffff; max-width: 800px; margin: 0 auto; padding: 20px;">
        <tr>
            <td colspan="3" style="text-align: center; padding: 20px;">
                <h1>Willkommen beim Nucleus Remote Server</h1>
                <p>Vielen Dank für Ihre Registrierung!</p>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="padding: 0 20px;">
                <p>Hallo,</p>
                <p>Wir freuen uns, Sie als neuen Benutzer des Nucleus Remote Servers begrüßen zu dürfen. Ihre
                    Registrierung war erfolgreich.</p>
                <p>Bitte bewahren Sie Ihre Anmeldeinformationen sicher auf:</p>
                <p><strong>Benutzername:</strong> ${username}</p>
                <p>Für den Zugriff auf den Nucleus Remote Server verwenden Sie bitte den folgenden Link:</p>
                <p><a href="${baseUrl}">Nucleus Remote Server</a></p>
                <p>Zur Verifikation klicken Sie bitte auf den untenstehenden Button:</p>
            </td>
        </tr>
        <tr>
            <td style="width: 30%" />
            <td style="border: none; border-radius: 3px; color: white; cursor: auto; padding: 15px 19px; width: 30%" align="center" valign="middle" bgcolor="#007bff">
                <a href="${baseUrl}/verify/${encodeURIComponent(otp)}" style="text-decoration: none; line-height: 100%; background: #007bff; color: white; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: normal; text-transform: none; margin: 0px" target="_blank" rel="noreferrer">
                    Verifizieren
                </a>
            </td>
            <td style="width: 30%" />
        </tr>
        <tr>
            <td colspan="3" style="padding: 20px;">
                <p>Vielen Dank und viel Spaß bei der Nutzung unseres Dienstes!</p>
                <p>Mit freundlichen Grüßen,<br>Das Nucleus Remote Server Team</p>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="text-align: center; padding: 20px; background-color: #f4f4f4;">
                <p>Bei Fragen wenden Sie sich bitte an <a
                        href="mailto:info@pcsmw.de">info@pcsmw.de</a></p>
            </td>
        </tr>
    </table>
</body>

</html>`;

const templateResetLink = (mail: string, otp: string, baseUrl: string) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen beim Nucleus Remote Server</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table cellpadding="0" cellspacing="0" width="100%"
        style="background-color: #ffffff; max-width: 800px; margin: 0 auto; padding: 20px;">
        <tr>
            <td colspan="3" style="text-align: center; padding: 20px;">
                <h1>Willkommen beim Nucleus Remote Server</h1>
                <h3>Passwort zurücksetzen</h3>
                <p>So können Sie ein neues Passwort anlegen.</p>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="padding: 0 20px;">
                <p>Hallo,</p>
                <p>Wir haben vor kurzem eine Anfrage erhalten, das Passwort für folgendes Konto zurückzusetzen: </p>
                <p><strong>E-Mail:</strong> ${mail}</p>
                <p>Für den Zugriff auf den Nucleus Remote Server verwenden Sie bitte den folgenden Link:</p>
                <p><a href="${baseUrl}">Nucleus Remote Server</a></p>
                <p>Zum Zurücksetzen Ihres Passworts klicken Sie bitte auf den untenstehenden Button:</p>
            </td>
        </tr>
        <tr>
            <td style="width: 30%" />
            <td style="border: none; border-radius: 3px; color: white; cursor: auto; padding: 15px 19px; width: 30%" align="center" valign="middle" bgcolor="#007bff">
                <a href="${baseUrl}/verify/${encodeURIComponent(otp)}" style="text-decoration: none; line-height: 100%; background: #007bff; color: white; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: normal; text-transform: none; margin: 0px" target="_blank" rel="noreferrer">
                    Passwort Zurücksetzen
                </a>
            </td>
            <td style="width: 30%" />
        </tr>
        <tr>
            <td colspan="3" style="padding: 20px;">
                <p>Vielen Dank und viel Spaß bei der Nutzung unseres Dienstes!</p>
                <p>Mit freundlichen Grüßen,<br>Das Nucleus Remote Server Team</p>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="text-align: center; padding: 20px; background-color: #f4f4f4;">
                <p>Bei Fragen wenden Sie sich bitte an <a
                        href="mailto:info@pcsmw.de">info@pcsmw.de</a></p>
            </td>
        </tr>
    </table>
</body>

</html>`;

class Mailer {
    private transporter?: Transporter;
    private uiBaseUrl = '';

    async init() {
        const host = process.env.MAIL_HOST;
        const port = Number(process.env.MAIL_PORT);
        const secure = process.env.MAIL_IS_SECURE?.toLowerCase() === 'true';
        const username = process.env.MAIL_USERNAME;
        const password = process.env.MAIL_PASSWORD;
        const baseUrl = process.env.UI_BASE_URL;

        if (!host || isNaN(port) || !username || !password || !baseUrl) {
            Logger.warn('Cannot initialize mailer because environment variables are not set.');
            return;
        }

        this.uiBaseUrl = baseUrl;

        this.transporter = nodemailer.createTransport({
            host,
            auth: {
                pass: password,
                user: username,
            },
            port,
            secure,
        });

        await this.transporter.verify().catch(err => {
            Logger.warn('Cannot initialize mailer because transporter cannot verify: ', err);
            this.transporter = undefined;
        });
    }

    async sendRegistrationMail(user: Pick<User, 'email' | 'onetimePassword' | 'username'>) {
        if (!this.transporter) {
            return;
        }

        if (user.onetimePassword === '') {
            return;
        }

        this.transporter.sendMail({
            to: user.email,
            from: process.env.MAIL_FROM ?? 'Registration',
            subject: 'Verify Account',
            html: templateRegistration(user.username, user.onetimePassword, this.uiBaseUrl),
        });
    }

    sendResetPasswordMail({ mail, onetimePassword }: { mail: string, onetimePassword: string }) {
        if (!this.transporter) {
            return;
        }

        if (onetimePassword === '') {
            return;
        }

        this.transporter.sendMail({
            to: mail,
            from: process.env.MAIL_FROM ?? 'Registration',
            subject: 'Verify Account',
            html: templateResetLink(mail, onetimePassword, this.uiBaseUrl),
        });
    }
}

const mailer = new Mailer();

export default mailer;