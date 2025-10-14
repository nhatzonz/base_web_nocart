import React, { useState, useEffect } from 'react';
import '../assets/css/back-to-top.css';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button 
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Lên đầu trang"
            title="Lên đầu trang"
        >
            <i className="fas fa-chevron-up"></i>
        </button>
    );
};

export default BackToTop;
