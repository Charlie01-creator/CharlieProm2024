// WebP support detection
const checkWebPSupport = () => {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = function() {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
};

// Optimize image loading based on WebP support
const optimizeImageLoading = async () => {
    const supportsWebP = await checkWebPSupport();
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        const originalSrc = img.dataset.src;
        
        // Use WebP if supported, otherwise keep original
        const optimizedSrc = supportsWebP ? 
            `webp-converter.php?img=${encodeURIComponent(originalSrc)}` : 
            originalSrc;
        
        img.dataset.src = optimizedSrc;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    
                    img.onload = function() {
                        img.style.opacity = 1;
                    };
                    
                    img.onerror = function() {
                        // Fallback to original if conversion fails
                        img.src = originalSrc;
                        img.style.opacity = 1;
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });

        observer.observe(img);
    });
};

// Protection functions
const setupProtection = () => {
    // Prevent right-click saving
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Prevent dragging images
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
    
    // Prevent touch hold on mobile
    document.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    }, { passive: false });
};

// Column balancing
const balanceColumns = () => {
    const screenWidth = window.innerWidth;
    const columns = document.querySelectorAll('.gallery-column');
    
    if (screenWidth > 768) {
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        columns.forEach(col => col.innerHTML = '');
        
        items.forEach((item, index) => {
            const columnIndex = index % columns.length;
            columns[columnIndex].appendChild(item);
        });
    }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    setupProtection();
    optimizeImageLoading();
    balanceColumns();
    
    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(balanceColumns, 250);
    });
});
