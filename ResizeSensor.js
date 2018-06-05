/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */


/**
 * Class for dimension change detection.
 *
 * @param {Element|Element[]|Elements|jQuery} element
 * @param {Function} callback
 *
 * @constructor
 */
const ResizeSensor = function ResizeSensor(element, callback) {
  /**
   *
   * @constructor
   */
  function EventQueue() {
    this.q = [];
    this.add = (ev) => {
      this.q.push(ev);
    };

    let i;
    let j;
    this.call = () => {
      for (i = 0, j = this.q.length; i < j; i += 1) {
        this.q[i].call();
      }
    };
  }

  /**
   * @param {HTMLElement} element
   * @param {String}      prop
   * @returns {String|Number}
   */
  function getComputedStyle(elementCS, prop) {
    if (elementCS.currentStyle) {
      return elementCS.currentStyle[prop];
    } else if (window.getComputedStyle) {
      return window.getComputedStyle(elementCS, null).getPropertyValue(prop);
    }
    return elementCS.style[prop];
  }

  /**
   *
   * @param {HTMLElement} element
   * @param {Function}    resized
   */
  function attachResizeEvent(elementRE, resized) {
    const elementResize = elementRE;
    if (!elementResize.resizedAttached) {
      elementResize.resizedAttached = new EventQueue();
      elementResize.resizedAttached.add(resized);
    } else if (elementResize.resizedAttached) {
      elementResize.resizedAttached.add(resized);
      return;
    }

    elementResize.resizeSensor = document.createElement('div');
    elementResize.resizeSensor.className = 'resize-sensor';
    const style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: scroll; z-index: -1; visibility: hidden;';
    const styleChild = 'position: absolute; left: 0; top: 0;';

    elementResize.resizeSensor.style.cssText = style;
    elementResize.resizeSensor.innerHTML =
      `<div class="resize-sensor-expand" style="${style}">` +
      `<div style="${styleChild}"></div>` +
      '</div>' +
      `<div class="resize-sensor-shrink" style="${style}">` +
      `<div style="${styleChild} width: 200%; height: 200%"></div>` +
      '</div>';
    elementResize.appendChild(elementResize.resizeSensor);

    if (!{
      fixed: 1,
      absolute: 1,
    }[getComputedStyle(elementResize, 'position')]) {
      elementResize.style.position = 'relative';
    }

    const expand = elementResize.resizeSensor.childNodes[0];
    const expandChild = expand.childNodes[0];
    const shrink = elementResize.resizeSensor.childNodes[1];

    let lastWidth;
    let lastHeight;

    const reset = () => {
      expandChild.style.width = `${expand.offsetWidth + 10}px`;
      expandChild.style.height = `${expand.offsetHeight + 10}px`;
      expand.scrollLeft = expand.scrollWidth;
      expand.scrollTop = expand.scrollHeight;
      shrink.scrollLeft = shrink.scrollWidth;
      shrink.scrollTop = shrink.scrollHeight;
      lastWidth = elementResize.offsetWidth;
      lastHeight = elementResize.offsetHeight;
    };

    reset();

    const changed = () => {
      if (elementResize.resizedAttached) {
        elementResize.resizedAttached.call();
      }
    };

    const addEvent = (el, name, cb) => {
      if (el.attachEvent) {
        el.attachEvent(`on${name}`, cb);
      } else {
        el.addEventListener(name, cb);
      }
    };

    addEvent(expand, 'scroll', () => {
      if (elementResize.offsetWidth > lastWidth || elementResize.offsetHeight > lastHeight) {
        changed();
      }
      reset();
    });

    addEvent(shrink, 'scroll', () => {
      if (elementResize.offsetWidth < lastWidth || elementResize.offsetHeight < lastHeight) {
        changed();
      }
      reset();
    });
  }

  if (Object.prototype.toString.call(element) === '[object Array]' ||
    (typeof jQuery !== 'undefined' && element instanceof jQuery) // jquery
    ||
    (typeof Elements !== 'undefined' && element instanceof Elements) // mootools
  ) {
    let i = 0;
    const j = element.length;
    for (; i < j; i += 1) {
      attachResizeEvent(element[i], callback);
    }
  } else {
    attachResizeEvent(element, callback);
  }

  this.detach = () => {
    ResizeSensor.detach(element);
  };
};

ResizeSensor.detach = (elem) => {
  const element = elem;
  if (element.resizeSensor) {
    element.removeChild(element.resizeSensor);
    delete element.resizeSensor;
    delete element.resizedAttached;
  }
};

export default ResizeSensor;
