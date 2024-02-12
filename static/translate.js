(function() {
  'use strict';

  const NS = {
    path: location.pathname,
    html: document.documentElement,
    head: document.head,
    styleId: 0,
  };
  window.NS = NS;

  const Main = {
    setNS() {
      NS.toc = document.getElementById('toc');
    },
    tocAlways() {
      if (/^\/table-of-contents\//.test(NS.path)) return;
      NS.toc.removeAttribute('hidden');
      Sub.addStyle([
        '#toc { overflow: auto; padding: var(--gap); border-bottom: 2px solid var(--color-pink); }',
        '#toc > :first-child { margin-top: 0; }',
        '@media (min-width: 600px) {',
        '  #playground { display: flex; }',
        '  #toc { width: 20vw; border-right: 2px solid var(--color-pink); }',
        '  #left, #right { position: static; width: 40vw; }',
        '}',
      ]);
    },
  };

  const Sub = {
    addStyle(cssText) {
      const style = document.createElement('style');
      style.id = Util.sprintf('customStyle-%s', ++NS.styleId);
      if (Array.isArray(cssText)) cssText = cssText.join('\n');
      style.textContent = cssText;
      NS.head.append(style);
    },
  };

  const Util = {
    execObjectRoutine(obj) {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'function') {
          const retval = obj[key]();
          if (retval != null) return retval;
        }
      }
    },
    empty(arg) {
      let isEmpty = arg == null || arg === false || arg === '';
      if (!isEmpty) {
        if (Array.isArray(arg) && arg.length === 0) isEmpty = true;
        if (Object.getPrototypeOf(arg).constructor.name === 'Object' && Object.keys(arg).length === 0) isEmpty = true;
      }
      return isEmpty;
    },
    delegateEvent(selector, type, listener, options) {
      if (options == null) options = false;
      document.addEventListener(type, evt => {
        for (let elem = evt.target; elem && elem !== document; elem = elem.parentNode) {
          if (elem.matches(selector)) return listener.call(elem, evt);
        }
      }, options);
    },
    addEvent(elems, type, listener, options) {
      if (Util.empty(elems)) return null;
      if (!elems.forEach) elems = [elems];
      if (options == null) options = false;
      elems.forEach((elem, idx) => elem.addEventListener(type, evt => { listener.call(elem, evt, idx); }, options));
    },
    triggerEvent(elems, type, options) {
      if (Util.empty(elems)) return null;
      if (!elems.forEach) elems = [elems];
      const event = new Event(type, options);
      elems.forEach(elem => elem.dispatchEvent(event));
    },
    sprintf(format, ...args) {
      let p = 0;
      return format.replace(/%./g, function(m) {
        if (m === '%%') return '%';
        if (m === '%s') return args[p++];
        return m;
      });
    },
  };
  NS.Util = Util;

  Util.addEvent(document, 'DOMContentLoaded', () => {
    Util.execObjectRoutine(Main);
  });

  Util.addEvent(window, 'unload', () => {});
}());
