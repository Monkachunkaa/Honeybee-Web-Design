const AWS = require('aws-sdk');

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.HONEYBEE_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.HONEYBEE_AWS_SECRET_ACCESS_KEY,
  region: process.env.HONEYBEE_AWS_REGION || 'us-east-1'
});

// CORS headers for the response
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  console.log('Function invoked with method:', event.httpMethod);
  console.log('Function invoked with body:', event.body);
  
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
    console.log('Starting email processing...');
    
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
    
    // Check if we're in local development (only skip AWS if explicitly using test credentials)
    const isLocalDev = process.env.HONEYBEE_AWS_ACCESS_KEY_ID.includes('test') ||
                       process.env.HONEYBEE_AWS_ACCESS_KEY_ID.includes('your_real');
    
    if (isLocalDev) {
      console.log('=== LOCAL DEVELOPMENT MODE ===');
      console.log('Email would be sent to: jake@honeybeewebdesign.com');
      console.log('From:', sanitizedData.name, '<' + sanitizedData.email + '>');
      console.log('Subject: [Honeybee Web Design] New Inquiry from', sanitizedData.name);
      console.log('Business:', sanitizedData.businessname);
      console.log('Phone:', sanitizedData.phone);
      console.log('Message:', sanitizedData.message);
      console.log('Timestamp:', sanitizedData.timestamp);
      console.log('==============================');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Form processed successfully (local dev mode - no email sent)',
          messageId: 'local-dev-' + Date.now()
        })
      };
    }

    // Production mode - actually send email
    console.log('Production mode - sending email via AWS SES...');

    // Load the email template (embedded to avoid path issues in production)
    const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry from {{name}} - Honeybee Web Design</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif, Arial;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background-color: #25283D;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
            font-size: 16px;
        }
        .contact-details {
            background-color: #f8f9fa;
            border-left: 4px solid #FDA400;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .contact-details strong {
            color: #25283D;
            display: inline-block;
            min-width: 120px;
        }
        .message-section {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .message-content {
            font-style: italic;
            color: #555;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .email-footer {
            background-color: #25283D;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .highlight {
            color: #FDA400;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 25px 0;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 4px;
            }
            .email-body {
                padding: 20px;
            }
            .contact-details,
            .message-section {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 style="color: #FDA400; margin: 0; font-size: 24px;">🐝 New Website Inquiry</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Honeybee Web Design</p>
        </div>
        <div class="email-body">
            <p style="margin-top: 0; font-size: 18px; color: #25283D;"><strong>Hello Jake,</strong></p>
            <p>You've received a new inquiry from your website contact form. A potential client is interested in your web design services!</p>
            <div class="contact-details">
                <h3 style="margin-top: 0; color: #25283D; font-size: 18px;">📋 Contact Details</h3>
                <p style="margin: 10px 0;"><strong>Name:</strong> {{name}}</p>
                <p style="margin: 10px 0;"><strong>Business Name:</strong> {{businessname}}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:{{email}}" style="color: #FDA400; text-decoration: none;">{{email}}</a></p>
                <p style="margin: 10px 0;"><strong>Phone:</strong> {{phone}}</p>
            </div>
            <div class="message-section">
                <h3 style="margin-top: 0; color: #25283D; font-size: 18px;">💬 Their Message</h3>
                <div class="message-content">{{message}}</div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #25283D;">
                    <strong>⏰ Quick Response Tip:</strong> 
                    <span class="highlight">Respond within 2 hours</span> to maximize conversion!
                </p>
                <p style="margin: 15px 0;">
                    <a href="mailto:{{email}}?subject=Re: Your Website Inquiry - Let's Build Something Amazing!" 
                       style="background-color: #FDA400; color: #25283D; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        📧 Reply Now
                    </a>
                </p>
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 0;">
                This email was sent automatically from your website contact form.<br>
                <strong>Website:</strong> honeybeewebdesign.com<br>
                <strong>Time:</strong> {{timestamp}}
            </p>
        </div>
        <div class="email-footer">
            <p style="margin: 0; font-size: 14px;">
                <strong>Honeybee Web Design</strong><br>
                Professional Web Design Services<br>
                📞 (336) 687-6989 | 📧 jake@honeybeewebdesign.com
            </p>
        </div>
    </div>
</body>
</html>`;

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
