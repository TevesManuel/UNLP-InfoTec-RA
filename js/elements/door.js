class DoorARElement {
    constructor(scene, clickeables) {
        this.model = new ARModel(
            scene,
            new URL('Models/PuertaPopUp.glb', window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/') + '/').href,
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
            },
            false
        );

        this.clickeable = new ClickableCube(
            scene,
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
            scene.hideTARObjects();
            this.model.toggleVisibility();
        });
        clickeables.push(this.clickeable);
        scene.TARObjects.push(this);
    }
}