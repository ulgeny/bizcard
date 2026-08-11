function ContactForm({ card }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [date, setDate] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState(null);

  function validate(action) {
    const nextErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Adınızı girin.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta girin.";
    }
    if (action === "meeting.request" && !date) {
      nextErrors.date = "Bir tarih seçin.";
    }
    return nextErrors;
  }

  function submit(action) {
    const nextErrors = validate(action);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus({ action, state: "submitting" });

    const payload = action === "card.save"
      ? {
          event: "card.save",
          timestamp: new Date().toISOString(),
          card: { id: card.id, name: card.name, url: card.url },
          visitor: { name: name.trim(), email: email.trim(), phone: null },
          context: { source: "web", referrer: document.referrer || null }
        }
      : {
          event: "meeting.request",
          timestamp: new Date().toISOString(),
          card: { id: card.id, name: card.name },
          requester: { name: name.trim(), email: email.trim(), phone: null },
          message: null,
          preferredTime: new Date(date).toISOString(),
          context: { source: "web", referrer: document.referrer || null }
        };

    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => setStatus({ action, state: res.ok ? "success" : "error" }))
      .catch(() => setStatus({ action, state: "error" }));
  }

  const submitting = Boolean(status && status.state === "submitting");

  return (
    <div className="card-form">
      <div className="form-field">
        <label htmlFor="contact-name">Ad Soyad</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Adınız Soyadınız"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="contact-email">E-posta</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-posta adresiniz"
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="contact-date">Tarih</label>
        <input
          id="contact-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        {errors.date && <span className="form-error">{errors.date}</span>}
      </div>

      <div className="actions form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => submit("card.save")}
          disabled={submitting}
        >
          💾 {status && status.action === "card.save" && status.state === "submitting" ? "Gönderiliyor..." : "Kartı Kaydet"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => submit("meeting.request")}
          disabled={submitting}
        >
          📅 {status && status.action === "meeting.request" && status.state === "submitting" ? "Gönderiliyor..." : "Toplantı Talep Et"}
        </button>
      </div>

      {status && status.state === "success" && (
        <p className="form-status success">
          {status.action === "card.save"
            ? "Bilgileriniz kaydedildi, teşekkürler!"
            : "Toplantı talebiniz alındı, teşekkürler!"}
        </p>
      )}
      {status && status.state === "error" && (
        <p className="form-status error">Bir şeyler ters gitti, lütfen tekrar deneyin.</p>
      )}
    </div>
  );
}
