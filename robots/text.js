const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia').apiKey;
const sentenceBoundaryDetection = require('sbd');

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentence(content);

  async function fetchContentFromWikipedia() {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
      'web/WikipediaParser/0.1.2'
    );
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponde.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesandMarkdown = removeBlackLinesandMarkdown(
      content.sourceContentOriginal
    );
    const whithoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesandMarkdown
    );

    content.sourceContentSinitized = whithoutDatesInParentheses;

    function removeBlackLinesandMarkdown(text) {
      const allLines = text.split('\n');

      const withoutBlankLinesandMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false;
        }
        return true;
      });
      return withoutBlankLinesandMarkdown.join(' ');
    }
  }
  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
  }

  function breakContentIntoSentence(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(
      content.sourceContentSinitized
    );
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: [],
      });
    });
  }
}

module.exports = robot;
