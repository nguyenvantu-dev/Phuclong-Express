'use client';

import { useEffect, useRef, useState } from 'react';
import { FaBoxOpen, FaFileInvoice, FaUsers, FaHandshake } from 'react-icons/fa';

/**
 * Stats Section Component
 *
 * Displays animated counters for package counts, orders, customers, and partners.
 * Uses Intersection Observer to trigger count-up animation on scroll.
 */
export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: 1435, label: 'KIỆN HÀNG ĐÃ GIAO', icon: FaBoxOpen },
    { value: 2675, label: 'ĐƠN HÀNG', icon: FaFileInvoice },
    { value: 4436, label: 'KHÁCH HÀNG', icon: FaUsers },
    { value: 749, label: 'ĐỐI TÁC DOANH NGHIỆP', icon: FaHandshake },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="wrapper" ref={sectionRef}>
      <div className="container1">
        <i className="fas fa-solid fa-people-carry-box" aria-hidden="true"></i>
        <span className="num" data-val="1435">
          {isVisible ? stats[0].value.toLocaleString() : '0'}
        </span>
        <span className="text">{stats[0].label}</span>
      </div>
      <div className="container1">
        <i className="fas fa-solid fa-file-invoice" aria-hidden="true"></i>
        <span className="num" data-val="2675">
          {isVisible ? stats[1].value.toLocaleString() : '0'}
        </span>
        <span className="text">{stats[1].label}</span>
      </div>
      <div className="container1">
        <i className="fas fa-solid fa-users" aria-hidden="true"></i>
        <span className="num" data-val="4436">
          {isVisible ? stats[2].value.toLocaleString() : '0'}
        </span>
        <span className="text">{stats[2].label}</span>
      </div>
      <div className="container1 container1__end">
        <i className="fas fa-solid fa-handshake" aria-hidden="true"></i>
        <span className="num" data-val="749">
          {isVisible ? stats[3].value.toLocaleString() : '0'}
        </span>
        <span className="text">{stats[3].label}</span>
      </div>
    </div>
  );
}