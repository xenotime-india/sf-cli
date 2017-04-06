module.exports = (HTMLHint) => {
    HTMLHint.addRule({
    id: 'html-disabled',
    description: 'Do not use the <HTML> tag.',
    init: function(parser, reporter){
      var self = this;
      var formCount = 0;
      parser.addListener('tagstart', function(event){
        var tagName = event.tagName.toLowerCase();
        var col = event.col + tagName.length + 1;
        if(tagName === '<html>') {
          reporter.warn('Do not use the <HTML> tag. This is redundant with the <apex:page> tag.', event.line, col, self, event.raw);
        }
      });
    }
  });
}