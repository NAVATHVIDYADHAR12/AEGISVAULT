'use client';

import { useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function formatCount(value, element) {
  return element.dataset.countFormat === 'comma'
    ? value.toLocaleString('en-US')
    : String(value);
}

function animateCount(element) {
  stopCount(element);

  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return;

  const duration = 1500;
  const start = performance.now();
  element.textContent = formatCount(0, element);

  const tick = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - (1 - progress) ** 4;
    element.textContent = formatCount(Math.round(target * eased), element);
    if (progress < 1) element.dataset.countFrame = String(window.requestAnimationFrame(tick));
    else delete element.dataset.countFrame;
  };

  element.dataset.countFrame = String(window.requestAnimationFrame(tick));
}

function stopCount(element) {
  const frame = Number(element.dataset.countFrame);
  if (frame) window.cancelAnimationFrame(frame);
  delete element.dataset.countFrame;
}

function splitTextForScrollReveal(element, mode) {
  if (element.dataset.scrollSplit) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (/\S/u.test(walker.currentNode.nodeValue ?? '')) textNodes.push(walker.currentNode);
  }

  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
  let revealOrder = 0;

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const parts = (textNode.nodeValue ?? '').split(/(\s+)/u);

    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/u.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const word = document.createElement('span');
      word.className = mode === 'letters' ? 'scroll-letter-word' : 'scroll-reveal-word';
      if (mode === 'letters') {
        const letters = segmenter
          ? [...segmenter.segment(part)].map(({ segment }) => segment)
          : Array.from(part);
        letters.forEach((letter) => {
          const character = document.createElement('span');
          character.className = 'scroll-reveal-char';
          character.style.setProperty('--letter-delay', `${Math.min(revealOrder, 72) * 9}ms`);
          character.textContent = letter;
          word.appendChild(character);
          revealOrder += 1;
        });
      } else {
        word.style.setProperty('--word-delay', `${Math.min(revealOrder, 28) * 18}ms`);
        word.textContent = part;
        revealOrder += 1;
      }
      fragment.appendChild(word);
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  element.dataset.scrollSplit = mode;
}

