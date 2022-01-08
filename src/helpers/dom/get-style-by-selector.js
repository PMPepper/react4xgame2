export default function getStyleBySelector (selector)
 {
   const sheetList = document.styleSheets;
   let ruleList;
   let i, j;

   /* look through stylesheets in reverse order that
      they appear in the document */
   for (i=sheetList.length-1; i >= 0; i--) {
     ruleList = sheetList[i].cssRules;

     for (j=0; j<ruleList.length; j++) {
       if (ruleList[j].type == CSSRule.STYLE_RULE &&
           ruleList[j].selectorText == selector) {
           return ruleList[j].style;
       }
     }
   }

   return null;
 }
