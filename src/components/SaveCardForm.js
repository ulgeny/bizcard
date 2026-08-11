const N8N_WEBHOOK_URL = "https://n8n.example.com/webhook/kart-kaydet";

function SaveCardForm({ card }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
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
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");

    const payload = {
      event: "card.save",
      timestamp: new Date().toISOString(),
      card: { id: card.id, name: card.name, url: card.url },
      visitor: { name: name.trim(), email: email.trim(), phone: null },
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
    <form className="save-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="visitor-name">Ad Soyad</label>
        <input
          id="visitor-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Adınız Soyadınız"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="visitor-email">E-posta</label>
        <input
          id="visitor-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-posta adresiniz"
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
        💾 {status === "submitting" ? "Gönderiliyor..." : "Kartı Kaydet"}
      </button>

      {status === "success" && (
        <p className="form-status success">Bilgileriniz kaydedildi, teşekkürler!</p>
      )}
      {status === "error" && (
        <p className="form-status error">Bir şeyler ters gitti, lütfen tekrar deneyin.</p>
      )}
    </form>
  );
}
