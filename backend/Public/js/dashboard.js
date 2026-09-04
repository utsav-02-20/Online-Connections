const { useEffect, useMemo, useState } = React;

function DashboardPage() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const username = pathParts[0] || "guest";
  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "null") || {};
  const token = storedUser.token || "";

  const [profile, setProfile] = useState({
    username,
    email: storedUser.email || "",
    phone: "",
    phoneVerified: false,
    address: "",
    about: "",
    profilePic: ""
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    let ignore = false;

    fetch(`/api/auth/profile/${username}`)
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        if (!ignore) {
          setProfile({
            username: data.user?.username || username,
            email: data.user?.email || "",
            phone: data.user?.phone || "",
            phoneVerified: Boolean(data.user?.phoneVerified),
            address: data.user?.address || "",
            about: data.user?.about || "",
            profilePic: data.user?.profilePic || ""
          });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setStatus(error.message || "Unable to load profile.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [username]);

  const avatarFallback = useMemo(() => {
    return (profile.username || "U").slice(0, 1).toUpperCase();
  }, [profile.username]);

  const saveProfile = async (nextProfile, message) => {
    if (!token) {
      setStatus("Login required to update profile.");
      return;
    }

    try {
      const response = await fetch(`/api/auth/profile/${username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: nextProfile.email,
          phone: nextProfile.phone,
          phoneVerified: nextProfile.phoneVerified,
          address: nextProfile.address,
          profilePic: nextProfile.profilePic,
          about: nextProfile.about
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedUser = data.user || nextProfile;
      setProfile({
        username: updatedUser.username || username,
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        phoneVerified: Boolean(updatedUser.phoneVerified),
        address: updatedUser.address || "",
        about: updatedUser.about || "",
        profilePic: updatedUser.profilePic || ""
      });
      localStorage.setItem("auth_user", JSON.stringify({
        ...storedUser,
        ...updatedUser,
        token
      }));
      setStatus(message);
    } catch (error) {
      setStatus(error.message || "Unable to update profile.");
    }
  };

  const onChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const updateContact = async (event) => {
    event.preventDefault();
    await saveProfile({ ...profile }, "Contact details updated.");
  };

  const verifyPhone = async () => {
    await saveProfile({ ...profile, phoneVerified: true }, "Phone marked as verified.");
  };

  const removePhone = async () => {
    await saveProfile({ ...profile, phone: "", phoneVerified: false }, "Phone removed.");
  };

  const updateAddress = async (event) => {
    event.preventDefault();
    await saveProfile({ ...profile }, "Address updated.");
  };

  const updateAbout = async (event) => {
    event.preventDefault();
    await saveProfile({ ...profile }, "About section updated.");
  };

  const updateProfilePic = async (event) => {
    event.preventDefault();
    await saveProfile({ ...profile }, "Profile picture updated.");
  };

  const removeProfilePic = async () => {
    await saveProfile({ ...profile, profilePic: "" }, "Profile picture deleted.");
  };

  return (
    <main className="dash-shell">
      <section className="dash-card">
        <div className="dash-topbar">
          <div>
            <p className="eyebrow">My Dashboard</p>
            <h1>{username}</h1>
          </div>
          <div className="dash-links">
            <a className="ghost-btn" href={`/${username}/page_routes`}>User Page</a>
            <a className="ghost-btn" href="/login">Login</a>
          </div>
        </div>

        <p className="intro">
          Manage your minimal user profile here. This dashboard includes email updates, phone verification,
          address editing, profile image controls, and an about section.
        </p>

        <div className="hero-grid">
          <div className="box">
            <strong>Email</strong>
            <span>{profile.email || "No email added"}</span>
          </div>
          <div className="box">
            <strong>Phone</strong>
            <span>{profile.phone ? `${profile.phone}${profile.phoneVerified ? " • Verified" : " • Not verified"}` : "No phone added"}</span>
          </div>
        </div>

        <div className="section-grid">
          <form className="form-card" onSubmit={updateContact}>
            <h2>Update Email</h2>
            <p>Keep your account email current.</p>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={onChange}
                placeholder="you@example.com"
              />
            </label>
            <div className="actions">
              <button className="btn" type="submit">Save Email</button>
            </div>
          </form>

          <form className="form-card" onSubmit={updateContact}>
            <h2>Phone</h2>
            <p>Add or update your phone number.</p>
            <label className="field">
              <span>Phone</span>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={onChange}
                placeholder="+91 9876543210"
              />
            </label>
            <div className="actions">
              <button className="btn" type="submit">Save Phone</button>
              <button className="ghost-btn" type="button" onClick={verifyPhone}>Verify Phone</button>
              <button className="danger-btn" type="button" onClick={removePhone}>Delete Phone</button>
            </div>
          </form>

          <form className="form-card full" onSubmit={updateAddress}>
            <h2>Address</h2>
            <p>Update your address in one place.</p>
            <label className="field">
              <span>Address</span>
              <textarea
                name="address"
                value={profile.address}
                onChange={onChange}
                placeholder="Street, city, state, postal code"
              />
            </label>
            <div className="actions">
              <button className="btn" type="submit">Save Address</button>
            </div>
          </form>

          <form className="form-card full" onSubmit={updateProfilePic}>
            <h2>Profile Picture</h2>
            <p>Add, change, or remove your profile image using an image URL.</p>
            <div className="profile-wrap">
              {profile.profilePic ? (
                <img className="avatar" src={profile.profilePic} alt={`${username} profile`} />
              ) : (
                <div className="avatar placeholder">{avatarFallback}</div>
              )}
              <div>
                <label className="field">
                  <span>Image URL</span>
                  <input
                    type="url"
                    name="profilePic"
                    value={profile.profilePic}
                    onChange={onChange}
                    placeholder="https://example.com/avatar.png"
                  />
                </label>
                <div className="inline-actions">
                  <button className="btn" type="submit">Update Picture</button>
                  <button className="danger-btn" type="button" onClick={removeProfilePic}>Delete Picture</button>
                </div>
              </div>
            </div>
          </form>

          <form className="about-card" onSubmit={updateAbout}>
            <h2>About</h2>
            <p>Write a short about section for your page.</p>
            <label className="field">
              <span>About You</span>
              <textarea
                name="about"
                value={profile.about}
                onChange={onChange}
                placeholder="Write a short intro about yourself"
              />
            </label>
            <div className="actions">
              <button className="btn" type="submit">Save About</button>
            </div>
          </form>
        </div>

        <p className="status">{status}</p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardPage />);
