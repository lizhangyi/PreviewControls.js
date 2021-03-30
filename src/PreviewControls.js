import {EventDispatcher, Quaternion, Sphere, Spherical, Vector2, Vector3} from "three";

export default class PreviewControls extends EventDispatcher {
  target = new Vector3()

  enabled = true

  enableDamping = false;
  dampingFactor = 0.05;

  enablePan = true;
  panSpeed = 1.0;

  constructor(object, domElement) {
    super()
    const scope = this
    this.object = object
    this.domElement = domElement

    this.update = function () {

      const offset = new Vector3();

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();

      const lastPosition = new Vector3();
      const lastQuaternion = new Quaternion();

      const twoPI = 2 * Math.PI;

      return function () {
        var position = scope.object.position;

        offset.copy( position ).sub( scope.target );

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion( quat );

        // angle from z-axis around y-axis
        spherical.setFromVector3( offset );

        if ( scope.enableDamping === true ) {

          scope.target.addScaledVector( panOffset, scope.dampingFactor );

        } else {

          scope.target.add( panOffset );

        }

        offset.setFromSpherical( spherical );

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion( quatInverse );

        position.copy( scope.target ).add( offset );

        scope.object.lookAt( scope.target );

        if ( scope.enableDamping === true ) {

          sphericalDelta.theta *= ( 1 - scope.dampingFactor );
          sphericalDelta.phi *= ( 1 - scope.dampingFactor );

          panOffset.multiplyScalar( 1 - scope.dampingFactor );

        } else {

          sphericalDelta.set( 0, 0, 0 );

          panOffset.set( 0, 0, 0 );

        }
      }
    }()

    const spherical = new Spherical();
    const sphericalDelta = new Spherical();

    const panOffset = new Vector3();

    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();

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
      if (scope.enablePan === false) return;

      handleMouseDownPan(event);

      scope.domElement.ownerDocument.addEventListener('pointermove', onPointerMove);
      scope.domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
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
      handleMouseMovePan(event);
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

    function onMouseUp( event ) {

      scope.domElement.ownerDocument.removeEventListener( 'pointermove', onPointerMove );
      scope.domElement.ownerDocument.removeEventListener( 'pointerup', onPointerUp );

    }

    let pan = function () {

      const offset = new Vector3();

      return function pan(deltaX, deltaY) {

        const element = scope.domElement;

        if (scope.object.isPerspectiveCamera) {

          // perspective
          const position = scope.object.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

        } else if (scope.object.isOrthographicCamera) {

          // orthographic
          panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
          panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

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
          v.crossVectors(scope.object.up, v);

        }

        v.multiplyScalar(distance);

        panOffset.add(v);

      };

    }();
  }
}
