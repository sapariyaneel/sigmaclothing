import React from 'react';

// Default image dimensions
const DEFAULT_DIMENSIONS = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 }
};

// Generate srcSet for responsive images
export const generateSrcSet = (imageUrl, sizes = ['thumbnail', 'small', 'medium', 'large']) => {
    if (!imageUrl) return '';

    // If the image is already from a CDN that supports dynamic resizing (like Cloudinary),
    // we can use their URL parameters
    if (imageUrl.includes('cloudinary.com')) {
        return sizes
            .map(size => {
                const { width } = DEFAULT_DIMENSIONS[size];
                const optimizedUrl = imageUrl.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
                return `${optimizedUrl} ${width}w`;
            })
            .join(', ');
    }

    // For regular images, we'll use the original size
    return imageUrl;
};

// Get appropriate size based on viewport
export const getSizes = (breakpoints = {}) => {
    const defaultSizes = '(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw';
    return breakpoints.sizes || defaultSizes;
};

// Lazy loading image component with blur-up effect
export const OptimizedImage = React.memo(({
    src,
    alt,
    width,
    height,
    className,
    style,
    sizes,
    loading = 'lazy',
    ...props
}) => {
    const srcSet = generateSrcSet(src);
    const imageSizes = getSizes(sizes);

    return (
        <img
            src={src}
            srcSet={srcSet}
            sizes={imageSizes}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={{
                ...style,
                backgroundColor: '#f0f0f0', // Placeholder color
                objectFit: 'cover',
            }}
            loading={loading}
            {...props}
        />
    );
});

// Background image component with lazy loading
export const OptimizedBackgroundImage = React.memo(({
    src,
    children,
    className,
    style,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const imageRef = React.useRef(null);

    React.useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.src = src;
        img.onload = () => setIsLoaded(true);
    }, [src]);

    return (
        <div
            ref={imageRef}
            className={className}
            style={{
                ...style,
                backgroundColor: '#f0f0f0', // Placeholder color
                backgroundImage: isLoaded ? `url(${src})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.3s ease-in-out',
            }}
            {...props}
        >
            {children}
        </div>
    );
});

// Preload critical images
export const preloadImages = (images = []) => {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Convert image to WebP format if supported
export const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    // If using Cloudinary or similar service
    if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // For regular images, check WebP support and append format
    if (typeof window !== 'undefined') {
        const webpSupported = document.createElement('canvas')
            .toDataURL('image/webp')
            .indexOf('data:image/webp') === 0;

        if (webpSupported && !imageUrl.endsWith('.webp')) {
            // Assuming your server can handle WebP conversion
            return `${imageUrl}?format=webp`;
        }
    }

    return imageUrl;
}; 