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

class ARApp {
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
        this.loadModel();
        this.addCube();

        this.camera.position.z = 5;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('click', this.onClick.bind(this), false);
        this.animate();
    }

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

    loadModel() {
        const loader = new THREE.GLTFLoader();
        loader.load(window.location.pathname + 'Model.glb', (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    const oldMat = child.material;
                    const color = oldMat.color.clone().multiplyScalar(1.5);
                    child.material = new THREE.MeshBasicMaterial({
                        map: oldMat.map,
                        color: color
                    });
                }
            });
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            this.scene.add(model);
        }, undefined, (error) => {
            console.error('Error al cargar el modelo:', error);
        });
    }

    addCube() {
        const geometry = new THREE.CubeGeometry(1, 1, 1);
        const material = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0.9, 1.2, -0.2);
        this.cube.scale.set(0.25, 0.25, 0.25);
        this.scene.add(this.cube);
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.cube]);

        if (intersects.length > 0) {
            console.log('Cubo clickeado');
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.arContext.update(this.arSource.domElement);
        this.scene.visible = true;
        this.renderer.render(this.scene, this.camera);
    }
}

new ARApp();