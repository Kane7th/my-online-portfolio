# Kane Kabena — Portfolio

**Live:** [kane7th.github.io/my-online-portfolio](https://kane7th.github.io/my-online-portfolio/)

Static portfolio (HTML, CSS, JavaScript) deployed on GitHub Pages.

## Local preview

```bash
git clone https://github.com/Kane7th/my-online-portfolio.git
cd my-online-portfolio
python -m http.server 8000
```

Open `http://localhost:8000`

## Structure

```
index.html                    # Main page
style.css                     # Styles
script.js                     # Behavior
mysmartrental-case-study.html # Flagship case study
favicon.ico
assets/                       # Project screenshots, OG image
static/images/                # Workspace backgrounds
static/sounds/                # Interaction audio
vps-config/mysmartrental/     # Staging CORS notes (reference)
```

Edit `index.html`, `style.css`, and `script.js` at the repo root — GitHub Pages serves those files.

## Deploy

```bash
git add .
git commit -m "Your message"
git push origin main
```

Changes on `main` publish to GitHub Pages within a few minutes.
