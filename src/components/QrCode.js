function QrCode({ value }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    new QRCode(containerRef.current, { text: value, width: 160, height: 160 });
  }, [value]);

  return (
    <div className="qr-section">
      <div className="qr-box" ref={containerRef}></div>
      <p className="qr-caption">Kartviziti taratarak aç</p>
    </div>
  );
}
