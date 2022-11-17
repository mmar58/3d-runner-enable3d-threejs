import { ExtendedObject3D, PhysicsLoader, Project, Scene3D } from "enable3d";
import { Keyboard } from "@yandeu/keyboard";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { AudioManager } from "@yandeu/audio";
import { Audio } from "@yandeu/audio/lib/audio/audio";
import swipeDetect from 'swipe-detect';
/**
 * Uncomment the scene you want to run. (default three.js)
 */

// start three.js scene (with enable3d physics)
// import './three'

// start standalone enable3d scene
// import './standalone'
var ground: ExtendedObject3D,
  ourzombie: ExtendedObject3D,
  thiszombie: THREE.Group,
  startgame = false,
  runanimation: THREE.AnimationAction,
  idleanimation: THREE.AnimationAction,
  animationMixer: THREE.AnimationMixer,
  destroyenemycounter = 0,
  oursun: THREE.DirectionalLight,
  dodropenemy = false,
  enemylist: ExtendedObject3D[] = [],
  zombieloaded = false,
  gamestarted = false,
  curobjectCount = 0,
  objectcount = 0,
  runningmeter = -1,
  lastaddobject = 0,
  backgroundMusic: Audio

const keyboard = new Keyboard();
const audio = new AudioManager();
const clock = new THREE.Clock();
var direction = new THREE.Vector3();
var scorediv = document.getElementById("goalcount") as HTMLElement,
  gameoverDiv = document.getElementById("gameoverdiv") as HTMLDivElement,
  gameover = false,
  mainbody = document.getElementById("mainbody") as HTMLBodyElement,
  loadingbar = document.getElementById("loadingbar") as HTMLDivElement,
  maindiv = document.getElementById("maindiv") as HTMLDivElement,
  startgamediv = document.getElementById("startgame") as HTMLDivElement,
  button = {
    // leftbutton: document.getElementById("leftbutton") as HTMLDivElement,
    // rightbutton: document.getElementById("rightbutton") as HTMLDivElement,
    // shotbutton: document.getElementById("shotbutton") as HTMLDivElement,
    startgamebutton: document.getElementById(
      "startgameButton"
    ) as HTMLButtonElement,
  },
  move = { left: false, right: false, forward: false, moving: false, curRowNum: 0, sliderDirection: "", playerisOnGround: true };
