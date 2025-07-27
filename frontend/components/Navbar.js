import { useState } from "react";
import styles from "../styles/nav.module.css";
import Link from "next/link";

export default function Navbar() {
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [isDestinationsOpen, setDestinationsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleGallery = () => {
    setGalleryOpen(!isGalleryOpen);
    if (!isGalleryOpen) setDestinationsOpen(false);
  };

  const toggleDestinations = () => {
    setDestinationsOpen(!isDestinationsOpen);
    if (!isDestinationsOpen) setGalleryOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
    // Close all dropdowns when mobile menu toggles
    setGalleryOpen(false);
    setDestinationsOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img
          src="https://imgs.search.brave.com/W9J42-2dzJU6-Egw26SmEcuJMX-gannKDRkPL0Sxgbk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTU1/MzUyODQ5L3Bob3Rv/L3R3by1ldXJvLWNv/aW4uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPTNkM0tSOThG/ZWpnREd4NExYLWx4/ZlN4UTVGTjJPcUlf/eks0VDE1LWtVdjQ9"
          alt="Logo"
        />
      </div>

      <button className={styles.hamburger} onClick={toggleMobileMenu} aria-label="Toggle Menu">
        ☰
      </button>

      <div
        className={`${styles.menu} ${isMobileMenuOpen ? styles.show : ""}`}
      >
        <Link href="/" legacyBehavior>
          <a>Home</a>
        </Link>
        <Link href="/about" legacyBehavior>
          <a>About Us</a>
        </Link>
        <Link href="#" legacyBehavior>
          <a>Testimonials</a>
        </Link>

        <div className={styles.dropdown}>
          <button onClick={toggleGallery}>
            Gallery ▼
          </button>
          {isGalleryOpen && (
            <ul className={styles.dropdownContent}>
              <li><a href="#">Photos</a></li>
              <li><a href="#">Videos</a></li>
              <li><a href="#">Artworks</a></li>
            </ul>
          )}
        </div>

        <div className={styles.dropdown}>
          <button onClick={toggleDestinations}>
            Destinations ▼
          </button>
          {isDestinationsOpen && (
            <ul className={styles.dropdownContent}>
              <li><a href="#">Europe</a></li>
              <li><a href="#">Asia</a></li>
              <li><a href="#">America</a></li>
            </ul>
          )}
        </div>

        <Link href="/contactus" legacyBehavior>
          <a>Contact Us</a>
        </Link>
      </div>
    </nav>
  );
}
