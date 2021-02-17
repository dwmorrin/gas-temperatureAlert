class Email {
  constructor({ to = "", subject = "" }) {
    this.to = to;
    this.subject = subject;
    this.template = HtmlService.createTemplateFromFile("EmailTemplate");
    this.template.links = [];
  }

  /**
   * @param {string} text
   */
  set body(text) {
    this.body = text;
    this.template.body = text;
  }

  /**
   * @param {string} text
   */
  set subject(text) {
    this.subject = text;
  }

  appendLink(url, text) {
    this.template.links.push([url, text]);
  }

  send() {
    if (!this.body) throw new BadEmailException("no email body");

    MailApp.sendEmail({
      to: this.to,
      subject: this.subject,
      body: this.body,
      htmlBody: template.evaluate().getContent(),
    });
  }
}
