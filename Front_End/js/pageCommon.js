const sticky = document.querySelector('.sticky-controls');

// Create a sentinel element at the top of the sticky container
const sentinel = document.createElement('div');
sentinel.style.position = 'absolute';
sentinel.style.top = sticky.offsetTop + 'px';
sentinel.style.height = '1px';
sentinel.style.width = '100%';
sentinel.style.pointerEvents = 'none';
sticky.parentElement.insertBefore(sentinel, sticky);

const observer = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting) {
      sticky.classList.add('stuck');
    } else {
      sticky.classList.remove('stuck');
    }
  },
  { threshold: [1] }
);

observer.observe(sentinel);
