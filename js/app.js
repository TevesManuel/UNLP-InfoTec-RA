/**
 * @fileoverview Renderización en Realidad Aumentada con Three.js y AR.js.
 * 
 * @author Manuel Tomas Teves
 * @date 29 mar 2025
 * 
 * Copyright (c) 2025 Manuel Tomas Teves
 * 
 * Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
 * de este software y los archivos de documentación asociados (el "Software"), para 
 * utilizar el Software sin restricción, incluyendo sin limitación los derechos de uso, 
 * copia, modificación, fusión, publicación, distribución, sublicencia y/o venta del 
 * Software, y para permitir a las personas a quienes se les proporcione el Software 
 * hacer lo mismo, sujeto a las siguientes condiciones:
 * 
 * El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias
 * o partes sustanciales del Software.
 * 
 * EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, 
 * INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO 
 * PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN 
 * RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN 
 * CONTRACTUAL, EXTRACONTRACTUAL O DE OTRO TIPO, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE 
 * O EL USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
 */

const VECTOR3_ZERO = {
    x: 0,
    y: 0,
    z: 0,
}

class ARModel {
    constructor(scene, path, position, scale, rotation) {
        this.model = null;
        this.visible = false;
        this.scene = scene;

        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) => {
            this.model = gltf.scene;
            
            this.model.traverse((child) => {
                if (child.isMesh) {
                    const oldMat = child.material;
                    const color = oldMat.color.clone().multiplyScalar(1.0);
                    
                    child.material = new THREE.MeshStandardMaterial({
                        map: oldMat.map,
                        color: color,
                    });
                }
            });
            this.model.scale.set(scale.x, scale.y, scale.z);
            this.model.position.set(position.x, position.y, position.z);
            this.model.rotation.set(rotation.x, rotation.y, rotation.z);
            this.visible = true;
            this.scene.add(this.model);
        }, undefined, function (error) {
            console.error('Error al cargar el modelo:', error);
        });
    }
    
    setVisible(state) {
        if (this.model) {
            const newState = state;
            this.model.traverse((child) => {
                if (child.visible !== undefined) child.visible = newState;
            });
        }
    }

    toggleVisibility() {
        if (this.model) {
            const newState = !this.model.visible;
            this.model.traverse((child) => {
                if (child.visible !== undefined) child.visible = newState;
            });
        }
    }

}

class ClickableCube {
    constructor(scene, position, scale, cbkFn) {
        this.cbkFn = cbkFn;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.scale.set(scale.x, scale.y, scale.z);
        scene.add(this.mesh);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    onClick(cbkFn) {
        this.cbkFn = cbkFn;
    }

    checkClick(event, camera) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects([this.mesh]);

        if (intersects.length > 0) {
            console.log('[i] Debug: detected click.');
            this.cbkFn();
        }
    }
}

class ARApp {
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0px';
        this.renderer.domElement.style.left = '0px';
        this.renderer.domElement.style.width = '100vw';
        this.renderer.domElement.style.height = '100vh';
        document.body.appendChild(this.renderer.domElement);
    }

    setupARToolkit() {
        this.arSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam'
        });
        this.arSource.init(() => {
            this.arSource.onResizeElement();
            this.arSource.copyElementSizeTo(this.renderer.domElement);
            setTimeout(() => {
                this.arSource.onResizeElement();
                this.arSource.copyElementSizeTo(this.renderer.domElement);
            }, 250);
        });

        this.arContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: 'camera_para.dat',
            detectionMode: 'color_and_matrix'
        });
        this.arContext.init(() => {
            this.camera.projectionMatrix.copy(this.arContext.getProjectionMatrix());
        });

        new THREEx.ArMarkerControls(this.arContext, this.camera, {
            type: 'pattern',
            patternUrl: 'pattern-qrcode.patt',
            changeMatrixMode: 'cameraTransformMatrix'
        });

        this.scene.visible = false;
    }

    onClick(event) {
        this.clickeable.checkClick(event, this.camera);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.arContext.update(this.arSource.domElement);
        this.scene.visible = true;
        // if (this.doorAdvertisement.model) {
        //     this.doorAdvertisement.model.lookAt(this.camera.position);
        // }
        this.renderer.render(this.scene, this.camera);
    }

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
        });
        this.setupRenderer();

        this.setupARToolkit();

        this.model = new ARModel(
            this.scene,
            window.location.pathname + 'Model.glb',
            {
                x: 0,
                y: 0,
                z: 0
            },
            {
                x: 2,
                y: 2,
                z: 2
            },
            VECTOR3_ZERO
        );

        this.doorAdvertisement = new ARModel(
            this.scene,
            window.location.pathname + 'HouseDoorAdvertisement.glb',
            {
                x: 0,
                y: 2,
                z: 2.25
            },
            {
                x: 0.25,
                y: 0.25,
                z: 0.25
            },
            {
                x: 0,
                y: 3*Math.PI/2,
                z: 0,
            }
        );
        this.doorAdvertisement.setVisible(false);

        this.clickeable = new ClickableCube(
            this.scene,
            {
                x: -0.4,
                y: 0.75,
                z: 2.25
            },
            {
                x: 0.25,
                y: 0.25,
                z: 0.25
        });
        this.clickeable.onClick(() => {
            this.doorAdvertisement.toggleVisibility();
        });

        const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiental
        // // const light = new THREE.AmbientLight(0xffffff, 1.4); // Luz ambiental
        this.scene.add(light);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.75); // Luz direccional
        // const dirLight = new THREE.DirectionalLight(0xffffff, 2.5); // Luz direccional
        dirLight.position.set(0, 1, 1);
        this.scene.add(dirLight);
        
        this.camera.position.z = 5;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('click', this.onClick.bind(this), false);
        this.animate();
    }
}

new ARApp();