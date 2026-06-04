# ASHSA — Asian Sports Health Association

International conference website for the Asian Sports Health Association (ASHSA).

**Bilingual (ZH/EN) static site** hosted on **GitHub Pages** with **Cloudflare CDN**.

## Site Structure

```
ashsa/
├── index.html              # Language selector (auto-redirect)
├── zh/                     # Chinese pages
│   ├── index.html          # 首页
│   ├── schedule.html       # 会议日程
│   ├── speakers.html       # 演讲嘉宾
│   ├── registration.html   # 注册参会
│   ├── venue.html          # 会场交通
│   └── contact.html        # 联系我们
├── en/                     # English pages
│   ├── index.html          # Home
│   ├── schedule.html       # Program
│   ├── speakers.html       # Speakers
│   ├── registration.html   # Registration
│   ├── venue.html          # Venue & Travel
│   └── contact.html        # Contact
├── css/style.css           # Shared stylesheet
├── js/main.js              # Shared JavaScript
└── images/                 # Image assets (logo, photos, etc.)
```

## Tech Stack

- **Hosting:** GitHub Pages
- **CDN & DNS:** Cloudflare (free plan)
- **Domain Email:** Cloudflare Email Routing (free)
- **Registration Forms:** Google Forms / 腾讯问卷 (embedded)
- **Payment Links:** PayPal / Stripe / Bank transfer info
- **Email Subscription:** Mailchimp (free tier)
- **Video/Livestream:** YouTube / Bilibili (embedded)

## Features

- [x] Bilingual skeleton (ZH/EN)
- [x] Responsive design (mobile → desktop)
- [x] Conference program template
- [x] Speaker showcase template
- [x] Registration info page
- [x] Venue & travel info page
- [x] Contact page with mailing list signup
- [ ] Actual content (awaiting client input)
- [ ] Logo & images
- [ ] Embedded registration form
- [ ] Payment links
- [ ] Video/livestream embeds
- [ ] Domain & Cloudflare setup

## Development

```bash
# Clone
git clone https://github.com/haonL-7/ashsa.git

# Serve locally
python -m http.server 8080
# Then open http://localhost:8080
```

## Deployment

Push to `main` branch → auto-deployed via GitHub Pages.

## Status

🟡 **Skeleton ready** — awaiting client content (association info, conference details, logo, speaker list).

## Credits

- Technical Consultant: Liu Hao'an (刘昊安)
- GitHub: [@haonL-7](https://github.com/haonL-7)
