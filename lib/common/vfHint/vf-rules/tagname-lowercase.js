module.exports = (HTMLHint) => {
    HTMLHint.addRule({
    id: 'tagname-lowercase',
    description: 'All html element names must meet the camelCase style.',
    init: function(parser, reporter){
      var self = this;
      parser.addListener('tagstart,tagend', function(event){
        var tagName = event.tagName;
        var splitArr = tagName.split(':');
        for(i = 0 ; i < splitArr.length; i++) {
          if (/^[a-z][a-zA-Z\d]*([A-Z][a-zA-Z\d]*)*$/.test(splitArr[i]) === false) {
            reporter.error('The html element name of [ ' + tagName + ' ] must be in camelCase style.', event.line, event.col, self, event.raw);
            break;
          }
        }
      });
    }
  });
}