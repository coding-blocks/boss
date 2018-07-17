const hbs = require('express-hbs')

hbs.registerHelper('ifeq', function(a, b, options) {
  if (this.get(a) == this.get(b)) {
    return options.fn(this);
  }
  return options.inverse(this);
})
