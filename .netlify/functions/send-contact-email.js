const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// CORS headers for the response
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          missingFields 
        })
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Sanitize input data to prevent injection
    const sanitize = (str) => {
      if (!str) return 'Not provided';
      return String(str).replace(/<[^>]*>?/gm, '').trim();
    };

    const sanitizedData = {
      name: sanitize(data.name),
      businessname: sanitize(data.company) || sanitize(data.businessname) || 'Not provided',
      email: sanitize(data.email),
      phone: sanitize(data.phone) || 'Not provided',
      message: sanitize(data.message),
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Load and process the email template
    let emailTemplate;
    try {
      const templatePath = path.join(process.cwd(), 'templates', 'contact-inquiry-email.html');
      emailTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error('Error loading email template:', error);
      // Fallback to a simple HTML template if file not found
      emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head><title>New Inquiry</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #25283D;">New Website Inquiry</h2>
            <p><strong>Hello Jake,</strong></p>
            <p>You've received a new inquiry from your website contact form.</p>
            <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #FDA400; margin: 20px 0;">
              <h3>Contact Details:</h3>
              <p><strong>Name:</strong> {{name}}</p>
              <p><strong>Business Name:</strong> {{businessname}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Phone:</strong> {{phone}}</p>
            </div>
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
              <h3>Message:</h3>
              <p>{{message}}</p>
            </div>
            <hr>
            <p><small>This email was sent automatically from your website contact form at {{timestamp}}.</small></p>
          </div>
        </body>
        </html>
      `;
    }

    // Replace template variables with actual data
    let processedTemplate = emailTemplate;
    Object.keys(sanitizedData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, sanitizedData[key]);
    });

    // Prepare the email parameters
    const emailParams = {
      Source: 'no-reply@honeybeewebdesign.com',
      Destination: {
        ToAddresses: ['jake@honeybeewebdesign.com'] // Your receiving email
      },
      Message: {
        Subject: {
          Data: `[Honeybee Web Design] New Inquiry from ${sanitizedData.name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: processedTemplate,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
New Website Inquiry - Honeybee Web Design

Hello Jake,

You've received a new inquiry from your website contact form.

CONTACT DETAILS:
Name: ${sanitizedData.name}
Business Name: ${sanitizedData.businessname}
Email: ${sanitizedData.email}
Phone: ${sanitizedData.phone}

MESSAGE:
${sanitizedData.message}

---
This email was sent automatically from your website contact form at ${sanitizedData.timestamp}.
            `,
            Charset: 'UTF-8'
          }
        }
      },
      ReplyToAddresses: [sanitizedData.email] // Allow easy reply to customer
    };

    // Send the email
    const result = await ses.sendEmail(emailParams).promise();
    
    console.log('Email sent successfully:', result.MessageId);

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        messageId: result.MessageId
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error.message
      })
    };
  }
};
