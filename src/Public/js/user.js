const { useEffect, useState } = React;

function UserPage() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const username = pathParts[0] || "guest";
  const savedUser = JSON.parse(localStorage.getItem("auth_user") || "null");
  const token = savedUser?.token || "";
  const [profile, setProfile] = useState({
    username: savedUser?.username || username,
    email: savedUser?.email || "",
    profilePic: "",
    about: "",
    friends: [],
  });
  const [status, setStatus] = useState("");
  const [finderOpen, setFinderOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");

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
            profilePic: data.user?.profilePic || "",
            about: data.user?.about || "",
            friends: Array.isArray(data.user?.friends) ? data.user.friends : [],
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

  const logout = () => {
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  };

  const runSearch = async () => {
    const query = searchValue.trim();

    if (!query) {
      setSearchResults([]);
      setSearchStatus("Enter a username to search.");
      return;
    }

    setSearchStatus("Searching...");

    try {
      const response = await fetch(`/api/auth/users/search?username=${encodeURIComponent(query)}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to search users.");
      }

      const users = Array.isArray(data.users) ? data.users : [];
      const filteredUsers = users.filter((user) => user.username !== username);
      setSearchResults(filteredUsers);
      setSearchStatus(filteredUsers.length ? "" : "No matching usernames found.");
    } catch (error) {
      setSearchStatus(error.message || "Unable to search users.");
    }
  };

  const addFriend = async (friendUsername) => {
    if (!token) {
      setSearchStatus("Login required to add a friend.");
      return;
    }

    try {
      const response = await fetch(`/api/auth/friends/${username}/${friendUsername}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to add friend.");
      }

      setProfile((prev) => ({
        ...prev,
        friends: Array.isArray(data.user?.friends) ? data.user.friends : prev.friends,
      }));
      setSearchStatus(`${friendUsername} added.`);
    } catch (error) {
      setSearchStatus(error.message || "Unable to add friend.");
    }
  };

  return (
    <main className="page-shell">
      <section className="page-card">
        <div className="page-topbar">
          <p className="page-label top-label">User Page</p>
          <div className="nav-actions">
            <a className="ghost-btn top-link" href={`/${username}/my_dashboard`}>Dashboard</a>
            <button
              type="button"
              className="btn top-link highlight-link"
              onClick={() => setFinderOpen((prev) => !prev)}
            >
              Find Friends
            </button>
          </div>
        </div>

        <div className="page-layout">
          <aside className="profile-panel">
            {profile.profilePic ? (
              <img className="profile-image" src={profile.profilePic} alt={`${username} profile`} />
            ) : (
              <div className="profile-image profile-fallback">
                {(profile.username || username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <h1>{profile.username || username}</h1>
            <p className="profile-subtitle">{profile.email || "No email available"}</p>
            <div className="about-box">
              <p className="page-label">About</p>
              <p>{profile.about || "This user has not added an about section yet."}</p>
            </div>
          </aside>

          <section className="content-panel">
            <p className="page-label">Profile</p>
            <h2>{username}</h2>
            <p className="intro-copy">
              This page now focuses on your profile and friends list.
            </p>

            <div className="user-grid">
              <div className="info-box">
                <strong>Username</strong>
                <span>{profile.username || username}</span>
              </div>
              <div className="info-box">
                <strong>Email</strong>
                <span>{profile.email || "No email available"}</span>
              </div>
            </div>

            {finderOpen ? (
              <div className="friend-search-box">
                <strong>Find and Add Friend</strong>
                <div className="friend-search-row">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search username"
                  />
                  <button type="button" className="btn" onClick={runSearch}>Search</button>
                </div>
                {searchStatus ? <p className="profile-status">{searchStatus}</p> : null}
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div key={user.username} className="search-item">
                      <span>{user.username}</span>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => addFriend(user.username)}
                        disabled={profile.friends.includes(user.username)}
                      >
                        {profile.friends.includes(user.username) ? "Added" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="friends-box">
              <strong>Friends</strong>
              <div className="friends-list">
                {profile.friends.length ? (
                  profile.friends.map((friend) => (
                    <span key={friend} className="friend-pill">{friend}</span>
                  ))
                ) : (
                  <p className="empty-copy">No friends added yet.</p>
                )}
              </div>
            </div>

            {status ? <p className="profile-status">{status}</p> : null}

            <div className="actions">
              <a className="ghost-btn" href="/login">Back to login</a>
              <button className="btn" onClick={logout}>Logout</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<UserPage />);
