const google = require('googleapis').google;
const gm = require('gm').subClass({ imageMagick: true });
const customSearch = google.customsearch('v1');
const state = require('./state');
const imageDownloader = require('image-downloader');
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot() {
  const content = state.load();
  await fetchImagesOfAllSentences(content);
  await donwloadAllImages(content);
  await convertAllImages(content)
  await createAllSetencesImages(content)
  await createYoutubeThumbnail()
  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImageLinks(query);

      sentence.googleSearchQuery = query;
    }
  }

  async function fetchGoogleAndReturnImageLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: 'image',
      num: 2,
    });

    const imagesUrl = response.data.items.map((item) => item.link);
    return imagesUrl;
  }

  async function donwloadAllImages(query) {
    content.downloadedImages = [];

    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];
        try {
          if (
            content.downloadedImages.includes(imageUrl) ||
            imageUrl ===
              'https://www.biography.com/.image/t_share/MTU2MTUyNzkwNjI2ODcwODg0/_prince-jackson-attends-the-2016-gq-men-of-the-year-party-at-chateau-marmont-on-december-8-2016-in-los-angeles-california-photo-by-stefanie-keenan_getty-images-for-gq-square.jpg'
          ) {
            throw new Error('Imagem ja foi baixada');
          }
          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);

          console.log(`> Baixou imagem com sucesso ${imageUrl}`);
          break;
        } catch (error) {
          console.log(`Erro ao baixar a imagem (${imageUrl}): ${error}`);
        }
      }
    }
  }
  6;
  async function downloadAndSave(url, fileName) {
    return imageDownloader.image({
      url,
      url,
      dest: `./content/${fileName}`,
    });
  }

  async function convertAllImages(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await convertImage(sentenceIndex);
    }
  }

  async function convertImage(sentenceIndex) {
    return new Promise((resolve, reject) => {
      const inputFile = `./content/${sentenceIndex}-original.png[0]`;
      const outputFile = `./content/${sentenceIndex}-converted.png`;
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputFile)
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-blur', '0x9')
        .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }
          console.log(`> Image converted: ${inputFile}`);
          resolve();
        });
    });
  }

  async function createAllSetencesImages(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await createSentenceImage(
        sentenceIndex,
        content.sentences[sentenceIndex].text
      );
    }
  }

  async function createSentenceImage(sentenceIndex, sentenceText) {
    return new Promise((resolve, reject) => {
      const outputFile = `./content/${sentenceIndex}-sentence.png`;
      const templateSettings = {
        0: {
          size: '1920x1080',
          gravity: 'center',
        },
        1: {
          size: '1920x1080',
          gravity: 'center',
        },
        2: {
          size: '800x1080',
          gravity: 'west',
        },
        3: {
          size: '1920x400',
          gravity: 'center',
        },
        4: {
          size: '1920x1080',
          gravity: 'center',
        },
        5: {
          size: '800x1080',
          gravity: 'west',
        },
        6: {
          size: '1920x400',
          gravity: 'center',
        },
      };
      gm()
        .out('-size', templateSettings[sentenceIndex].size)
        .out('-gravity', templateSettings[sentenceIndex].gravity)
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-kerning', '-1')
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`sentence created: ${outputFile}`);
          resolve();
        });
    });
  }
  async function createYoutubeThumbnail() {
    return new Promise((resolve, reject) => {
      gm()
        .in('./content/0-converted.png')
        .write('./content/youtube-thumbnail.jpg', (error) => {
          if (error) {
            return reject(error);
          }
          console.log('> Creating Youtube thumbnail');
          resolve();
        });
    });
  }
}
module.exports = robot;
