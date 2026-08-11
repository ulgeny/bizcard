function MeetingRequestForm({ card }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [date, setDate] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("idle");

  function validate() {
    const nextErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Adınızı girin.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta girin.";
    }
    if (!date) {
      nextErrors.date = "Bir tarih seçin.";
    }
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");

    const payload = {
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
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }

  return (
    <React.Fragment>
      <p className="form-heading">Görüşme talep edin</p>
      <form className="card-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="requester-name">Ad Soyad</label>
          <input
            id="requester-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Adınız Soyadınız"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="requester-email">E-posta</label>
          <input
            id="requester-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta adresiniz"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="requester-date">Tarih</label>
          <input
            id="requester-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
          📅 {status === "submitting" ? "Gönderiliyor..." : "Toplantı Talep Et"}
        </button>

        {status === "success" && (
          <p className="form-status success">Toplantı talebiniz alındı, teşekkürler!</p>
        )}
        {status === "error" && (
          <p className="form-status error">Bir şeyler ters gitti, lütfen tekrar deneyin.</p>
        )}
      </form>
    </React.Fragment>
  );
}
