const robots = {
  input: require('./robots/input.js'),
  text: require('./robots/text.js'),
  state: require('./robots/state'),
  image: require('./robots/image'),
};

async function start() {
  robots.input();
  await robots.text();
  await robots.image();
  const content = robots.state.load();

  console.dir(content, { depth: null });
}

start();
