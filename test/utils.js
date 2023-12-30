import ReactDOM from 'react-dom';
// Enzyme is a JS testing utility to test React component's output.
import {mount as enzymeMount} from './enzyme';

const WAIT = 1000;

export function autoreject(msg, fn) {
  if (typeof msg === 'function') {
    fn = msg;
    msg = `Timeout of ${WAIT}ms exceeded.`;
  } // like a guard function - the reason why TypeScript is used.

  return new Promise((resolve, reject) => {
    // if the operation completes within specific time,
    // the 'fn' function call `resolve`, preventing the Promise from being rejected.
    setTimeout(
      // otherwise, this timeout function will execute.
      () => reject(new Error(msg)),
      WAIT // 1000 milliseconds.
    );
    fn(resolve);
  });
}

// Generate an enhanced mount function.
export function createMount(options1 = {}) {
  // destructure properties passed in options1, if mount not present,
  // use enzymemount instead.
  const {mount = enzymeMount, ...other1} = options1;

  // create a new div element to serve as the mounting point.
  // attach it to the fist child of the `body` element in the DOM.
  const attachTo = window.document.createElement('div');
  attachTo.className = 'app';
  attachTo.setAttribute('id', 'app');
  window.document.body.insertBefore(attachTo, window.document.body.firstChild);

  // define the enhanced mount function.
  const mountWithContext = function mountWithContext(node, options2 = {}) {
    // call the original `mount` function with the provided `node`,
    // and merge the options, including `attachTo` properties.
    return mount(node, {
      attachTo,
      ...other1,
      ...options2,
    });
  };

  mountWithContext.attachTo = attachTo;
  let n = 1;
  // define a cleanUp() method to unmount the React component.
  mountWithContext.cleanUp = () => {
    if (n === 0) { debugger } else {
      n -= 1;
    }
    ReactDOM.unmountComponentAtNode(attachTo);
    attachTo.parentNode.removeChild(attachTo);
  };

  return mountWithContext;
}

export function createIfExceed() {
  let sub = null;
  const ifexceed = (msg, fn) => {
    return autoreject(msg, resolve => {
      sub = () => {
        if (fn.length > 0) {
          fn(resolve);
        }
        else {
          fn();
          resolve();
        }
      };
    });
  };
  const notify = () => {
    if (typeof sub === 'function') {
      sub();
      sub = null;
    }
  };

  return {ifexceed, notify};
}

export function seq(fns) {
  // a sequence of functions that are used,
  // each one is executed according to the order,
  // and the results are passed to the next function as parameters.
  const [init, ...tail] = fns;

  return tail.reduce((promise, fn) => promise.then(fn), init());
}

export default {
  autoreject,
  createMount,
  createIfExceed,
  seq,
};
