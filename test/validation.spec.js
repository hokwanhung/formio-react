import EventEmitter from 'eventemitter2';
import React from 'react';
import sinon from 'sinon';
import {expect} from 'chai';
import Form from '../src/components/Form';
import {
  textField,
  visible,
  layout,
  columns
} from './fixtures'; // relies on fixtures folder

import {
  createIfExceed,
  createMount,
  seq
} from './utils'; // relies on utils folder

// begin a test suite with the name 'Form component'
describe('Form component', function() {
  let mount;
  let options;

  beforeEach(() => {
    // run before each test case.
    // initialise both mount and options.
    options = {
      events: new EventEmitter({
        wildcard: false,
        maxListeners: 0
      })
    };
    mount = createMount();
  });

  afterEach(() => {
    // run after each test case.
    options.events.removeAllListeners();
    mount.cleanUp();
  });

  it('should create valid form.', function() {
    const element = mount(
      <Form
        form={{display: 'form', components: [textField]}}
        options={options}
      />);
    return element
      .instance()
      .createPromise
      .then(formio => {
        expect(formio).to.be.an('object');
        expect(formio.isValid()).to.be.true;
      });
  });

  it('should validate on submit.', function() {
    const field = Object.assign({}, textField);
    field.validate = Object.assign({}, textField.validate, {required: true});
    const element = mount(
      <Form
        form={{display: 'form', components: [field]}}
        options={options}
      />);
    return element
      .instance()
      .createPromise
      .then(formio => {
        expect(formio).to.be.an('object');
        return formio.submit()
          .catch(([err]) => {
            return expect(err.message).to.equal('My Textfield is required');
          });
      });
  });

  it('should validate on change.', function() {
    let input;
    let element;
    let root;
    let formio;
    const {ifexceed, notify} = createIfExceed();
    const onchange = sinon.spy(notify);
    const field = Object.assign({}, textField);
    field.validate = Object.assign({}, textField.validate, {required: true});
    return seq([
      () => {
        element = mount(
          <Form
            form={{display: 'form', components: [field]}}
            options={options}
            onChange={onchange}
          />);
        return element
          .instance()
          .createPromise
          .then(_formio => {
            formio = _formio;
            expect(formio).to.be.an('object');
            expect(formio.isValid()).to.be.true;
          });
      },
      () => ifexceed('fail on init change.', () => {
        expect(onchange.callCount).to.equal(1);
      }),
      () => {
        root = element.getDOMNode();
        input = root.querySelector('input[type="text"]');
        input.value = 'x';
        input.dispatchEvent(new Event('input'));
        return ifexceed('fail on input change.', () => {
          expect(onchange.callCount).to.equal(2);
          expect(formio.isValid()).to.be.true;
        });
      },
      () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        return ifexceed('fail on input change.', () => {
          expect(onchange.callCount).to.equal(3);
          expect(formio.isValid()).to.be.false;
        });
      },
      () => {
        input.value = 'y';
        input.dispatchEvent(new Event('input'));
        return ifexceed('fail on input change.', () => {
          expect(onchange.callCount).to.equal(4);
          expect(formio.isValid()).to.be.true;
        });
      }
    ]);
  });
});
