const rng = require('lodash/random');

ko.extenders.restricted = target => {
  const result = ko
    .pureComputed({
      read: target,
      write: nv => {
        if (nv === '' || /[^A-Z_?\d]/g.test(nv.toUpperCase())) {
          const cv = target();
          target(cv);
          target.notifySubscribers();
        } else {
          target(nv.toUpperCase());
        }
      }
    })
    .extend({
      notify: 'always'
    });
  result(target());
  return result;
};

const cipherCurioViewModel = function() {
  const self = this;
  const cipher =
    'HER>pl^VPk|1LTG2dNp+B(#O%DWY.<*Kf)By:cM+UZGW()L#zHJSpp7^l8*V3pO++RK2_9M+ztjd|5FP+&4k/p8R^FlO-*dCkF>2D(#5+Kq%;2UcXGV.zL|(G2Jfj#O+_NYz+@L9d<M+b+ZR2FBcyA64K-zlUV+^J+Op7<FBy-U+R/5tE|DYBpbTMKO2<clRJ|*5T4M.+&BFz69Sy#+N|5FBc(;8RlGFN^f524b.cV4t++yBX1*:49CE>VUZ5-+|c.3zBK(Op^.fMqG2RcT+L16C<+FlWB|)L++)WCzWcPOSHT/()p|FkdW<7tB_YOB*-Cc>MDHNpkSzZO8A|K;+';
  const alphabet =
    'ABCDEFGH|JKLMNOPRSTUVWXYZ123456789plkdfycjqbtz()>^+.<-/#_@*%&;:';
  const plainChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

  const observableCharacter = function() {
    const self = this;

    self.val = ko.observable('').extend({
      restricted: null
    });
  };

  const mapToObservableCharacters = str =>
    str.split('').map(c => {
      const r = new observableCharacter();
      r.val(c);
      return r;
    });

  const decode = ltr => {
    const plainLtr = self
      .key()
      .map(v => v.val())
      .join('')
      .charAt(alphabet.indexOf(ltr));
    if (plainLtr == '?') return ltr;
    if (plainLtr == '_') return ' ';
    return plainLtr;
  };

  self.all = (d, e) => e.target.select();
  self.alphabet = alphabet.split('');
  self.error = ko.observable('');
  const handleError = msg => {
    self.error(msg);
    return '';
  };
  self.key = ko.observableArray(mapToObservableCharacters('?'.repeat(63)));
  self.displayKey = ko.computed(() =>
    self
      .key()
      .map(v => v.val())
      .join('')
  );
  self.plaintext = ko.computed(() => {
    self.error('');
    if (self.key().length != 63)
      return handleError('Key must be exactly 63 characters long.');
    if (
      self
        .key()
        .map(v => v.val())
        .join('')
        .match(/[^A-Z_?\d]/g) != null
    )
      return handleError(
        'Key can only contain capital letters, digits, underscores (_) and question marks (?).'
      );
    return cipher
      .split('')
      .map(ltr => decode(ltr))
      .join('');
  });
  self.plaintextRows = ko.computed(() =>
    self
      .plaintext()
      .match(/.{1,17}/g)
      .map(l => l.split('').join(' '))
  );
  self.setRandomKey = () => {
    let result = '';
    self
      .key()
      .forEach(() => (result += plainChars.charAt(rng(plainChars.length - 1))));
    self.key(mapToObservableCharacters(result));
  };
  self.resetKey = () => self.key(mapToObservableCharacters('?'.repeat(63)));
};

function bindSecureModel() {
  const options = {
    attribute: 'data-bind',
    globals: window,
    bindings: ko.bindingHandlers,
    noVirtualElements: false
  };
  ko.bindingProvider.instance = new ko.secureBindingsProvider(options);
  ko.applyBindings(new cipherCurioViewModel());
}

document.addEventListener('DOMContentLoaded', bindSecureModel);
