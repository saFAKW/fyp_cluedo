let slideIndex = 1;
let slideInterval = null;

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (slides.length === 0) return;
  if (n > slides.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = slides.length; }

  // move the track to show the active slide
  const track = document.querySelector('.slideshow-track');
  if (track) {
    const offset = (slideIndex - 1) * 100;
    track.style.transform = `translateX(-${offset}%)`;
  }

  // update dots active state
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

// Initialize after DOM is ready and start automatic carousel
document.addEventListener('DOMContentLoaded', function () {
  showSlides(slideIndex);
  // auto-advance every 4 seconds
  slideInterval = setInterval(function() { plusSlides(1); }, 4000);

  // Optional: pause on mouseenter and resume on mouseleave for slideshow container
  const container = document.querySelector('.slideshow-container');
  if (container) {
    container.addEventListener('mouseenter', () => { if (slideInterval) clearInterval(slideInterval); });
    container.addEventListener('mouseleave', () => { slideInterval = setInterval(function() { plusSlides(1); }, 4000); });
  }
});