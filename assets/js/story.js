(function () {

    const story = document.querySelector('.story-section');
    const pic = story ? story.querySelector('.story-pic') : null;

    if (!story || !pic) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Image: moves from the bottom-right into its place while scrolling ----
    if (!reduceMotion) {

        let target = 1;    // where the image should be (1 = far, 0 = in place)
        let current = 1;   // where the image is right now

        function updateTarget() {
            const screen = window.innerHeight;
            const scrolled = screen - story.getBoundingClientRect().top;

            const wait = screen * 0.1;       // image stays still for this part
            const distance = screen * 0.5;   // then moves during this part (smaller = faster)

            let progress = (scrolled - wait) / distance;     // 0 to 1
            progress = Math.min(Math.max(progress, 0), 1);

            target = 1 - progress;
        }

        // Every frame: glide a little closer to the target (this makes it smooth)
        function animate() {
            current += (target - current) * 0.12;            // 0.12 = smoothness
            if (Math.abs(target - current) < 0.001) current = target;

            pic.style.setProperty('--move', current);
            requestAnimationFrame(animate);
        }

        window.addEventListener('scroll', updateTarget, { passive: true });
        updateTarget();
        current = target;        // no glide when the page first loads
        animate();
    }

    // ---- Text: heading writes in, title and paragraph rise in ----
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);      // only once
            }
        });
    }, { threshold: 0.3 });

    story.querySelectorAll('.reveal-write, .reveal-up').forEach(function (el) {
        observer.observe(el);
    });

})();