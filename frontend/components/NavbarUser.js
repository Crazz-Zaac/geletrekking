"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/nav.module.css";
import { getAllTrekPackages } from "../src/api/trekPackageApi";

export default function NavbarUser() {
  const [treks, setTreks] = useState([]);

  // Load trek packages
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllTrekPackages();
        setTreks(data || []);
      } catch (err) {
        console.error("Failed to load trek packages:", err);
      }
    };

    load();
  }, []);

  return (
    <nav className={styles.nav}>

      {/* Logo */}
      <Link href="/" className={styles.logoWrapper}>
        <img
          src="/logo.png"
          alt="GeleTrekking Logo"
          className={styles.logo}
        />
      </Link>

      {/* Nav Links */}
      <ul className={styles.navLinks}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About Us</Link></li>

        {/* Destinations */}
        <li className={styles.dropdown}>
          <span>Destinations ▾</span>
          <ul className={styles.dropdownContent}>
            {treks.slice(0, 6).map((trek) => (
              <li key={trek._id}>
                <Link href={`/trek/${trek._id}`}>{trek.name}</Link>
              </li>
            ))}
            <li className={styles.viewAll}>
              <Link href="/trek">View All Packages →</Link>
            </li>
          </ul>
        </li>

        {/* Activities */}
        <li className={styles.dropdown}>
          <span>Activities ▾</span>
          <ul className={styles.dropdownContent}>
            <li><Link href="/activities/paragliding">Paragliding</Link></li>
            <li><Link href="/activities/rafting">Rafting</Link></li>
            <li><Link href="/activities/expeditions">Peak Climbing</Link></li>
            <li><Link href="/activities/cultural">Cultural Tours</Link></li>
            <li><Link href="/activities/mountain-biking">Mountain Biking</Link></li>
          </ul>
        </li>

        <li><Link href="/gallery">Gallery</Link></li>
        <li><Link href="/testimonials">Testimonials</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/contact">Contact Us</Link></li>
      </ul>

    </nav>
  );
}
