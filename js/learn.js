let bestModel = undefined;
async function collect() {
  let previousDistance = 0;
  let amount = 0;

  // make model
  const model = await newNet();

  // await model.compile({})

  // console.log(await model.getWeights()[0].data())
  // let model2 =  await clone(model);
  // let firstWeight = await model.getWeights()[0].data()
  // let firstWeight2 = await model2.getWeights()[0].data()
  // debugger

  while (true) {
    const visiblePipes = document.querySelectorAll("div.pipe");

    if (visiblePipes.length > 0) {
      // Get bird
      const bird = document.querySelector("div.bird");
      const birdPos = bird.getBoundingClientRect();
      const birdTop = parseInt(bird.style.top.replace("px", ""));
      const birdX = birdPos.right;
      //    console.log("Bird Pos:", birdTop);
      //    console.log(bird);

      let closestPipe = visiblePipes[0];

      // Gets closest pipe

      const pipePos = closestPipe.getBoundingClientRect();
      const pipeX = pipePos.right;

      //   console.log(closestPipe.attributes);
      const pipeTop = parseInt(
        closestPipe.children[0].style.height.replace("px", "")
      );
      const pipeBottom =
        400 - parseInt(closestPipe.children[1].style.height.replace("px", ""));
      const pipeMiddle = Math.abs(pipeTop - pipeBottom) / 2 + pipeTop;

      const distance = pipeX - birdX;
      if (previousDistance === distance) {
        await sleep(5000);
      }
      previousDistance = distance;

      if (distance < 0) {
        await removeElement("pipeBoy");
      }
      amount = amount + 1;
      // if(gameObjs.length === 100){
      //   console.log(gameObjs);
      // }
      // console.log(birdTop)
      if (birdTop < 5) {
        playerDead();
        return;
      }
      const gameObj = { distance, birdTop, pipeTop, pipeBottom, pipeMiddle };
      //   const gameObjV2 = {input: JSON.stringify(gameObj), output:JSON.stringify({"jump":1})}
      gameObj.distance = Math.round(gameObj.distance) / 1000;
      gameObj.birdTop = Math.round(gameObj.birdTop) / 400;
      gameObj.pipeTop = Math.round(gameObj.pipeTop) / 400;
      gameObj.pipeBottom = Math.round(gameObj.pipeBottom) / 400;
      gameObj.pipeMiddle = Math.round(gameObj.pipeMiddle) / 400;
      const gameObjV2 = { input: gameObj, output: { jump: 1 } };

      //  console.log(gameObj)
      const inputs = tf.tensor2d([
        [
          gameObj.distance,
          gameObj.birdTop,
          gameObj.pipeTop,
          gameObj.pipeBottom,
          gameObj.pipeMiddle
        ]
      ]);
      let jump = await model.predict(inputs);
      let choices = jump.dataSync();
      // console.log(choices)
      if (choices[0] > choices[1]) {
        // console.log("Jumping");

        if (currentstate == states.ScoreScreen) {
          $("#replay").click();
        } else {
          screenClick();
        }
      }
    } else {
      //  console.log("No pipes :(");
    }
    await sleep(100);
  }
}

collect();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeElement(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}

async function mutate(model) {
  const weights = await model.getWeights()[0].data()
  console.log("Current weights")
  console.log(weights);
  debugger

  // weight = weight * (1 + (random() * 0.2 - 0.1));
}




async function clone(model) {
  const clonie = await newNet()
  const desiredWeights = model.getWeights()
  clonie.setWeights(desiredWeights);
  return clonie
}




function newNet() {
  const model = tf.sequential();

  // add hidden layer
  model.add(
    tf.layers.dense({
      inputShape: [5],
      units: 8,
      activation: "relu"
    })
  );

  // add output layer
  model.add(
    tf.layers.dense({
      units: 2,
      activation: "softmax"
    })
  );

  return model;
}