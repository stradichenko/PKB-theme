// Gallery slider widget — extracted from layouts/partials/gallery-slider.html.
// Initializes every `.gallery-slider` on the page, including its lightbox.
(function () {
  'use strict';

  class GallerySlider {
    constructor(element) {
      this.element = element;
      this.track = element.querySelector('.gallery-slider__track');
      this.slides = element.querySelectorAll('.gallery-slider__slide');
      this.indicators = element.querySelectorAll('.gallery-slider__indicator');
      this.thumbnails = element.querySelectorAll('.gallery-slider__thumbnail');
      this.prevBtn = element.querySelector('.gallery-slider__nav--prev');
      this.nextBtn = element.querySelector('.gallery-slider__nav--next');

      // Lightbox elements
      this.lightbox = element.querySelector('.gallery-lightbox');
      this.lightboxImage = this.lightbox.querySelector('.gallery-lightbox__image');
      this.lightboxCaption = this.lightbox.querySelector('.gallery-lightbox__caption');
      this.lightboxClose = this.lightbox.querySelector('.gallery-lightbox__close');
      this.lightboxPrev = this.lightbox.querySelector('.gallery-lightbox__nav--prev');
      this.lightboxNext = this.lightbox.querySelector('.gallery-lightbox__nav--next');
      this.lightboxCurrent = this.lightbox.querySelector('.gallery-lightbox__current');
      this.lightboxBackdrop = this.lightbox.querySelector('.gallery-lightbox__backdrop');

      this.currentSlide = 0;
      this.totalSlides = this.slides.length;
      this.autoplay = element.dataset.autoplay === 'true';
      this.interval = parseInt(element.dataset.interval, 10) || 5000;
      this.autoplayTimer = null;
      this.isLightboxOpen = false;
      this.containerHeight = null;

      this.imageData = Array.from(this.slides).map(slide => {
        const img = slide.querySelector('.gallery-slider__image');
        const caption = slide.querySelector('.gallery-slider__caption');
        return {
          src: img.src,
          alt: img.alt,
          caption: caption ? caption.innerHTML : ''
        };
      });

      this.init();
    }

    init() {
      if (this.totalSlides <= 1) return;

      this.bindEvents();
      this.updateSlide(0);
      this.calculateFixedHeight();

      if (this.autoplay) this.startAutoplay();
    }

    calculateFixedHeight() {
      const container = this.element.querySelector('.gallery-slider__container');
      const containerWidth = container.offsetWidth;
      const minHeight = window.innerWidth <= 640 ? 200 : 250;
      const maxHeight = window.innerHeight * 0.7;

      let smallestHeight = maxHeight;
      let imagesLoaded = 0;

      this.slides.forEach(slide => {
        const img = slide.querySelector('.gallery-slider__image');

        const calculateHeight = () => {
          if (img.naturalWidth && img.naturalHeight) {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const displayHeight = containerWidth * aspectRatio;
            const constrainedHeight = Math.max(minHeight, Math.min(displayHeight, maxHeight));
            smallestHeight = Math.min(smallestHeight, constrainedHeight);
          }
          imagesLoaded++;
          if (imagesLoaded === this.totalSlides) {
            this.containerHeight = smallestHeight;
            this.setFixedContainerHeight();
          }
        };

        if (img.complete && img.naturalWidth) {
          calculateHeight();
        } else {
          img.addEventListener('load', calculateHeight, { once: true });
          img.addEventListener('error', () => {
            imagesLoaded++;
            if (imagesLoaded === this.totalSlides) {
              this.containerHeight = smallestHeight;
              this.setFixedContainerHeight();
            }
          }, { once: true });
        }
      });
    }

    setFixedContainerHeight() {
      if (this.containerHeight) {
        this.track.style.height = `${this.containerHeight}px`;
      }
    }

    bindEvents() {
      this.prevBtn?.addEventListener('click', () => this.prevSlide());
      this.nextBtn?.addEventListener('click', () => this.nextSlide());

      this.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => this.goToSlide(index));
      });

      // Open lightbox when clicking on the active slide image.
      this.slides.forEach(slide => {
        const img = slide.querySelector('.gallery-slider__image');
        img.addEventListener('click', () => this.openLightbox(this.currentSlide));
        img.style.cursor = 'pointer';
      });

      this.thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', e => {
          if (e.ctrlKey || e.metaKey || e.button === 2) {
            e.preventDefault();
            this.goToSlide(index);
            setTimeout(() => this.openLightbox(index), 50);
          } else {
            this.goToSlide(index);
          }
        });
        thumbnail.addEventListener('dblclick', e => {
          e.preventDefault();
          this.goToSlide(index);
          setTimeout(() => this.openLightbox(index), 50);
        });
      });

      // Lightbox close handlers.
      this.lightboxClose?.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.closeLightbox();
      });
      this.lightboxBackdrop?.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.closeLightbox();
      });

      const lightboxContainer = this.lightbox.querySelector('.gallery-lightbox__container');
      lightboxContainer?.addEventListener('click', e => {
        if (e.target === lightboxContainer) {
          e.preventDefault();
          e.stopPropagation();
          this.closeLightbox();
        }
      });

      const lightboxContent = this.lightbox.querySelector('.gallery-lightbox__content');
      lightboxContent?.addEventListener('click', e => e.stopPropagation());
      this.lightboxImage?.addEventListener('click', e => e.stopPropagation());
      this.lightboxCaption?.addEventListener('click', e => e.stopPropagation());

      this.lightboxPrev?.addEventListener('click', () => this.lightboxPrevImage());
      this.lightboxNext?.addEventListener('click', () => this.lightboxNextImage());

      this.keyboardHandler = e => {
        if (this.isLightboxOpen) {
          switch (e.key) {
            case 'Escape':
              e.preventDefault();
              e.stopPropagation();
              this.closeLightbox();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              this.lightboxPrevImage();
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.lightboxNextImage();
              break;
          }
        } else if (this.element.contains(document.activeElement)) {
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              this.prevSlide();
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.nextSlide();
              break;
            case 'Enter':
            case ' ':
              if (e.target.classList.contains('gallery-slider__image')) {
                e.preventDefault();
                this.openLightbox(this.currentSlide);
              }
              break;
          }
        }
      };
      document.addEventListener('keydown', this.keyboardHandler);

      this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.element.addEventListener('mouseleave', () => this.resumeAutoplay());

      this.lastContainerWidth = this.element.querySelector('.gallery-slider__container').offsetWidth;
      this.resizeHandler = () => {
        if (this.isLightboxOpen) {
          this.constrainImageToViewport();
        } else {
          const container = this.element.querySelector('.gallery-slider__container');
          const currentWidth = container.offsetWidth;
          if (Math.abs(currentWidth - this.lastContainerWidth) > 50) {
            this.lastContainerWidth = currentWidth;
            this.calculateFixedHeight();
          }
        }
      };
      window.addEventListener('resize', this.resizeHandler);
    }

    openLightbox(index) {
      this.isLightboxOpen = true;
      const targetIndex = index !== undefined ? index : this.currentSlide;
      this.updateLightboxImage(targetIndex);
      this.lightbox.setAttribute('aria-hidden', 'false');
      this.lightbox.classList.add('gallery-lightbox--active');
      document.body.style.overflow = 'hidden';
      this.pauseAutoplay();
      setTimeout(() => this.lightboxClose?.focus(), 100);
    }

    closeLightbox() {
      this.isLightboxOpen = false;
      this.lightbox.setAttribute('aria-hidden', 'true');
      this.lightbox.classList.remove('gallery-lightbox--active');
      document.body.style.overflow = '';
      this.resumeAutoplay();
    }

    updateLightboxImage(index) {
      const safeIndex = Math.max(0, Math.min(index, this.totalSlides - 1));
      const imageData = this.imageData[safeIndex];

      this.lightboxImage.src = imageData.src;
      this.lightboxImage.alt = imageData.alt;
      this.lightboxCaption.innerHTML = imageData.caption;
      this.lightboxCurrent.textContent = String(safeIndex + 1);

      this.currentSlide = safeIndex;

      this.lightboxImage.onload = () => this.constrainImageToViewport();

      const navDisplay = this.totalSlides > 1 ? 'flex' : 'none';
      this.lightboxPrev.style.display = navDisplay;
      this.lightboxNext.style.display = navDisplay;
    }

    constrainImageToViewport() {
      const img = this.lightboxImage;
      const padding = window.innerWidth <= 768 ? 120 : 160;
      img.style.maxWidth = `${window.innerWidth - padding}px`;
      img.style.maxHeight = `${window.innerHeight - padding}px`;
    }

    lightboxPrevImage() {
      const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
      this.updateLightboxImage(prevIndex);
      this.updateSlide(prevIndex);
    }

    lightboxNextImage() {
      const nextIndex = (this.currentSlide + 1) % this.totalSlides;
      this.updateLightboxImage(nextIndex);
      this.updateSlide(nextIndex);
    }

    updateSlide(index) {
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('gallery-slider__slide--active', i === index);
      });
      this.indicators.forEach((indicator, i) => {
        indicator.classList.toggle('gallery-slider__indicator--active', i === index);
        indicator.setAttribute('aria-selected', String(i === index));
      });
      this.thumbnails.forEach((thumbnail, i) => {
        thumbnail.classList.toggle('gallery-slider__thumbnail--active', i === index);
      });
      this.currentSlide = index;
      this.scrollToActiveThumbnail(index);
    }

    scrollToActiveThumbnail(index) {
      if (this.thumbnails.length === 0) return;
      const thumbnailsContainer = this.element.querySelector('.gallery-slider__thumbnails');
      if (!thumbnailsContainer) return;
      const activeThumbnail = this.thumbnails[index];
      if (!activeThumbnail) return;

      const containerRect = thumbnailsContainer.getBoundingClientRect();
      const thumbnailRect = activeThumbnail.getBoundingClientRect();
      const containerCenter = containerRect.width / 2;
      const thumbnailCenter = thumbnailRect.left - containerRect.left + (thumbnailRect.width / 2);
      const scrollOffset = thumbnailCenter - containerCenter;

      thumbnailsContainer.scrollTo({
        left: thumbnailsContainer.scrollLeft + scrollOffset,
        behavior: 'smooth'
      });
    }

    nextSlide() { this.goToSlide((this.currentSlide + 1) % this.totalSlides); }
    prevSlide() { this.goToSlide((this.currentSlide - 1 + this.totalSlides) % this.totalSlides); }

    goToSlide(index) {
      if (index >= 0 && index < this.totalSlides) {
        this.updateSlide(index);
        this.resetAutoplay();
      }
    }

    startAutoplay() {
      if (!this.autoplay) return;
      this.autoplayTimer = setInterval(() => this.nextSlide(), this.interval);
    }

    pauseAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    resumeAutoplay() {
      if (this.autoplay && !this.autoplayTimer) this.startAutoplay();
    }

    resetAutoplay() {
      this.pauseAutoplay();
      this.resumeAutoplay();
    }
  }

  function init() {
    document.querySelectorAll('.gallery-slider').forEach(slider => new GallerySlider(slider));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
