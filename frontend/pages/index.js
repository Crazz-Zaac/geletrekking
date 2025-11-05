"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/nav.module.css";
import { getAllTrekPackages } from "../src/api/trekPackageApi";

export default function Navbar() {
  const [treks, setTreks] = useState([]);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const data = await getAllTrekPackages();
        setTreks(data || []);
      } catch (err) {
        console.error("❌ Error loading treks:", err);
      }
    };

    fetchTreks();
  }, []);

  return (
    <nav className={styles.nav}>
      {/* ✅ Logo */}
      <Link href="/" className={styles.logoWrapper}>
        <img
          src="https://imgs.search.brave.com/W9J42-2dzJU6-Egw26SmEcuJMX-gannKDRkPL0Sxgbk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTU1/MzUyODQ5L3Bob3Rv/L3R3by1ldXJvLWNv/aW4uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPTNkM0tSOThG/ZWpnREd4NExYLWx4/ZlN4UTVGTjJPcUlf/eks0VDE1LWtVdjQ9"
          alt="Gela Trekking Logo"
          className={styles.logo}
        />
      </Link>

      {/* ✅ Nav Links */}
      <ul className={styles.navLinks}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About Us</Link></li>

        {/* ✅ Destinations Dropdown */}
        <li className={styles.dropdown}>
          <span>Destinations ▼</span>
          <ul className={styles.dropdownContent}>
            {Array.isArray(treks) && treks.length > 0 ? (
              treks.slice(0, 6).map((trek) => (
                <li key={trek._id}>
                  <Link href={`/trek/${trek._id}`}>
                    {trek.name || "Untitled Trek"}
                  </Link>
                </li>
              ))
            ) : (
              <li><span style={{ color: "#888" }}>Loading...</span></li>
            )}

            {/* ✅ View all */}
            <li className={styles.viewAll}>
              <Link href="/trek">View All Packages →</Link>
            </li>
          </ul>
        </li>

        {/* ✅ Optional Activities */}
        <li className={styles.dropdown}>
          <span>Activities ▼</span>
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
