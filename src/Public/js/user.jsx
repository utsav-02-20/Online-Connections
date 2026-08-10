const { useState, useRef } = React;

function UserPage() {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("Aarav Kumar");
  const [role, setRole] = useState("Product Engineer");
  const [bio, setBio] = useState("Building calm, focused interfaces with a strong eye for clarity and polish.");
  const [email, setEmail] = useState("aarav@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [verified, setVerified] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [address, setAddress] = useState({
    street: "Boring Road, House 42",
    city: "Patna",
    state: "Bihar",
    pin: "800001",
    country: "India",
  });
  const [toast, setToast] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(email);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(address);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState({ name, role, bio });

  const fileRef = useRef(null);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const openPicker = () => {
    fileRef.current?.click();
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
      showToast("Profile photo updated.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveEmail = () => {
    const nextEmail = emailDraft.trim();

    if (!nextEmail.includes("@") || !nextEmail.includes(".")) {
      showToast("Enter a valid email address.");
      return;
    }

    setEmail(nextEmail);
    setEditingEmail(false);
    showToast("Email updated.");
  };

  const onOtpChange = (index, value) => {
    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);
  };

  const sendCode = () => {
    if (!phoneDraft.trim()) {
      showToast("Enter a phone number first.");
      return;
    }

    setOtpVisible(true);
    setVerified(false);
    setOtp(["", "", "", "", "", ""]);
    showToast("OTP: 123456");
  };

  const verifyPhone = () => {
    if (otp.join("") !== "123456") {
      showToast("Incorrect OTP. Use 123456.");
      return;
    }

    setPhone(phoneDraft.trim());
    setVerified(true);
    setEditingPhone(false);
    setOtpVisible(false);
    setOtp(["", "", "", "", "", ""]);
    showToast("Phone verified and updated.");
  };

  const saveAddress = () => {
    setAddress(addressDraft);
    setEditingAddress(false);
    showToast("Address updated.");
  };

  const saveAbout = () => {
    setName(aboutDraft.name.trim() || name);
    setRole(aboutDraft.role.trim() || role);
    setBio(aboutDraft.bio.trim() || bio);
    setEditingAbout(false);
    showToast("About details saved.");
  };

  const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.pin}, ${address.country}`;

  return (
    <div className="settings-page">
      <div className="settings-shell">
        <header className="settings-header">
          <div className="brand">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">AUTH</p>
              <h1>User Settings</h1>
            </div>
          </div>

          <div className="tabs">
            <button type="button" className={tab === "profile" ? "tab active" : "tab"} onClick={() => setTab("profile")}>
              Profile
            </button>
            <button type="button" className={tab === "about" ? "tab active" : "tab"} onClick={() => setTab("about")}>
              About
            </button>
          </div>
        </header>

        {tab === "profile" ? (
          <main className="card-stack">
            <section className="settings-card avatar-card">
              <div className="avatar-wrap">
                <div className="avatar">
                  {avatar ? <img src={avatar} alt="Profile" /> : <span>{initials}</span>}
                  <button type="button" className="camera-btn" onClick={openPicker} aria-label="Edit photo">
                    +
                  </button>
                </div>

                <div className="avatar-copy">
                  <p className="eyebrow">Profile Picture</p>
                  <h2>{name}</h2>
                  <p>Upload a clean profile image. JPG or PNG, maximum 5MB.</p>

                  <div className="button-row">
                    <button type="button" className="btn btn-dark" onClick={openPicker}>
                      {avatar ? "Change Photo" : "Add Photo"}
                    </button>
                    {avatar ? (
                      <button type="button" className="btn" onClick={() => { setAvatar(""); showToast("Profile photo removed."); }}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            </section>

            <section className="settings-card">
              <div className="card-head">
                <div>
                  <p className="field-label">Email Address</p>
                  <p className="value">{email}</p>
                </div>
                <button type="button" className="btn" onClick={() => { setEmailDraft(email); setEditingEmail((prev) => !prev); }}>
                  {editingEmail ? "Close" : "Update"}
                </button>
              </div>

              {editingEmail ? (
                <div className="inline-editor">
                  <input className="input" value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} placeholder="you@example.com" />
                  <button type="button" className="btn btn-dark" onClick={saveEmail}>Save</button>
                  <button type="button" className="btn" onClick={() => { setEmailDraft(email); setEditingEmail(false); }}>Cancel</button>
                </div>
              ) : null}
            </section>

            <section className="settings-card">
              <div className="card-head">
                <div>
                  <p className="field-label">Phone Number</p>
                  <div className="phone-row">
                    <p className="value">{phone}</p>
                    {verified ? <span className="verified-badge">✓ Verified</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setPhoneDraft(phone);
                    setEditingPhone((prev) => !prev);
                    setOtpVisible(false);
                    setOtp(["", "", "", "", "", ""]);
                  }}
                >
                  {editingPhone ? "Close" : "Update"}
                </button>
              </div>

              {editingPhone ? (
                <div className="phone-editor">
                  <div className="inline-editor">
                    <input className="input" value={phoneDraft} onChange={(event) => setPhoneDraft(event.target.value)} placeholder="+91 98765 43210" />
                    <button type="button" className="btn btn-dark" onClick={sendCode}>Send Code</button>
                  </div>

                  {otpVisible ? (
                    <div className="otp-wrap">
                      <div className="otp-row">
                        {otp.map((digit, index) => (
                          <input key={index} className="otp-input" value={digit} maxLength={1} onChange={(event) => onOtpChange(index, event.target.value)} />
                        ))}
                      </div>
                      <button type="button" className="btn btn-dark" onClick={verifyPhone}>Verify & Update</button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="settings-card">
              <div className="card-head">
                <div>
                  <p className="field-label">Address</p>
                  <p className="value value-soft">{formattedAddress}</p>
                </div>
                <button type="button" className="btn" onClick={() => { setAddressDraft(address); setEditingAddress((prev) => !prev); }}>
                  {editingAddress ? "Close" : "Update"}
                </button>
              </div>

              {editingAddress ? (
                <div className="form-grid">
                  <input className="input" value={addressDraft.street} onChange={(event) => setAddressDraft({ ...addressDraft, street: event.target.value })} placeholder="Street" />
                  <div className="two-col">
                    <input className="input" value={addressDraft.city} onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })} placeholder="City" />
                    <input className="input" value={addressDraft.state} onChange={(event) => setAddressDraft({ ...addressDraft, state: event.target.value })} placeholder="State" />
                  </div>
                  <div className="two-col">
                    <input className="input" value={addressDraft.pin} onChange={(event) => setAddressDraft({ ...addressDraft, pin: event.target.value })} placeholder="PIN" />
                    <input className="input" value={addressDraft.country} onChange={(event) => setAddressDraft({ ...addressDraft, country: event.target.value })} placeholder="Country" />
                  </div>
                  <div className="button-row">
                    <button type="button" className="btn btn-dark" onClick={saveAddress}>Save Address</button>
                  </div>
                </div>
              ) : null}
            </section>
          </main>
        ) : (
          <main className="card-stack">
            <section className="settings-card">
              <p className="field-label">About This Page</p>
              <h2 className="section-title">Minimal, polished settings for AUTH.</h2>
              <p className="copy">
                This page gives the project a clean user settings surface with a profile picture workflow,
                email updates, mock phone verification, address editing, and a personal About section.
              </p>
              <ul className="feature-list">
                <li>Profile photo add, change, preview, and delete without a backend upload.</li>
                <li>Inline email editing with simple validation.</li>
                <li>Mock OTP phone verification flow using the demo code `123456`.</li>
                <li>Editable address form with a responsive two-column layout.</li>
                <li>About content ready to connect later to `src/controllers/auth.controller.js` and `src/models/user.model.js`.</li>
              </ul>
            </section>

            <section className="settings-card">
              <div className="card-head">
                <div>
                  <p className="field-label">About Me</p>
                  <p className="value">{name}</p>
                  <p className="value value-soft">{role}</p>
                </div>
                <button type="button" className="btn" onClick={() => { setAboutDraft({ name, role, bio }); setEditingAbout((prev) => !prev); }}>
                  {editingAbout ? "Close" : "Edit"}
                </button>
              </div>

              {editingAbout ? (
                <div className="form-grid">
                  <input className="input" value={aboutDraft.name} onChange={(event) => setAboutDraft({ ...aboutDraft, name: event.target.value })} placeholder="Name" />
                  <input className="input" value={aboutDraft.role} onChange={(event) => setAboutDraft({ ...aboutDraft, role: event.target.value })} placeholder="Role" />
                  <textarea className="textarea" rows="5" value={aboutDraft.bio} onChange={(event) => setAboutDraft({ ...aboutDraft, bio: event.target.value })} placeholder="Write a short bio" />
                  <div className="button-row">
                    <button type="button" className="btn btn-dark" onClick={saveAbout}>Save</button>
                    <button type="button" className="btn" onClick={() => { setAboutDraft({ name, role, bio }); setEditingAbout(false); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="copy copy-tight">{bio}</p>
              )}
            </section>
          </main>
        )}
      </div>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<UserPage />);
