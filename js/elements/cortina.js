class CortinaARElement {
    constructor(scene, clickeables) {
        this.model = new ARModel(
            scene,
            new URL('Models/CortinaPopUp.glb', window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/') + '/').href,
            {
                x: -1.3,
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
            },
            false
        );

        this.clickeable = new ClickableCube(
            scene,
            {
                x: -1.4,
                y: 1.0,
                z: 2.25
            },
            {
                x: 0.5,
                y: 0.5,
                z: 0.25
        });
        this.clickeable.onClick(() => {
            scene.hideTARObjects();
            this.model.toggleVisibility();
        });
        clickeables.push(this.clickeable);
        scene.TARObjects.push(this);
    }
}