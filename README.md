# Better Choice site clone (betterchoice.ir)

A static copy of 24 pages of betterchoice.ir that looks the same as the original, with all its CSS, fonts, images and scripts stored locally.

- Home page: `index.html`
- List pages: workshops, education, textbooks, tests, faq, certificate, news, articles, intl-articles, journal, film-review, therapists
- Detail pages: workshop-detail, education-detail, test-detail, article-detail, product-detail
- Other pages: about, contact, privacy, terms, login, signup

To view it locally:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

The site's back-end features (login, sign-up, payment, search) don't work in this static copy.
