class Dispenser extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, /*texture, */type) {
        super(scene, x, y, /*texture, */type);

        //Add object to existing scene
        scene.add.existing(this);
        
        //Dispenser data
        this.scene = scene;
        // this.dispenserIndex; //Implement later (local storage list of dispensers as multidimensional array)
        this.ingredientType = (type == null) ? 'empty' : type;
        this.maxIngredients = (this.ingredientType == 'empty') ? null : (Math.round(this.scene.binWeight / this.getIngredientData(this.ingredientType, 'weight')));
        this.numIngredients = this.maxIngredients;
        this.priceToRefill = (this.ingredientType == 'empty') ? null : 0;

        //Dispenser components
        this.dispenserFrame = this.scene.add.rectangle(this.x, this.y, 100, 250, 0xD3D3D3).setOrigin(0.5, 0);
        this.dispenseButton = this.scene.add.circle(this.x, this.y + 200, 25, 0xFF0000).setOrigin(0.5,0.5);
        this.refillButton = this.scene.add.circle(this.x + 30, this.y + 150, 10, 0x0000FF).setOrigin(0.5,0.5);
        this.ingredientText = this.scene.add.text(this.x, this.y + 235, this.ingredientType + ((this.ingredientType == 'empty') ? '' : 's'), this.scene.defaultTextConfig).setOrigin(0.5,0.5);
        this.ingredientText.setScale(0.5);

        //Make dispenser and refill buttons interactable
        this.dispenseButton.setInteractive({
            draggable: false,
            useHandCursor: true
        });
        this.refillButton.setInteractive({
            draggable: false,
            useHandCursor: true
        });
        this.refillButton.on('pointerover',() => {
            let priceStr;
            if(this.priceToRefill == null) {
                priceStr = 'this dispenser is empty';
            } else {
                priceStr = 'this item costs $' + this.priceToRefill + ' to refill';
            }

            let priceText = this.scene.add.text(440, 265, 'this item costs $' + this.priceToRefill + ' to refill', this.scene.defaultTextConfig).setScale(0.5).setOrigin(0.5,0.5);
            // priceText.setScale(0.5);
            this.scene.time.delayedCall(2000, () => {
                priceText.destroy();
            });
        });


        this.dispenseButton.setDataEnabled();
        this.refillButton.setDataEnabled();
        this.dispenseButton.setData('prefab', this);
        this.refillButton.setData('prefab', this);


        this.scene.refillButtons.add(this.refillButton);
        this.scene.dispenseButtons.add(this.dispenseButton); 
        this.scene.dispenserArray.push(this);

        this.refillMeterBacking = this.scene.add.rectangle(this.x, this.y + 150, 25, 75, 0x000000).setOrigin(0.5, 1);
        this.refillMeter = this.scene.add.rectangle(this.x, this.y + 150, 25, 75, 0x00FF00).setOrigin(0.5, 1);

        //Load Sprite
        this.scene.load.image('cir', './assets/circle.png');

        //Load Audio
        this.scene.load.audio('dispense', './assets/dispenserNoise.mp3');
        this.scene.load.audio('emptyDispenser', './assets/dispenserEmpty.mp3');
    }

    spawnIngredient() {
        let spawnedIngredient;
        let typeString;

        if(this.ingredientType == 'empty') {
            this.sound.play('emptyDispenser');
        } else {
            //Select correct sprite to load for spawnIngredient
            if(this.ingredientType == 'peanut') {
                typeString = 'cir'; // typeString = 'peanut';
            } else if(this.ingredientType == 'raisin') {
                typeString = 'cir'; // typeString = 'raisin';
            } else if(this.ingredientType == 'm&m') {
                typeString = 'cir'; // typeString = 'm&m';
            } else if(this.ingredientType == 'almond') {
                typeString = 'cir'; // typeString = 'almond';
            }

            //Spawn Ingredient
            spawnedIngredient = new Ingredient(this.scene, this.x, this.y, 'circle'/*typeString*/, null, this.ingredientType, this.getIngredientData(this.ingredientType)).setOrigin(0.5,0.5);
            
            this.scene.sound.play('dispense');
            this.numIngredients--;

            //Update spawnedIngredient matter physics config
            spawnedIngredient.body.slop = 0;
            spawnedIngredient.body.restitution = 0;
            spawnedIngredient.setCircle();
            spawnedIngredient.body.density = 0;

            this.scene.ingHolder.add(spawnedIngredient); //Add spawnedIngredient to ingredient group
            this.priceToRefill = Math.ceil(Math.abs(this.numIngredients - this.maxIngredients) * spawnedIngredient.price); //Update priceToRefill
            this.refillMeter.height = (this.numIngredients / this.maxIngredients) * 75; //Update refillMeter
        }
    }

    changeType(newType) {
        this.ingredientType = newType;
        if(newType == 'peanut') {
            // this.scene.load.image('peanut', './assets/peanut.png');
            this.maxIngredients = this.scene.maxPeanuts;
        } else if(newType == 'raisin') {
            // this.scene.load.image('raisin', './assets/raisin.png');
            this.maxIngredients = this.scene.maxRaisins;
        } else if(newType == 'm&m') {
            // this.scene.load.image('m&m', './assets/m&m.png');
            this.maxIngredients = this.scene.maxMNMS;
        } else if(newType == 'almond') {
            // this.scene.load.image('almond', './assets/almond.png');
            this.maxIngredients = this.scene.maxAlmonds;
        }
    }

    getIngredientData(type, data) {
        let ingColor, ingWeight, ingPrice, ingValue;
        let ingDataArray = [];
        
        if(type == "peanut"){
            ingColor = 0xeddeb4;
            ingWeight = 1
            ingPrice = 0.0029;
            ingValue = 0.0214;
        }
        else if(type == "raisin"){
            ingColor = 0x722D5E;
            ingWeight = 0.5; 
            ingPrice = 0.0023;
            ingValue = 0.0208;
        } else if(type == "m&m") {
            let candy_colors = [0x1c3ca6, 0xad1111, 0x4e9c0b, 0xeff53b, 0x523a00];
            ingColor = candy_colors[Math.floor(Math.random() * candy_colors.length)];
            ingWeight = 1.1; 
            ingPrice = 0.056;
            ingValue = 0.0745;
        } else if(type == "almond"){
            ingColor = 0x523f0a;
            ingWeight = 1.3;
            ingPrice = 0.028;
            ingValue = 0.0465;
        }

        if(data == null) {
            ingDataArray.push(ingColor, ingWeight, ingPrice, ingValue);
            return ingDataArray;
        } /*else if(data == 'color') {
            return ingColor;
        }*/ else if(data == 'weight') {
            return ingWeight;
        } else if(data == 'price') {
            return ingPrice;
        } else if(data == 'value') {
            return ingValue;
        }
        
    }
}



// constructor(scene, x, y, texture, frame/*, img*/) {
//     super(scene, x, y, texture, frame/*, img*/);

//     //Add object to existing scene
//     scene.add.existing(this);

//     this.scene = scene;
//     this.scene.load.image('cir', './assets/circle.png');
// }

// spawnObj() {
//     let spawnedObj;
//     spawnedObj = new Spawned(this.scene, Math.floor(Math.random()*100)+((game.config.width/2) - 50), Math.floor(Math.random()*100)+((game.config.height/2) - 50), 'cir').setOrigin(0.5,0.5);
//     spawnedObj.setTint(0xFF0000);
//     console.log('spawnedObj spawned');
// }