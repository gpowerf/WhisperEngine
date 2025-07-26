// --- GAME DATA ---

const items = {
    torch: {
        id: 'torch',
        name: 'Unlit Torch',
        description: 'A simple wooden torch, wrapped in oil-soaked rags. It feels cold.',
        takeable: true,
        lit: false,
        onUse: function(item) { // `item` is the item object itself
            if (item.lit) {
                 addTextToDisplay("Your torch is already lit.");
            } else {
                // In a real game, you might need a tinderbox. We'll make it easy.
                item.lit = true;
                item.name = "Lit Torch";
                item.description = "The torch burns with a bright, steady flame, pushing back the darkness.";
                addTextToDisplay("You light the torch. It flares to life, casting dancing shadows on the walls.");
                updateInventoryDisplay();
                // Re-render room if it was dark and its description depends on light
                if (player.currentRoom === 'antechamber') renderRoom();
            }
        }
    },
    key: {
        id: 'key',
        name: 'Iron Key',
        description: 'A heavy, ornate iron key. It looks ancient.',
        takeable: true,
        onUse: function() {
            const room = rooms[player.currentRoom];
            if (room.locked && room.locked.north && room.locked.north.isLocked && room.locked.north.key === 'key') {
                room.locked.north.isLocked = false;
                addTextToDisplay("You insert the heavy iron key into the lock. With a loud *clunk*, the mechanism turns and the door is unlocked.");
            } else {
                addTextToDisplay("There's nothing to use the key on here.");
            }
        }
    },
    book: {
        id: 'book',
        name: 'Dusty Tome',
        description: 'A large, leather-bound book covered in a thick layer of dust. The title is illegible.',
        takeable: true,
        content: "The inscription reads: 'Speak the word of light to banish the shadows, and the path shall be revealed.'"
    },
    amulet: {
        id: 'amulet',
        name: 'Amulet of Whispers',
        description: 'A beautiful silver amulet that seems to hum with a faint energy. You feel a strange sense of clarity holding it.',
        takeable: true,
        onTake: function() {
            addTextToDisplay("<strong class='text-yellow-300'>Congratulations! You have found the Amulet of Whispers! You feel its power coursing through you. You have won the game!</strong>");
            commandInput.disabled = true;
        }
    }
};

const rooms = {
    entrance: {
        name: 'Crypt Entrance',
        description: () => {
            return 'You stand at the entrance to a dark crypt, carved into the side of a windswept hill. A heavy stone door hangs slightly ajar, leading into darkness. The air is cold and smells of damp earth and decay. A discarded, unlit torch lies on the ground near your feet.';
        },
        exits: { north: 'antechamber' },
        items: [items.torch]
    },
    antechamber: {
        name: 'Antechamber',
        description: function() { // Use `function` to get access to `this`
            if (player.inventory.some(i => i.id === 'torch' && i.lit)) {
                let desc = 'The flickering light of your torch illuminates a small, square room. The walls are lined with empty stone shelves. Dust motes dance in the torchlight. In the center of the room is a stone pedestal. ';
                // Check if the key is in this room's item list
                if (this.items.some(i => i.id === 'key')) {
                    desc += 'Resting on the pedestal is a heavy <strong>Iron Key</strong>. ';
                }
                desc += 'There is a grand, iron-bound door to the north, and the entrance you came from is to the south.';
                return desc;
            } else {
                return 'You are in a pitch-black room. You cannot see a thing. A chilling draft blows from somewhere in the darkness. It might be a good idea to find some light.';
            }
        },
        exits: { south: 'entrance', north: 'hall' },
        items: [items.key], // The key starts here now
        locked: {
            north: {
                isLocked: true,
                key: 'key',
                message: 'The massive door is locked with a heavy iron mechanism.'
            }
        },
        specialAction: (verb, noun) => {
            if (verb === 'look' && noun.includes('door')) {
                if (rooms.antechamber.locked && rooms.antechamber.locked.north.isLocked) {
                    addTextToDisplay("The grand, iron-bound door to the north is locked with a heavy iron mechanism.");
                } else {
                    addTextToDisplay("The grand, iron-bound door to the north stands open.");
                }
                return true; // Action was handled
            }
            return false;
        }
    },
    hall: {
        name: 'Hall of Echoes',
        description: () => {
            return 'You enter a long, narrow hall. The walls are carved with faded reliefs of forgotten kings. Your footsteps echo unnervingly. To the west is a small, doorless chamber that looks like a study. To the east, a passage is blocked by a rockfall. The hall continues to the north.';
        },
        exits: { south: 'antechamber', west: 'study', north: 'shadow_chamber' },
        items: []
    },
    study: {
        name: 'Dusty Study',
        description: () => {
            return 'This small chamber was clearly a study or library. Rotting shelves line the walls, and the remains of scrolls are scattered on the floor. A single, sturdy lectern stands in the corner, holding a large, dusty tome.';
        },
        exits: { east: 'hall' },
        items: [items.book]
    },

    shadow_chamber: {
        name: 'Shadow Chamber',
        description: function() {
            if (this.chasmBridged) {
                return "A shimmering bridge of energy now spans the chasm, banishing the magical darkness. The way north to the altar is open. The inscription on the floor still glows faintly. The only way out is south or across the bridge to the north.";
            } else {
                return "You arrive in a circular chamber. In the center, a deep chasm is filled with an unnatural, magical darkness that seems to absorb the light from your torch. On the far side of the chasm, you can just make out a pedestal with something glinting on it. There's an inscription on the floor in front of you. The only way out is south.";
            }
        },
        exits: { south: 'hall' },
        items: [
            {
                name: "Inscription",
                description: "The inscription reads: <em>'Speak the word of light to banish the shadows, and the path shall be revealed.'</em>",
                takeable: false,
                content: "The inscription reads: <em>'Speak the word of light to banish the shadows, and the path shall be revealed.'</em>"
            }
        ],
        specialAction: (verb, noun) => {
            if (verb === 'say' && noun === 'light') {
                if (rooms.shadow_chamber.chasmBridged) {
                    addTextToDisplay("The word echoes, but nothing else happens.");
                    return true;
                }
                addTextToDisplay("As you speak the word 'light', the inscription on the floor glows brightly. A bridge of shimmering energy forms across the chasm! The magical darkness recedes.");
                rooms.shadow_chamber.exits.north = 'altar';
                rooms.shadow_chamber.chasmBridged = true;
                return true;
            }
            return false;
        },
        chasmBridged: false
    },
    altar: {
        name: 'Altar of the Amulet',
        description: function() {
            if (this.items.length > 0) {
                return 'You cross the magical bridge. On a simple stone altar rests the Amulet of Whispers. It glows with a soft, inviting light. The air here feels calm and peaceful.';
            }
            return 'You stand before the now-empty stone altar. With the Amulet in your possession, you feel a sense of completion. You should probably leave the way you came.';
        },
        exits: { south: 'shadow_chamber' },
        items: [items.amulet]
    },
};