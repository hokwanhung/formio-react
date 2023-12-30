// SUMMARY: Seem generally about the initialisation of FormIO?
// SUMMARY: Haven't understand how this is turned into each components.
import { cloneDeep } from 'lodash/lang';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'eventemitter2';
import _isEqual from 'lodash/isEqual';
import { Formio } from '@formio/js';
const FormioForm = Formio.Form;

/**
 * As all parameters are provided as props, 
 * there is no need to insert parameters for every single function.
 * @param {FormProps} props
 * @returns {JSX.Element}
 */
const Form = (props) => {
  let instance;
  let createPromise;
  let element;
  const [formio, setFormio] = useState(undefined);
  const jsonForm = useRef(undefined);

  // execute a clean-up function, that if formio exists,
  // it destroy the formio component.
  useEffect(() => () => formio ? formio.destroy(true) : null, [formio]);

  const createWebformInstance = (srcOrForm) => {
    const { options = {}, formioform, formReady } = props;
    // create a new Form.io form instance (or use a custom formioform if provided).
    // the second () provide the necessary parameters for initialising the form.
    instance = new (formioform || FormioForm)(element, srcOrForm, options);
    // set up a promise that resolves when the form is ready.
    createPromise = instance.ready.then(formioInstance => {
      // set the formioInstance in the component state using setFormio.
      setFormio(formioInstance);
      if (formReady) {
        // if a formReady callback function is provided,
        // call it with the formioInstance.
        formReady(formioInstance);
      }

      // return the formioInstance for further use if needed.
      return formioInstance;
    });

    // return the promise representing the readiness of the form instance.
    return createPromise;
  };

  const onAnyEvent = (event, ...args) => {
    if (event.startsWith('formio.')) {
      // keeps the 'formio.' part with Upper Case,
      // and the remaining parts represent a camel-cased event name.
      const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
      // eslint-disable-next-line no-prototype-builtins
      if (props.hasOwnProperty(funcName) && typeof (props[funcName]) === 'function') {
        // invoke the function with the generated function name,
        // passing additional arguments (`args`).
        props[funcName](...args);
      }
    }
  };

  const initializeFormio = () => {
    const { submission } = props;
    if (createPromise) {
      // attach the onAnyEvent handler to the form instance.
      instance.onAny(onAnyEvent);
      // wait for createPromise to resolve.
      createPromise.then(() => {
        if (formio && submission) {
          // if formio and submission exist, set the formio submission.
          formio.submission = submission;
        }
      });
    }
  };

  useEffect(() => {
    const { src } = props;
    if (src) {
      // if src is provided, create or update Form.io instance based on the src.
      createWebformInstance(src).then((formioInstance) => {
        if (formioInstance) {
          formioInstance.src = src;
        }
      });
      initializeFormio();
    }
  }, [props.src]);

  useEffect(() => {
    const { form, url } = props;

    if (form && !_isEqual(form, jsonForm.current)) {
      // if form prop is provided and has changed (as a whole),
      // clone and store a deep copy of the form prop.
      jsonForm.current = cloneDeep(form);
      createWebformInstance(jsonForm.current).then((formioInstance) => {
        if (formioInstance) {
          // if formioInstance exists, update its form and url properties.
          formioInstance.form = jsonForm.current;
          if (url) {
            formioInstance.url = url;
          }
        }
      });
      // initialise Form.io related configurations.
      initializeFormio();
    }
  }, [props.form]);

  useEffect(() => {
    const { options = {} } = props;
    if (!options.events) {
      // if options.events are not provided, 
      // initialise options.events with the default emitter.
      options.events = Form.getDefaultEmitter();
    }
  }, [props.options]);

  useEffect(() => {
    const { submission } = props;
    if (formio && submission && !_isEqual(formio.submission.data, submission.data)) {
      formio.submission = submission;
    }
  }, [props.submission, formio]);

  return <div ref={el => element = el} />;
};

/**
 * @typedef {object} Options
 * @property {boolean} [readOnly]
 * @property {boolean} [useSessionToken]
 * @property {boolean} [flatten]
 * @property {boolean} [sanitize]
 * @property {string} [renderMode]
 * @property {boolean} [noAlerts]
 * @property {object} [i18n]
 * @property {string} [template]
 * @property {boolean} [saveDraft]
 */

/**
 * @typedef {object} FormProps
 * @property {string} [src]
 * @property {string} [url]
 * @property {object} [form]
 * @property {object} [submission]
 * @property {Options} [options]
 * @property {function} [onPrevPage]
 * @property {function} [onNextPage]
 * @property {function} [onCancel]
 * @property {function} [onChange]
 * @property {function} [onCustomEvent]
 * @property {function} [onComponentChange]
 * @property {function} [onSubmit]
 * @property {function} [onSubmitDone]
 * @property {function} [onFormLoad]
 * @property {function} [onError]
 * @property {function} [onRender]
 * @property {function} [onAttach]
 * @property {function} [onBuild]
 * @property {function} [onFocus]
 * @property {function} [onBlur]
 * @property {function} [onInitialized]
 * @property {function} [formReady]
 * @property {any} [formioform]
 */
Form.propTypes = {
  src: PropTypes.string,
  url: PropTypes.string,
  form: PropTypes.object,
  submission: PropTypes.object,
  options: PropTypes.shape({
    readOnly: PropTypes.bool,
    useSessionToken: PropTypes.bool,
    flatten: PropTypes.bool,
    renderMode: PropTypes.string,
    sanitize: PropTypes.string,
    noAlerts: PropTypes.bool,
    i18n: PropTypes.object,
    template: PropTypes.string,
    saveDraft: PropTypes.bool,
    language: PropTypes.string
  }),
  onPrevPage: PropTypes.func,
  onNextPage: PropTypes.func,
  onCancel: PropTypes.func,
  onChange: PropTypes.func,
  onCustomEvent: PropTypes.func,
  onComponentChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitDone: PropTypes.func,
  onFormLoad: PropTypes.func,
  onError: PropTypes.func,
  onRender: PropTypes.func,
  onAttach: PropTypes.func,
  onBuild: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onInitialized: PropTypes.func,
  formReady: PropTypes.func,
  formioform: PropTypes.any
};

Form.getDefaultEmitter = () => {
  return new EventEmitter({
    wildcard: false,
    maxListeners: 0
  });
};

export default Form;
