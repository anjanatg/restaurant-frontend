const specials = document.getElementById('specials');
const bg = document.getElementById('specialsBg');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (specials && bg && !reduceMotion) {

  // One colour for each card, in order (6 cards = 6 colours)
  const colors = ['#7dccbc', '#8a9e50', '#263154', '#de8438', '#263154', '#cf1628'];
  const delay = 2200;       // time before the next card (milliseconds)

  let index = 0;
  let timer = null;

  specials.style.background = colors[0];

  function next() {
    index = (index + 1) % colors.length;      // after the last one, go back to the first
    const color = colors[index];

    specials.style.setProperty('--i', index); // the CSS slides the cards and turns the photos
    bg.style.background = color;

    // Grow the new colour from the middle as a circle
    const grow = bg.animate(
      [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(80% at 50% 50%)' }],
      { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
    );

    // When the circle covers everything, make it the real background
    grow.onfinish = function () {
      specials.style.background = color;
    };
  }

  // Run only while the section is on the screen
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      if (timer === null) timer = setInterval(next, delay);
    } else {
      clearInterval(timer);
      timer = null;
    }
  }).observe(specials);
}