import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Quaternion } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { Observable } from '@babylonjs/core/Misc/observable'
import { Matrix } from '@babylonjs/core/Maths/math.vector'
import { ImportMeshAsync,SceneLoader } from '@babylonjs/core'

import "@babylonjs/loaders/glTF"

import * as TWEEN from '@tweenjs/tween.js'

window.BABYLON = {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  Color3,
  Quaternion,
  MeshBuilder,
  TransformNode,
  StandardMaterial,
  HemisphericLight,
  DirectionalLight,
  Observable,
  Matrix,
  ImportMeshAsync
}


window.TWEEN = TWEEN

 let anchor, cube, engine,scene,camera
 let imageTargets

 //all the content of the scene is added in the initXrScene
const initXrScene  = ({ scene, camera }) => {

  //Anchor to hold the model and easily scale the model on the image target
  anchor = new TransformNode("anchor", scene)
  anchor.setEnabled(false)

//Import a GLTF Model
SceneLoader.ImportMeshAsync(
  "",
  "/models/",
  "CE_Logo_Base3D.glb",
  scene
).then((result) => {

  const root = result.meshes[0] 
  root.parent = anchor
console.log(root);

  root.position.set(0, 0, -0.02)
  root.scaling.set(-0.1, 0.1, 0.1) //remove the mirror
})

 
  
  
// a simple geometry big as the image target
cube = MeshBuilder.CreateBox("box", {
  width: 0.15,   // 15 cm (X)
  height: 0.105,  // 10.5 cm (Y)
  depth: 0.01    // 1cm thickness (Z)
}, scene)

    const material = new StandardMaterial("mat", scene)
    material.diffuseColor = Color3.FromHexString("#ff6600")
    material.specularColor = new Color3(0.1, 0.1, 0.1)
    material.alpha = 0.5

    cube.material = material
    cube.parent = anchor

    // lights for the scene
    const hemi = new HemisphericLight(
      "hemi",
      new Vector3(0, 1, 0),
      scene
    )
    hemi.intensity = 1.0
    const dir = new DirectionalLight(
      "dir",
      new Vector3(1, -2, -1),
      scene
    )
    dir.intensity = 1.0
    
// Debug plane
const plane = MeshBuilder.CreateGround("debug", {
  width: 1,
  height: 1
}, scene)

plane.parent = anchor
plane.material = new StandardMaterial("mat", scene)
plane.material.wireframe = true
}


//set up the engine, scene and link between BabylonJS and 8Th Walls
 const imageTargetPipelineModule = () => {

 const startScene=()=>{ 
    console.log('Start');
    
    //this must be the same of the canvas in the index.html
    const canvas = document.getElementById('camerafeed')
  
    engine = new Engine(canvas, true)
    engine.enableOfflineSupport = false
  
  scene = new Scene(engine)

  camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene)
  camera.minZ=0.01

//configure the 8thWall camera with the Babylonjs one, XR8.XrConfig.device().ANY is to enable the use of desktop webcams
  const runConfig = {
    cameraConfig: XR8.XrConfig.camera().BACK,
    allowedDevices: XR8.XrConfig.device().ANY,
    imageTargetData: imageTargets,
    scale:"absolute",
    verbose: true, //false in production
  }
  
const xrBehavior=XR8.Babylonjs.xrCameraBehavior(runConfig)

camera.addBehavior(xrBehavior) // Connect camera to XR and show camera feed.

// series of events to listen when images are detected
scene.onXrImageFoundObservable.add((event) => {
    console.log(event);
    
    console.log('FOUND', event.name)
    if (event.name === 'target-image') {
      anchor.setEnabled(true)
    }
  })

  scene.onXrImageUpdatedObservable.add((event) => {
    if (event.name !== 'target-image') return

    anchor.position.set(
      event.position.x,
      event.position.y,
      event.position.z
    )

    if (!anchor.rotationQuaternion) {
      anchor.rotationQuaternion = new Quaternion()
    }

    anchor.rotationQuaternion.set(
      event.rotation.x,
      event.rotation.y,
      event.rotation.z,
      event.rotation.w
    )

    //TODO this settings make the size of the geometry perfectly overlapping the card, therefore having a scale 1:1. 
    //There should be a better and stable way to get this right

    anchor.scaling.set(3.5,3.5,3.5)

   
  })

  scene.onXrImageLostObservable.add((event) => {
    if (event.name === 'target-image') {
      anchor.setEnabled(false)
    }
  })

  //the scene, engine and listeners are ready.
  //Add objects to the scene and set starting camera position.
  initXrScene({ scene, camera }) 

  //the render loop for Babylonjs
  engine.runRenderLoop(() => {
    TWEEN.update()
    scene.render()
      })

  window.addEventListener('resize', () => engine.resize())
  
 }

//Once the libraries are in, be sure to start the setup once
let started = false
const onStart = () => {
  if (started) return
  started = true
  startScene()
}

  return {
    name: 'image-target-babylon',
    onStart,
  }
}




//Set up the environemtn and load the Image Targets
const onxrloaded = async () => {
  try {
    imageTargets = await loadImageTargetsFromJson('./target/image-targets.json')
    // console.log(imageTargets);
    
    // Configured here
    //TODO at the mometn image targets need to be add here and above
    XR8.XrController.configure({
      imageTargetData: imageTargets,
      disableWorldTracking: true, // set true to skip SLAM, it improve performances. To works on desktop webcam this must be TRUE (slam not supported on desktop)
      //scale:"responsive"// default is responsive, "absolute" rely on slam, but it was not stable in the test
    })


    XR8.addCameraPipelineModules([
      XR8.XrController.pipelineModule(),           // tracking
      XRExtras.AlmostThere.pipelineModule(),       // browser support UI
      XRExtras.FullWindowCanvas.pipelineModule(),  // full-window canvas
      XRExtras.Loading.pipelineModule(),           // loading screen
      XRExtras.RuntimeError.pipelineModule(),      // runtime errors
      imageTargetPipelineModule(),                 // our module 
    ])
    

    XR8.run(
      {
        canvas: document.getElementById('camerafeed'), //this need to be the canvas id in the index.html
        allowedDevices: XR8.XrConfig.device().ANY,//allow the use of the webcams
      })
  } catch (e) {
    console.error(e)
    XRExtras?.RuntimeError?.showRuntimeError?.()
  }
}


// Show loading screen before the full XR library has been loaded.
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded, { once: true })


// --- Utility: load multiple image targets via JSON ---
async function loadImageTargetsFromJson(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to load image target JSON: ${url} (${res.status})`)
  }

  const raw = await res.json()
  const targets = Array.isArray(raw) ? raw : [raw]

  return targets.map((t) => {
    const geometry = t.properties || t.xrMetadata || null
    return {
      name: t.name,
      type: t.type || 'PLANAR',
      imagePath: t.imagePath,          
      metadata: t.metadata ?? {},      
      properties: geometry || undefined,
      xrMetadata: geometry || undefined,
      resources: t.resources,
      created: t.created,
      updated: t.updated,
    }
  })
}