export class PhysicsTest extends Scene3D {
  init() {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  async preload() {
    await audio.load("background", "assets/music/background_music", "ogg");
    await audio.load("shot", "assets/music/shot", "ogg");
    await audio.load("danger", "assets/music/danger", "ogg");
    backgroundMusic = await audio.add("background");
  }
  create() {
    ourzombie = new ExtendedObject3D()
    this.warpSpeed("-ground", "-orbitControls");
    this.camera.position.set(0, 21, 15);
    this.camera.lookAt(0, 0, 0)
    oursun = this.scene.getObjectById(17) as THREE.DirectionalLight
    oursun.position.set(8, 14, 13)
    oursun.intensity = 6
    oursun.lookAt(0, 0, 0)

    ground = this.physics.add.box({ width: 30, depth: 50, y: -0.5, collisionFlags: 2 },)
    this.load.fbx("assets/zombie.fbx").then((zombie) => {
      zombie.scale.x = 0.02;
      zombie.scale.y = 0.02;
      zombie.scale.z = 0.02;
      zombie.position.y = -.75

      // zombie.position.z = -4;
      zombie.traverse((c) => {
        c.castShadow = true;
      });
      thiszombie = zombie;
      animationMixer = new THREE.AnimationMixer(zombie);
      ourzombie.add(zombie);
      ourzombie.position.z = 8
      ourzombie.rotateY(Math.PI)
      this.scene.add(ourzombie);
      this.physics.add.existing(ourzombie, { shape: "box", height: 1.5, width: 1.5, depth: 1.5 });
      ourzombie.body.on.collision(this.zombieCollied)
      // this.camera.lookAt(ourzombie.position);
      thiszombie.getWorldDirection(direction);
      this.load.fbx("assets/idle.fbx").then((walk) => {
        idleanimation = animationMixer.clipAction(walk.animations[0]);
        idleanimation.play();
      });
      this.load.fbx("assets/run.fbx").then((walk) => {
        runanimation = animationMixer.clipAction(walk.animations[0]);
        zombieloaded = true;
        if (startgame) {
          runanimation.play()

        }
      });

      ground.body.on.collision(this.collided)
    });
    // this.load.texture('/assets/heightmap-simple.png').then(heightmap => {
    //         const mesh = this.heightMap.add(heightmap)
    //         if (mesh) {
    //           // add custom material or a texture
    //           mesh.material = new THREE.MeshPhongMaterial({ map: textureGrass })

    //           // we position, scale, rotate etc. the mesh before adding physics to it
    //           mesh.scale.set(2, 2, 2)

    //           // @ts-ignore
    //           this.physics.add.existing(mesh, { mass: 0, collisionFlags: 1 })
    //         }
    //       })
    // this.physics.debug?.enable();

    //attaching key
    // oursun = this.lights.directionalLight({ intensity: 7 });
    // oursun.position.set(8, 14, 13);
    // oursun.lookAt(0, 0, 0);
    // oursun.shadow.mapSize=new THREE.Vector2(1024,1024)
    // console.log(oursun.shadow)
    swipeDetect(mainbody, swipedetected, 30)
    // button.leftbutton.addEventListener("pointerdown", (e) => {
    //   move.left = true;
    //   console.log(move);
    // });
    // button.leftbutton.addEventListener("pointerup", (e) => {
    //   move.left = false;
    //   move.sliderDirection = "left"
    // });
    // button.rightbutton.addEventListener("pointerdown", (e) => {
    //   move.right = true;
    //   move.sliderDirection = "right"
    //   console.log(move);
    // });
    // button.rightbutton.addEventListener("pointerup", (e) => {
    //   move.right = false;
    // });

    // button.shotbutton.addEventListener("pointerdown", (e) => {
    //   move.forward = true;
    // });
    // button.shotbutton.addEventListener("pointerup", (e) => {
    //   move.forward = false;
    // });
    button.startgamebutton.addEventListener("pointerdown", (e) => {
      startgame = true;
      if (zombieloaded) {
        try {

          runanimation.play()
          idleanimation.stop()
        }
        catch (ex) {
          console.log(ex)
        }
      }
      startgamediv.style.display = "none";
      backgroundMusic.setVolume(0.5);
      backgroundMusic.setLoop(true);
      // backgroundMusic.play();
      console.log("started");
    });
    loadingbar.style.display = "none";
    startgamediv.style.display = "";
    maindiv.style.display = "";
    console.log(loadingbar);

    // ball.body.on.collision(collided);
  }
  update(delta: number) {
    if (startgame) {


      if (delta - lastaddobject > 2) {
        this.addobject()
        lastaddobject = delta
      }
    }
    if (curobjectCount < objectcount) {
      var objecttype = generateRandom(2)
      var pathrow = generateRandom(5) - 2
      if (objecttype == 0) {
        this.physics.add.box({ x: pathrow * 5, z: -24 }, { phong: { color: "black" } })
      }
      else {
        this.physics.add.box({ x: pathrow * 5, z: -24, width: 1.5, depth: 1.5, height: 2 }, { phong: { color: "yellow" } })
      }
      curobjectCount++
    }
    // console.log(this.camera.position);
    if (zombieloaded) {
      animationMixer.update(clock.getDelta());
    }
    if (!gamestarted) {
      if (startgame) {
        this.destroyenemy();
        gamestarted = true;
      }
    }
    if (destroyenemycounter > 40) {
      this.destroyenemy();
      destroyenemycounter = 0;
    } else {
      destroyenemycounter++;
    }
    // if (box.position.y < 0 || box.position.z > 8) {
    //   gameover = true;
    //   gameoverDiv.style.display = "";
    //   if (backgroundMusic.isPlaying) {
    //     backgroundMusic.stop();
    //   }
    // }

    if (dodropenemy) {
      var enemy = this.physics.add.box(
        { x: generateRandom(18) - 9, y: 10, z: -10 },
        { phong: { color: "black" } }
      );
      enemylist.push(enemy);
      dodropenemy = false;
    }
    if (zombieloaded) {
      if (!gameover) {
        console.log(move.sliderDirection)
        if (move.moving) {
          if (Math.round(ourzombie.position.x) == move.curRowNum * 5) {
            ourzombie.body.setVelocityX(0)
            move.moving = false
          } else {
            console.log(Math.round(ourzombie.position.x), move.curRowNum * 5)
          }
        }
        if (move.sliderDirection != "") {

          if (move.sliderDirection == "left") {
            if (move.curRowNum > -2) {
              move.curRowNum -= 1
              ourzombie.body.setVelocityX(-10)
              move.moving = true
            }

          }
          else if (move.sliderDirection == "right") {
            if (move.curRowNum < 2) {
              console.log("i am going")
              move.curRowNum += 1
              ourzombie.body.setVelocityX(10)
              move.moving = true
            }

          }
          else if (move.sliderDirection == "up") {
            if (move.playerisOnGround) {
              ourzombie.body.applyForceY(8)
              move.playerisOnGround = false
            }

          }
          move.sliderDirection = ""
        }
      }
      // if (keyboard.key("ArrowUp").isDown || move.forward) {
      //   // ourzombie.body.setVelocityX(direction.x * 2);
      //   // ourzombie.body.setVelocityZ(direction.z * 2);

      //   runanimation.play();
      //   idleanimation.stop();
      //   // walkanimation.paused = false;
      // } else {
      //   if (!idleanimation.isRunning()) {
      //     idleanimation.play();
      //     runanimation.stop();
      //   }
      //   // walkanimation.paused = true;
      //   // ourzombie.body.setVelocity(0, 0, 0);
      // }
      // if (keyboard.key("ArrowLeft").isDown || move.left) {
      //   // thiszombie.rotateY(0.1);
      //   move.sliderDirection = "left"
      //   move.left=false
      // }
      // if (keyboard.key("ArrowRight").isDown || move.right) {
      //   // thiszombie.rotateY(-0.1);
      //   move.sliderDirection = "right"
      //   move.right=false
      // }
    }
  }
  addobject() {
    runningmeter++
    scorediv.innerHTML = runningmeter + ""
    objectcount = generateRandom(8)
    curobjectCount = 0
  }
  zombieCollied(object: ExtendedObject3D) {
    if (object.name != ground.name) {
      gameover = true
      gameoverDiv.style.display = ""
    }
  }
  collided(object: ExtendedObject3D, event) {
    // console.log(object.name);
    // if (object.name == "ground" && getground) {
    //   object.body.on.collision(groundcollided);
    //   getground = false;
    // }
    if (object.name == ourzombie.name) {
      if (ourzombie.position.y < 0.8) {
        move.playerisOnGround = true
      }

    }
    else {
      object.body.setVelocityZ(5)
      if (object.body.position.z > 23.99) {
        this.removeitem(object)
      }
    }
  }
  removeitem(item: ExtendedObject3D) {
    this.physics.destroy(item);
    item.parent?.remove(item);
  }
  destroyenemy() { }
}

keyboard.watch.down((keycode) => {
  console.log(keycode);
  if (keycode == "Space") {
  }
  else if (keycode == "ArrowLeft") {
    move.sliderDirection = "left"
  }
  else if (keycode == "ArrowRight") {
    move.sliderDirection = "right"
  }
  else if (keycode == "ArrowUp") {
    move.sliderDirection = "up"
  }
});
function swipedetected(swipedata) {
  move.sliderDirection = swipedata
}

function generateRandom(max = 100) {
  return Math.floor(Math.random() * max);
}
const config = { scenes: [PhysicsTest], antialias: true };
PhysicsLoader("/ammo", () => new Project(config));
