import {MOUSE, Object3D, Quaternion, Sphere, Spherical, Vector2, Vector3} from "three";

const changeEvent = {type: 'change'};
const startEvent = {type: 'start'};
const endEvent = {type: 'end'};

const STATE = {
  ROTATE: MOUSE.ROTATE,
  PAN: MOUSE.PAN,
}

export default class PreviewControls extends Object3D {
  target = new Vector3()

  enabled = true

  enableDamping = false;
  dampingFactor = 0.05;

  enableRotate = true
  rotateSpeed = 1.0

  enablePan = true;
  panSpeed = 1.0;
  screenSpacePanning = true;

  cameraPosition = new Vector3();
  cameraQuaternion = new Quaternion();
  cameraScale = new Vector3();

  parentPosition = new Vector3();
  parentQuaternion = new Quaternion();
  parentQuaternionInv = new Quaternion();
  parentScale = new Vector3();

  worldPosition = new Vector3();
  worldQuaternion = new Quaternion();
  worldQuaternionInv = new Quaternion();
  worldScale = new Vector3();

  eye = new Vector3();

  mouseButtons = {LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};

  constructor(object, camera, domElement) {
    super()
    const scope = this
    this.object = object
    this.camera = camera
    this.domElement = domElement

    this.update = function () {

      const offset = new Vector3();

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(camera.up, new Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();

      return function () {
        const position = scope.camera.position;

        offset.copy(position).sub(scope.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (scope.enableDamping) {


        } else {

          rotationAxis.applyQuaternion( scope.parentQuaternionInv );
          object.quaternion.copy( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) );
          object.quaternion.multiply( quaternionStart ).normalize();

        }

        if (scope.enableDamping) {

          scope.target.addScaledVector(panOffset, scope.dampingFactor);

        } else {

          scope.target.add(panOffset);

        }

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(scope.target).add(offset);

        scope.camera.lookAt(scope.target);

        if (scope.enableDamping === true) {


          panOffset.multiplyScalar(1 - scope.dampingFactor);

        } else {


          panOffset.set(0, 0, 0);

        }
      }
    }()

    let state = STATE.NONE

    const spherical = new Spherical();
    const sphericalDelta = new Spherical();

    const _tempVector = new Vector3();
    const _tempQuaternion = new Quaternion();
    const quaternionStart = new Quaternion();
    const rotationAxis = new Vector3();
    let rotationAngle = 0;

    const rotateStart = new Vector2();
    const rotateEnd = new Vector2();
    const rotateDelta = new Vector3();

    const panOffset = new Vector3();

    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();

    const dollyStart = new Vector2();
    const dollyEnd = new Vector2();
    const dollyDelta = new Vector2();

    scope.domElement.addEventListener('contextmenu', onContextMenu);

    scope.domElement.addEventListener('pointerdown', onPointerDown);

    function onContextMenu(event) {

      if (scope.enabled === false) return;

      event.preventDefault();

    }

    function onPointerDown(event) {

      if (scope.enabled === false) return;

      switch (event.pointerType) {

        case 'mouse':
        case 'pen':
          onMouseDown(event);
          break;

        // TODO touch

      }

    }

    function onMouseDown(event) {

      // Prevent the browser from scrolling.
      event.preventDefault();

      // Manually set the focus since calling preventDefault above
      // prevents the browser from setting it automatically.

      scope.domElement.focus ? scope.domElement.focus() : window.focus();

      let mouseAction;

      switch (event.button) {

        case 0:

          mouseAction = scope.mouseButtons.LEFT;
          break;

        case 1:

          mouseAction = scope.mouseButtons.MIDDLE;
          break;

        case 2:

          mouseAction = scope.mouseButtons.RIGHT;
          break;

        default:

          mouseAction = -1;

      }

      switch (mouseAction) {

        case MOUSE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseDownDolly(event);

          state = STATE.DOLLY;

          break;

        case MOUSE.ROTATE:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {

            if (scope.enablePan === false) return;

            handleMouseDownPan(event);

            state = STATE.PAN;

          } else {

            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;

          }

          break;

        case MOUSE.PAN:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {

            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;

          } else {

            if (scope.enablePan === false) return;

            handleMouseDownPan(event);

            state = STATE.PAN;

          }

          break;

        default:

          state = STATE.NONE;

      }

      if (state !== STATE.NONE) {

        scope.domElement.ownerDocument.addEventListener('pointermove', onPointerMove);
        scope.domElement.ownerDocument.addEventListener('pointerup', onPointerUp);

        scope.dispatchEvent(startEvent);

      }

    }

    function handleMouseDownRotate(event) {

      quaternionStart.copy( scope.object.quaternion )
      rotateStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownPan(event) {

      panStart.set(event.clientX, event.clientY);

    }

    function onPointerMove(event) {

      if (scope.enabled === false) return;

      switch (event.pointerType) {

        case 'mouse':
        case 'pen':
          onMouseMove(event);
          break;

        // TODO touch

      }

    }

    function onMouseMove(event) {

      if (scope.enabled === false) return;

      event.preventDefault();

      switch (state) {

        case STATE.ROTATE:

          if (scope.enableRotate === false) return;

          handleMouseMoveRotate(event);

          break;

        case STATE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseMoveDolly(event);

          break;

        case STATE.PAN:

          if (scope.enablePan === false) return;

          handleMouseMovePan(event);

          break;

      }

    }

    function handleMouseMoveRotate(event) {

      rotateEnd.set(event.clientX, event.clientY);

      rotateDelta.x = rotateEnd.x - rotateStart.x
      rotateDelta.y = -(rotateEnd.y - rotateStart.y)

      rotationAxis.copy(rotateDelta).cross(scope.eye).normalize();
      rotationAngle = rotateDelta.dot(_tempVector.copy(rotationAxis).cross(scope.eye)) * scope.rotateSpeed;
      console.log(rotationAxis, rotationAngle)

      rotateStart.copy(rotateEnd);

      scope.update();

    }

    function handleMouseMovePan(event) {
      panEnd.set(event.clientX, event.clientY);

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      scope.update();
    }

    function onPointerUp(event) {

      switch (event.pointerType) {

        case 'mouse':
        case 'pen':
          onMouseUp(event);
          break;

        // TODO touch

      }

    }

    function onMouseUp(event) {

      scope.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove);
      scope.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);

    }

    let pan = function () {

      const offset = new Vector3();

      return function pan(deltaX, deltaY) {

        const element = scope.domElement;

        if (scope.camera.isPerspectiveCamera) {

          // perspective
          const position = scope.camera.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.camera.matrix);
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.camera.matrix);

        } else if (scope.camera.isOrthographicCamera) {

          // orthographic
          panLeft(deltaX * (scope.camera.right - scope.camera.left) / scope.camera.zoom / element.clientWidth, scope.camera.matrix);
          panUp(deltaY * (scope.camera.top - scope.camera.bottom) / scope.camera.zoom / element.clientHeight, scope.camera.matrix);

        } else {

          // camera neither orthographic nor perspective
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
          scope.enablePan = false;

        }

      };

    }();

    let panLeft = function () {

      const v = new Vector3();

      return function panLeft(distance, objectMatrix) {

        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);

      };

    }();

    let panUp = function () {

      const v = new Vector3();

      return function panUp(distance, objectMatrix) {

        if (scope.screenSpacePanning === true) {

          v.setFromMatrixColumn(objectMatrix, 1);

        } else {

          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.camera.up, v);

        }

        v.multiplyScalar(distance);

        panOffset.add(v);

      };

    }();
  }

  updateMatrixWorld() {

    if (this.object !== undefined) {

      this.object.updateMatrixWorld();

      if (this.object.parent === null) {

        console.error('PreviewControls: The attached 3D object must be a part of the scene graph.');

      } else {

        this.object.parent.matrixWorld.decompose(this.parentPosition, this.parentQuaternion, this.parentScale);

      }

      this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);

      this.parentQuaternionInv.copy(this.parentQuaternion).invert();
      this.worldQuaternionInv.copy(this.worldQuaternion).invert();

    }

    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this.cameraScale);

    this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();

    Object3D.prototype.updateMatrixWorld.call(this);

  }
}
