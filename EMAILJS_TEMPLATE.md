# EmailJS Email Template

## Template Configuration

Use this template in your EmailJS dashboard when creating a new email template.

### Template Settings:
- **Template Name**: Portfolio Contact Form
- **Subject**: Portfolio Contact from {{from_name}}

### Email Template Body:

```
Hello Kane,

You have received a new message from your portfolio contact form:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This email was sent from your portfolio website contact form.
Reply directly to {{from_email}} to respond.

Best regards,
Your Portfolio Website
```

### HTML Version (Recommended):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #5dade2 0%, #0a0e27 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .info-box {
      background: white;
      padding: 20px;
      border-left: 4px solid #5dade2;
      margin: 20px 0;
      border-radius: 5px;
    }
    .field-label {
      font-weight: bold;
      color: #5dade2;
      margin-bottom: 5px;
      display: block;
    }
    .field-value {
      margin-bottom: 15px;
      color: #333;
    }
    .message-box {
      background: white;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      margin: 20px 0;
      white-space: pre-wrap;
      font-family: inherit;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }
    .divider {
      border-top: 2px solid #e0e0e0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">📧 New Portfolio Contact</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new message</p>
  </div>
  
  <div class="content">
    <div class="info-box">
      <span class="field-label">From:</span>
      <span class="field-value">{{from_name}}</span>
      
      <span class="field-label" style="margin-top: 15px; display: block;">Email:</span>
      <span class="field-value">
        <a href="mailto:{{from_email}}" style="color: #5dade2; text-decoration: none;">{{from_email}}</a>
      </span>
    </div>
    
    <div class="divider"></div>
    
    <div>
      <span class="field-label">Message:</span>
      <div class="message-box">{{message}}</div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">This email was sent from your portfolio website contact form.</p>
      <p style="margin: 5px 0 0 0;">
        <a href="mailto:{{from_email}}" style="color: #5dade2; text-decoration: none;">Reply to {{from_email}}</a>
      </p>
    </div>
  </div>
</body>
</html>
```

## Setup Instructions:

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/admin/template
2. **Click "Create New Template"**
3. **Template Name**: `portfolio_contact` (or any name you prefer)
4. **Subject**: `Portfolio Contact from {{from_name}}`
5. **Content**: Copy the HTML version above
6. **Save the template**
7. **Copy the Template ID** (it will look like `template_xxxxxxx`)
8. **Update your script.js file** with the Template ID

## Template Variables Used:

- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email address
- `{{message}}` - The message content
- `{{to_email}}` - Your email (kanekabena@gmail.com) - optional, can be hardcoded in template

## Notes:

- The template uses EmailJS's variable syntax: `{{variable_name}}`
- Make sure your EmailJS service is set up (you already have `service_iqsg9ne`)
- The HTML version will render nicely in email clients
- You can customize the colors and styling to match your portfolio theme