export default function LandingMotion() {
  useEffect(() => {
    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.scroll-progress');
    const backToTop = document.querySelector('.back-to-top');
    const heroProduct = document.querySelector('.hero-product');
    const story = document.querySelector('[data-scroll-story]');
    const storyCards = story ? [...story.querySelectorAll('[data-story-card]')] : [];
    const storySteps = story ? [...story.querySelectorAll('[data-story-step]')] : [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const magneticTargets = [];
    let countTargets = [];
    let chartLines = [];
    let revealObserver;
    let countObserver;
    let frame = 0;
    let previousY = window.scrollY;

    if (!reducedMotion && 'IntersectionObserver' in window) {
      document.querySelectorAll('section:not(.hero) h2, section:not(.hero) h3, section:not(.hero) .section-index span, .trust-inner > span, .footer-links span')
        .forEach((target) => splitTextForScrollReveal(target, 'letters'));
      document.querySelectorAll('section:not(.hero) p, .footer-note, .footer-links a, .footer-bottom > span')
        .forEach((target) => splitTextForScrollReveal(target, 'words'));

      const revealTargets = document.querySelectorAll(
        '.section-index, .trust-inner > span, .product-heading, .product-stats > div, .integrity-chart, .events-panel, .event-row, .window-foot > span, .statement-grid > *, .category-grid > *, .showcase-copy, .secret-detail, .cap-head > *, .cap-row, .architecture-grid > *, .verify-grid > *, .usecase-grid > div, .how-heading > *, .how-steps > *, .scroll-story-copy, .story-stage, .closing-inner > div:first-child, .closing-inner > .button, .footer-main > *, .footer-bottom > *'
      );
      const siblingCounts = new Map();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' });
      revealObserver = observer;

      revealTargets.forEach((target) => {
        const parent = target.parentElement;
        const order = siblingCounts.get(parent) ?? 0;
        siblingCounts.set(parent, order + 1);
        target.style.setProperty('--reveal-delay', `${Math.min(order, 3) * 90}ms`);
        if (target.matches('.secret-detail, .arch-diagram, .chain-visual, .story-stage')) {
          target.classList.add('visual-reveal');
        }
        target.classList.add('reveal-ready');
        observer.observe(target);
      });

      chartLines = [...document.querySelectorAll('.integrity-chart [data-chart-line]')];
      chartLines.forEach((line) => {
        const length = line.getTotalLength();
        line.style.strokeDasharray = String(length);
        line.style.strokeDashoffset = String(length);
      });

      const countObserverInstance = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) animateCount(entry.target);
          else {
            stopCount(entry.target);
            entry.target.textContent = formatCount(0, entry.target);
          }
        });
      }, { threshold: 0.5 });
      countObserver = countObserverInstance;
      countTargets = [...document.querySelectorAll('[data-count]')];
      countTargets.forEach((target) => countObserverInstance.observe(target));
    }

    if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.button').forEach((target) => {
        const onPointerMove = (event) => {
          const rect = target.getBoundingClientRect();
          const offsetX = (event.clientX - rect.left - rect.width / 2) / rect.width;
          const offsetY = (event.clientY - rect.top - rect.height / 2) / rect.height;
          target.style.setProperty('--magnetic-x', `${(clamp(offsetX * 7, -3.5, 3.5)).toFixed(2)}px`);
          target.style.setProperty('--magnetic-y', `${(clamp(offsetY * 6, -3, 3)).toFixed(2)}px`);
        };
        const onPointerLeave = () => {
          target.style.setProperty('--magnetic-x', '0px');
          target.style.setProperty('--magnetic-y', '0px');
        };

        target.dataset.magnetic = 'true';
        target.addEventListener('pointermove', onPointerMove);
        target.addEventListener('pointerleave', onPointerLeave);
        magneticTargets.push({ target, onPointerMove, onPointerLeave });
      });
    }

    const updateStory = () => {
      if (!story || storyCards.length === 0) return;

      const rect = story.getBoundingClientRect();
      const scrollRange = Math.max(1, story.offsetHeight - window.innerHeight);
      const storyProgress = clamp(-rect.top / scrollRange, 0, 0.9999);
      const activeIndex = Math.min(storyCards.length - 1, Math.floor(storyProgress * storyCards.length));
      story.dataset.active = String(activeIndex);

      storyCards.forEach((card, index) => {
        const offset = index - activeIndex;
        const distance = Math.abs(offset);
        card.style.zIndex = String(storyCards.length - distance);
        card.style.opacity = distance === 0 ? '1' : distance === 1 ? '0.48' : '0.16';
        card.style.transform = reducedMotion
          ? 'none'
          : `translate3d(${offset * 24}px, ${distance * 13}px, ${-distance * 90}px) rotateY(${offset * -8}deg) rotateX(${distance * 2}deg) scale(${1 - distance * 0.055})`;
        card.setAttribute('aria-hidden', distance === 0 ? 'false' : 'true');
      });

      storySteps.forEach((step, index) => {
        const active = index === activeIndex;
        step.classList.toggle('is-active', active);
        if (active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    };

    const updateScrollState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? currentY / scrollable : 0;

        if (header) {
          header.dataset.scrolled = currentY > 20 ? 'true' : 'false';
          if (currentY < 96) header.dataset.hidden = 'false';
          else if (currentY > previousY + 5) header.dataset.hidden = 'true';
          else if (currentY < previousY - 5) header.dataset.hidden = 'false';
        }

        if (progress) progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
        if (backToTop) backToTop.dataset.visible = currentY > 420 ? 'true' : 'false';
        if (!reducedMotion && heroProduct) {
          heroProduct.style.setProperty('--parallax-offset', `${Math.max(-22, -currentY * 0.045)}px`);
        }
        updateStory();
        previousY = currentY;
      });
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      if (frame) window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      countObserver?.disconnect();
      countTargets.forEach(stopCount);
      chartLines.forEach((line) => {
        line.style.removeProperty('stroke-dasharray');
        line.style.removeProperty('stroke-dashoffset');
      });
      magneticTargets.forEach(({ target, onPointerMove, onPointerLeave }) => {
        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerleave', onPointerLeave);
        target.removeAttribute('data-magnetic');
        target.style.removeProperty('--magnetic-x');
        target.style.removeProperty('--magnetic-y');
      });
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <a className="back-to-top" href="#top" aria-label="Back to top" data-visible="false">
        <ArrowUp size={17} aria-hidden="true" />
      </a>
    </>
  );
}
