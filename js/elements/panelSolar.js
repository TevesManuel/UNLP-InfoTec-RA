class PanelSolarARElement {
    constructor(scene, clickeables) {
        this.model = new ARModel(
            scene,
            new URL('Models/PanelSolarPopUp.glb', window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/') + '/').href,
            {
                x: -0.4,
                y: 2,
                z: -0.5
            },
            {
                x: 0.25,
                y: 0.25,
                z: 0.25
            },
            {
                x: 0,
                y: Math.PI/2,
                z: 0,
            },
            false
        );

        this.clickeable = new ClickableCube(
            scene,
            {
                x: -0.6,
                y: 0.5,
                z: -0.5
            },
            {
                x: 1,
                y: 0.5,
                z: 0.5
        });
        this.clickeable.onClick(() => {
            let newState = !this.model.model.visible;
            scene.hideTARObjects();
            this.model.setVisible(newState);
        });
        clickeables.push(this.clickeable);
        scene.TARObjects.push(this);
    }
}