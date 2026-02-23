/**
 * Email notification service for signature workflow
 * Handles sending professional emails for signature requests, completions, and expirations
 */



export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface SignatureRequestEmailData {
  signerName: string;
  signerEmail: string;
  documentName: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  signatureLink: string;
  expiryDate: string;
  message?: string;
  language?: "es" | "en";
}

export interface SignatureCompletedEmailData {
  signerName: string;
  signerEmail: string;
  documentName: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  signedDate: string;
  certificateId: string;
  language?: "es" | "en";
}

export interface SignatureExpirationEmailData {
  signerName: string;
  signerEmail: string;
  documentName: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  expiryDate: string;
  signatureLink: string;
  language?: "es" | "en";
}

/**
 * Generate signature request email template
 */
export function generateSignatureRequestEmail(
  data: SignatureRequestEmailData
): EmailTemplate {
  const isSpanish = data.language === "es";

  if (isSpanish) {
    return {
      subject: `Solicitud de Firma Digital - ${data.documentName}`,
      htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #667eea; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
    .document-name { font-weight: bold; color: #333; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .compliance { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Solicitud de Firma Digital</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${data.signerName}</strong>,</p>

      <div class="section">
        <p>${data.senderName}${data.senderCompany ? ` de ${data.senderCompany}` : ""} le solicita que firme digitalmente el siguiente documento:</p>
        <div class="document-info">
          <div class="document-name">📄 ${data.documentName}</div>
        </div>
      </div>

      ${
        data.message
          ? `
      <div class="section">
        <h2>Mensaje del Remitente</h2>
        <p>${data.message}</p>
      </div>
      `
          : ""
      }

      <div class="section">
        <h2>Próximos Pasos</h2>
        <p>Para firmar este documento, haga clic en el botón de abajo:</p>
        <a href="${data.signatureLink}" class="cta-button">Firmar Documento</a>
      </div>

      <div class="section">
        <h2>Información Importante</h2>
        <ul>
          <li><strong>Fecha de Vencimiento:</strong> ${data.expiryDate}</li>
          <li><strong>Tipo de Firma:</strong> Firma Digital Calificada (Ley 81 de 2019)</li>
          <li><strong>Seguridad:</strong> Este documento será firmado con certificados digitales autorizados por la Autoridad Nacional de Certificación (ANC)</li>
        </ul>
      </div>

      <div class="compliance">
        <strong>Cumplimiento Legal:</strong> Esta solicitud de firma cumple con la Ley 81 de 2019 sobre Firmas Electrónicas y Transacciones Digitales de la República de Panamá. La firma digital será legalmente vinculante y ejecutable en tribunales panameños.
      </div>

      <div class="section">
        <p>Si tiene preguntas, por favor contacte a ${data.senderName} en <a href="mailto:${data.senderEmail}">${data.senderEmail}</a></p>
      </div>

      <div class="footer">
        <p>Este es un mensaje automatizado. Por favor no responda a este correo electrónico.</p>
        <p>&copy; 2026 Legal Practice Stack. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      textContent: `
Solicitud de Firma Digital

Estimado/a ${data.signerName},

${data.senderName}${data.senderCompany ? ` de ${data.senderCompany}` : ""} le solicita que firme digitalmente el siguiente documento:

Documento: ${data.documentName}

${data.message ? `Mensaje del Remitente:\n${data.message}\n` : ""}

Para firmar este documento, visite el siguiente enlace:
${data.signatureLink}

Información Importante:
- Fecha de Vencimiento: ${data.expiryDate}
- Tipo de Firma: Firma Digital Calificada (Ley 81 de 2019)
- Seguridad: Este documento será firmado con certificados digitales autorizados por la Autoridad Nacional de Certificación (ANC)

Cumplimiento Legal:
Esta solicitud de firma cumple con la Ley 81 de 2019 sobre Firmas Electrónicas y Transacciones Digitales de la República de Panamá. La firma digital será legalmente vinculante y ejecutable en tribunales panameños.

Si tiene preguntas, por favor contacte a ${data.senderName} en ${data.senderEmail}

Este es un mensaje automatizado. Por favor no responda a este correo electrónico.
© 2026 Legal Practice Stack. Todos los derechos reservados.
      `,
    };
  }

  // English version
  return {
    subject: `Digital Signature Request - ${data.documentName}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #667eea; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
    .document-name { font-weight: bold; color: #333; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .compliance { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Digital Signature Request</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${data.signerName}</strong>,</p>

      <div class="section">
        <p>${data.senderName}${data.senderCompany ? ` from ${data.senderCompany}` : ""} is requesting you to digitally sign the following document:</p>
        <div class="document-info">
          <div class="document-name">📄 ${data.documentName}</div>
        </div>
      </div>

      ${
        data.message
          ? `
      <div class="section">
        <h2>Message from Sender</h2>
        <p>${data.message}</p>
      </div>
      `
          : ""
      }

      <div class="section">
        <h2>Next Steps</h2>
        <p>To sign this document, please click the button below:</p>
        <a href="${data.signatureLink}" class="cta-button">Sign Document</a>
      </div>

      <div class="section">
        <h2>Important Information</h2>
        <ul>
          <li><strong>Expiration Date:</strong> ${data.expiryDate}</li>
          <li><strong>Signature Type:</strong> Qualified Digital Signature (Law 81 of 2019)</li>
          <li><strong>Security:</strong> This document will be signed with digital certificates authorized by the National Certification Authority (ANC)</li>
        </ul>
      </div>

      <div class="compliance">
        <strong>Legal Compliance:</strong> This signature request complies with Law 81 of 2019 on Electronic Signatures and Digital Transactions of the Republic of Panama. The digital signature will be legally binding and enforceable in Panamanian courts.
      </div>

      <div class="section">
        <p>If you have any questions, please contact ${data.senderName} at <a href="mailto:${data.senderEmail}">${data.senderEmail}</a></p>
      </div>

      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; 2026 Legal Practice Stack. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Digital Signature Request

Dear ${data.signerName},

${data.senderName}${data.senderCompany ? ` from ${data.senderCompany}` : ""} is requesting you to digitally sign the following document:

Document: ${data.documentName}

${data.message ? `Message from Sender:\n${data.message}\n` : ""}

To sign this document, visit the following link:
${data.signatureLink}

Important Information:
- Expiration Date: ${data.expiryDate}
- Signature Type: Qualified Digital Signature (Law 81 of 2019)
- Security: This document will be signed with digital certificates authorized by the National Certification Authority (ANC)

Legal Compliance:
This signature request complies with Law 81 of 2019 on Electronic Signatures and Digital Transactions of the Republic of Panama. The digital signature will be legally binding and enforceable in Panamanian courts.

If you have any questions, please contact ${data.senderName} at ${data.senderEmail}

This is an automated message. Please do not reply to this email.
© 2026 Legal Practice Stack. All rights reserved.
    `,
  };
}

/**
 * Generate signature completed email template
 */
export function generateSignatureCompletedEmail(
  data: SignatureCompletedEmailData
): EmailTemplate {
  const isSpanish = data.language === "es";

  if (isSpanish) {
    return {
      subject: `✅ Documento Firmado - ${data.documentName}`,
      htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #4caf50; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .compliance { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Documento Firmado Exitosamente</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${data.senderName}</strong>,</p>

      <div class="section">
        <p>El documento ha sido firmado digitalmente por <strong>${data.signerName}</strong>.</p>
        <div class="document-info">
          <div class="info-row">
            <span class="info-label">📄 Documento:</span>
            <span class="info-value">${data.documentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">✍️ Firmante:</span>
            <span class="info-value">${data.signerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Fecha de Firma:</span>
            <span class="info-value">${data.signedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🔐 ID del Certificado:</span>
            <span class="info-value">${data.certificateId}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Detalles de la Firma</h2>
        <ul>
          <li>La firma ha sido validada y es legalmente vinculante</li>
          <li>El certificado digital ha sido verificado por la Autoridad Nacional de Certificación (ANC)</li>
          <li>Se ha generado un registro de auditoría completo para fines de cumplimiento</li>
          <li>El documento ahora está listo para ser archivado o utilizado según sea necesario</li>
        </ul>
      </div>

      <div class="compliance">
        <strong>Cumplimiento Legal:</strong> Esta firma cumple con la Ley 81 de 2019 sobre Firmas Electrónicas y Transacciones Digitales de la República de Panamá. La firma es legalmente vinculante y ejecutable en tribunales panameños.
      </div>

      <div class="section">
        <p>Si tiene preguntas sobre esta firma, por favor contacte a ${data.signerName} en <a href="mailto:${data.signerEmail}">${data.signerEmail}</a></p>
      </div>

      <div class="footer">
        <p>Este es un mensaje automatizado. Por favor no responda a este correo electrónico.</p>
        <p>&copy; 2026 Legal Practice Stack. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      textContent: `
Documento Firmado Exitosamente

Estimado/a ${data.senderName},

El documento ha sido firmado digitalmente por ${data.signerName}.

Detalles de la Firma:
- Documento: ${data.documentName}
- Firmante: ${data.signerName}
- Fecha de Firma: ${data.signedDate}
- ID del Certificado: ${data.certificateId}

Información Adicional:
- La firma ha sido validada y es legalmente vinculante
- El certificado digital ha sido verificado por la Autoridad Nacional de Certificación (ANC)
- Se ha generado un registro de auditoría completo para fines de cumplimiento
- El documento ahora está listo para ser archivado o utilizado según sea necesario

Cumplimiento Legal:
Esta firma cumple con la Ley 81 de 2019 sobre Firmas Electrónicas y Transacciones Digitales de la República de Panamá. La firma es legalmente vinculante y ejecutable en tribunales panameños.

Si tiene preguntas sobre esta firma, por favor contacte a ${data.signerName} en ${data.signerEmail}

Este es un mensaje automatizado. Por favor no responda a este correo electrónico.
© 2026 Legal Practice Stack. Todos los derechos reservados.
      `,
    };
  }

  // English version
  return {
    subject: `✅ Document Signed - ${data.documentName}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #4caf50; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .compliance { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Document Successfully Signed</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${data.senderName}</strong>,</p>

      <div class="section">
        <p>The document has been digitally signed by <strong>${data.signerName}</strong>.</p>
        <div class="document-info">
          <div class="info-row">
            <span class="info-label">📄 Document:</span>
            <span class="info-value">${data.documentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">✍️ Signer:</span>
            <span class="info-value">${data.signerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Signature Date:</span>
            <span class="info-value">${data.signedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🔐 Certificate ID:</span>
            <span class="info-value">${data.certificateId}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Signature Details</h2>
        <ul>
          <li>The signature has been validated and is legally binding</li>
          <li>The digital certificate has been verified by the National Certification Authority (ANC)</li>
          <li>A complete audit trail has been generated for compliance purposes</li>
          <li>The document is now ready to be archived or used as needed</li>
        </ul>
      </div>

      <div class="compliance">
        <strong>Legal Compliance:</strong> This signature complies with Law 81 of 2019 on Electronic Signatures and Digital Transactions of the Republic of Panama. The signature is legally binding and enforceable in Panamanian courts.
      </div>

      <div class="section">
        <p>If you have any questions about this signature, please contact ${data.signerName} at <a href="mailto:${data.signerEmail}">${data.signerEmail}</a></p>
      </div>

      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; 2026 Legal Practice Stack. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Document Successfully Signed

Dear ${data.senderName},

The document has been digitally signed by ${data.signerName}.

Signature Details:
- Document: ${data.documentName}
- Signer: ${data.signerName}
- Signature Date: ${data.signedDate}
- Certificate ID: ${data.certificateId}

Additional Information:
- The signature has been validated and is legally binding
- The digital certificate has been verified by the National Certification Authority (ANC)
- A complete audit trail has been generated for compliance purposes
- The document is now ready to be archived or used as needed

Legal Compliance:
This signature complies with Law 81 of 2019 on Electronic Signatures and Digital Transactions of the Republic of Panama. The signature is legally binding and enforceable in Panamanian courts.

If you have any questions about this signature, please contact ${data.signerName} at ${data.signerEmail}

This is an automated message. Please do not reply to this email.
© 2026 Legal Practice Stack. All rights reserved.
    `,
  };
}

/**
 * Generate signature expiration warning email template
 */
export function generateSignatureExpirationEmail(
  data: SignatureExpirationEmailData
): EmailTemplate {
  const isSpanish = data.language === "es";

  if (isSpanish) {
    return {
      subject: `⏰ Recordatorio: Firma Digital Próxima a Vencer - ${data.documentName}`,
      htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ff9800; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
    .document-name { font-weight: bold; color: #333; }
    .cta-button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Recordatorio de Firma Digital</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${data.signerName}</strong>,</p>

      <div class="warning">
        <strong>⚠️ Importante:</strong> La solicitud de firma para el siguiente documento está próxima a vencer.
      </div>

      <div class="section">
        <p>Aún no ha firmado el documento que le fue enviado:</p>
        <div class="document-info">
          <div class="document-name">📄 ${data.documentName}</div>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Vence: <strong>${data.expiryDate}</strong></p>
        </div>
      </div>

      <div class="section">
        <h2>Próximos Pasos</h2>
        <p>Por favor, firme este documento lo antes posible haciendo clic en el botón de abajo:</p>
        <a href="${data.signatureLink}" class="cta-button">Firmar Documento Ahora</a>
      </div>

      <div class="section">
        <h2>¿Qué Sucede si Vence?</h2>
        <ul>
          <li>La solicitud de firma expirará en la fecha indicada</li>
          <li>Deberá solicitar una nueva firma después de que expire</li>
          <li>Se recomienda actuar rápidamente para evitar retrasos</li>
        </ul>
      </div>

      <div class="section">
        <p>Si tiene preguntas o problemas para firmar, por favor contacte a ${data.senderName} en <a href="mailto:${data.senderEmail}">${data.senderEmail}</a></p>
      </div>

      <div class="footer">
        <p>Este es un mensaje automatizado. Por favor no responda a este correo electrónico.</p>
        <p>&copy; 2026 Legal Practice Stack. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      textContent: `
Recordatorio de Firma Digital

Estimado/a ${data.signerName},

IMPORTANTE: La solicitud de firma para el siguiente documento está próxima a vencer.

Documento: ${data.documentName}
Vence: ${data.expiryDate}

Aún no ha firmado este documento. Por favor, firme lo antes posible visitando el siguiente enlace:
${data.signatureLink}

¿Qué Sucede si Vence?
- La solicitud de firma expirará en la fecha indicada
- Deberá solicitar una nueva firma después de que expire
- Se recomienda actuar rápidamente para evitar retrasos

Si tiene preguntas o problemas para firmar, por favor contacte a ${data.senderName} en ${data.senderEmail}

Este es un mensaje automatizado. Por favor no responda a este correo electrónico.
© 2026 Legal Practice Stack. Todos los derechos reservados.
      `,
    };
  }

  // English version
  return {
    subject: `⏰ Reminder: Digital Signature Expiring Soon - ${data.documentName}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ff9800; font-size: 18px; margin-top: 0; }
    .document-info { background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
    .document-name { font-weight: bold; color: #333; }
    .cta-button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Digital Signature Reminder</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${data.signerName}</strong>,</p>

      <div class="warning">
        <strong>⚠️ Important:</strong> The signature request for the following document is expiring soon.
      </div>

      <div class="section">
        <p>You have not yet signed the document that was sent to you:</p>
        <div class="document-info">
          <div class="document-name">📄 ${data.documentName}</div>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Expires: <strong>${data.expiryDate}</strong></p>
        </div>
      </div>

      <div class="section">
        <h2>Next Steps</h2>
        <p>Please sign this document as soon as possible by clicking the button below:</p>
        <a href="${data.signatureLink}" class="cta-button">Sign Document Now</a>
      </div>

      <div class="section">
        <h2>What Happens if It Expires?</h2>
        <ul>
          <li>The signature request will expire on the indicated date</li>
          <li>You will need to request a new signature after it expires</li>
          <li>We recommend acting quickly to avoid delays</li>
        </ul>
      </div>

      <div class="section">
        <p>If you have any questions or problems signing, please contact ${data.senderName} at <a href="mailto:${data.senderEmail}">${data.senderEmail}</a></p>
      </div>

      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; 2026 Legal Practice Stack. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Digital Signature Reminder

Dear ${data.signerName},

IMPORTANT: The signature request for the following document is expiring soon.

Document: ${data.documentName}
Expires: ${data.expiryDate}

You have not yet signed this document. Please sign it as soon as possible by visiting the following link:
${data.signatureLink}

What Happens if It Expires?
- The signature request will expire on the indicated date
- You will need to request a new signature after it expires
- We recommend acting quickly to avoid delays

If you have any questions or problems signing, please contact ${data.senderName} at ${data.senderEmail}

This is an automated message. Please do not reply to this email.
© 2026 Legal Practice Stack. All rights reserved.
    `,
  };
}

/**
 * Send email notification
 * In production, this would integrate with SendGrid, AWS SES, or similar
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // In production, this would call the actual email service
    // For now, we'll log and return success
    console.log(`📧 Email Notification:`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Status: Queued for delivery`);

    // Simulate email delivery
    return {
      success: true,
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send signature request notification
 */
export async function sendSignatureRequestNotification(
  data: SignatureRequestEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = generateSignatureRequestEmail(data);
  return sendEmailNotification(
    data.signerEmail,
    template.subject,
    template.htmlContent,
    template.textContent
  );
}

/**
 * Send signature completed notification
 */
export async function sendSignatureCompletedNotification(
  data: SignatureCompletedEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = generateSignatureCompletedEmail(data);
  return sendEmailNotification(
    data.senderEmail,
    template.subject,
    template.htmlContent,
    template.textContent
  );
}

/**
 * Send signature expiration warning notification
 */
export async function sendSignatureExpirationNotification(
  data: SignatureExpirationEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = generateSignatureExpirationEmail(data);
  return sendEmailNotification(
    data.signerEmail,
    template.subject,
    template.htmlContent,
    template.textContent
  );
}
