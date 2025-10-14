import React from 'react';
import '../assets/css/loading-skeleton.css';

export const ProductSkeleton = () => (
    <div className="skeleton-product-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-code"></div>
            <div className="skeleton-line skeleton-price"></div>
        </div>
    </div>
);

export const BannerSkeleton = () => (
    <div className="skeleton-banner">
        <div className="skeleton-banner-content"></div>
    </div>
);

export const CategorySkeleton = () => (
    <div className="skeleton-category">
        <div className="skeleton-category-header">
            <div className="skeleton-line skeleton-category-title"></div>
            <div className="skeleton-pagination"></div>
        </div>
        <div className="skeleton-products-grid">
            {[...Array(5)].map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    </div>
);

export const HomePageSkeleton = () => (
    <div className="skeleton-homepage">
        <BannerSkeleton />
        <div className="skeleton-sub-banners">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-sub-banner"></div>
            ))}
        </div>
        {[...Array(2)].map((_, i) => (
            <CategorySkeleton key={i} />
        ))}
    </div>
);

export default {
    ProductSkeleton,
    BannerSkeleton,
    CategorySkeleton,
    HomePageSkeleton
};
