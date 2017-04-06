module.exports = (HTMLHint) => {
    HTMLHint.addRule({
    id: 'form-count',
    description: 'Minimize number of forms on a page.',
    init: function(parser, reporter){
      var self = this;
      var formCount = 0;
      parser.addListener('tagstart', function(event){
        var tagName = event.tagName.toLowerCase();
        var col = event.col + tagName.length + 1;
        if(tagName === 'apex:form') {
          formCount++;
          if(formCount > 1){
            reporter.warn('Multiple <apex:form> tag found.', event.line, col, self, event.raw);
          }
        }
      });
    }
  });
}