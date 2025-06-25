import { useState } from "react";
import styles from "./styles/nav.module.css";

export default function Dropdown() {
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [isDestinationsOpen, setDestinationsOpen] = useState(false);

  // Close other dropdown when one opens (optional)
  const toggleGallery = () => {
    setGalleryOpen(!isGalleryOpen);
    if (!isGalleryOpen) setDestinationsOpen(false);
  };

  const toggleDestinations = () => {
    setDestinationsOpen(!isDestinationsOpen);
    if (!isDestinationsOpen) setGalleryOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <img
        src="https://imgs.search.brave.com/W9J42-2dzJU6-Egw26SmEcuJMX-gannKDRkPL0Sxgbk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTU1/MzUyODQ5L3Bob3Rv/L3R3by1ldXJvLWNv/aW4uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPTNkM0tSOThG/ZWpnREd4NExYLWx4/ZlN4UTVGTjJPcUlf/eks0VDE1LWtVdjQ9"
        alt="logo"
      ></img>
      <div className={styles.home}>
        <div>
          <a href="#">Home</a>
          <a href="#" style={{ marginLeft: "20px" }}>
            About us
          </a>
        </div>
        <div className={styles.dropdown}>
          <button
            className={styles.dropbtn}
            onClick={toggleGallery}
            aria-haspopup="true"
            aria-expanded={isGalleryOpen}
          >
            Gallery ▼
          </button>

          {isGalleryOpen && (
            <ul className={styles.dropdownContent} role="menu">
              <li role="menuitem">
                <a href="#">Photos</a>
              </li>
              <li role="menuitem">
                <a href="#">Videos</a>
              </li>
              <li role="menuitem">
                <a href="#">Artworks</a>
              </li>
            </ul>
          )}
        </div>

        <div className={styles.dropdown}>
          <button
            className={styles.dropbtn}
            onClick={toggleDestinations}
            aria-haspopup="true"
            aria-expanded={isDestinationsOpen}
          >
            Destinations ▼
          </button>

          {isDestinationsOpen && (
            <ul className={styles.dropdownContent} role="menu">
              <li role="menuitem">
                <a href="#">Europe</a>
              </li>
              <li role="menuitem">
                <a href="#">Asia</a>
              </li>
              <li role="menuitem">
                <a href="#">America</a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
