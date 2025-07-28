// Adventureland - Fully Wired Map for The Whispering Crypt Engine
// Based on Scott Adams' 1978 classic

const gameTitle = "Whispering Crypt: An Adventureland Tale";
 
const gameIntro = `
<strong class='text-yellow-300'>An Adventureland Tale!</strong>
Adapted for the Whispering Crypt Engine
Step into a reimagined version of the classic 1978 text adventure by Scott Adams. In this tale, you'll explore an enchanted world in search of thirteen lost treasures.
Beware—this is no ordinary journey. The land is filled with wild creatures, magical beings, and perilous traps.
Use your wits, gather items, and solve puzzles to uncover the secrets of Adventureland
Happy adventuring... and tread carefully.<br>
<span class='text-gray-400'>(Type 'goal' or 'score' at any time to check your progress.)</span>
`;
 
const gameGoal = "Your goal is to find all 5 treasures of Adventureland.";
 
const startingRoom = "room1";

const treasures = ['coins', 'statue', 'chest', 'trident', 'fruit'];

function checkForWin() {
    const foundTreasures = player.inventory.filter(i => treasures.includes(i.id)).length;
    if (foundTreasures === treasures.length) {
        addTextToDisplay("<strong class='text-yellow-300'>Congratulations! You have collected all the treasures and won the game!</strong>");
        commandInput.disabled = true;
    }
}

const items = {
  lamp: {
    id: "lamp",
    name: "Brass Lantern",
    description: "A slightly battered brass lantern. It might still work.",
    takeable: true,
    lit: false,
    onUse: function (item) {
      if (item.lit) {
        addTextToDisplay("The lantern is already lit.");
      } else {
        item.lit = true;
        item.name = "Lit Lantern";
        item.description = "The lantern glows warmly, pushing back the shadows.";
        addTextToDisplay("You light the lantern. Dim light fills the space around you.");
        // Re-render the room to update its description if it was dark
        renderRoom();
        updateInventoryDisplay();
      }
    },
  },
  axe: {
    id: "axe",
    name: "Woodman’s Axe",
    description: "A heavy axe with a solid wooden handle.",
    takeable: true,
    onTake: function() {
        // This is a normal item, not a treasure, so no win check.
        return;
    }
  },
  coins: {
    id: "coins",
    name: "Pile of Gold Coins",
    description: "Ancient gold coins from a forgotten kingdom.",
    takeable: true,
    onTake: checkForWin,
  },
  statue: {
    id: "statue",
    name: "Jeweled Statue",
    description: "A small but elaborate statue studded with rubies and emeralds.",
    takeable: true,
    onTake: checkForWin,
  },
  chest: {
    id: "chest",
    name: "Treasure Chest",
    description: "An ancient chest, its lid slightly ajar and filled with glittering gems.",
    takeable: true,
    onTake: checkForWin,
  },
  trident: {
    id: "trident",
    name: "Golden Trident",
    description: "A heavy golden trident engraved with ancient runes.",
    takeable: true,
    onTake: checkForWin,
  },
  food: {
    id: "food",
    name: "Package of Food",
    description: "A small parcel of dried food. Might come in handy.",
    takeable: true,
  },
  bottle: {
    id: "bottle",
    name: "Glass Bottle",
    description: "A stoppered bottle filled with clear liquid.",
    takeable: true,
    onUse: function(item) {
        const room = rooms[player.currentRoom];
        if (room.id === 'room28' && item.name.includes("clear liquid")) {
            item.name = "Bottle of Water";
            item.description = "The bottle is now filled with cool, clear water from the well.";
            addTextToDisplay("You lower the bottle into the well and pull it up, filled with water.");
            updateInventoryDisplay();
        } else if (item.name.includes("Water")) {
            addTextToDisplay("You take a refreshing drink from the bottle.");
        } else {
            addTextToDisplay("There's nothing to use the bottle on here.");
        }
    }
  },
  dragon: {
    id: "dragon",
    name: "Sleeping Dragon",
    description: "A large dragon slumbers here, covering a hoard of treasure.",
    takeable: false,
    onUse: function () {
      addTextToDisplay("You cannot take or easily defeat the dragon...");
    }
  },
  fruit: {
    id: "fruit",
    name: "Jeweled Fruit",
    description: "A piece of fruit made entirely of sparkling jewels. It looks delicious, but probably isn't.",
    takeable: true,
    onTake: checkForWin,
  },
  glyphs: {
    id: "glyphs",
    name: "Faint Glyphs",
    description: "Faint, shimmering glyphs are inscribed on the wall where the wizard vanished.",
    takeable: false,
    content: "The glyphs seem to shift and writhe. You can just make out a single word: 'PLUGH'."
  }
};

const rooms = {
  room1: {
    name: "Forest Edge",
    description: () => "You're at the edge of a forest. Paths lead north and east.",
    exits: { north: "room2", east: "room5" },
    items: []
  },
  room2: {
    name: "Forest",
    description: () => "You are deep in the forest. It's quiet... too quiet.",
    exits: { south: "room1", north: "room3" },
    items: []
  },
  room3: {
    name: "End of Road",
    treeCut: false, // State for our puzzle
    description: function() {
        if (this.treeCut) {
            return "You are at the end of a dusty road. Where a giant tree once stood, there is now only a large stump. It looks like you could climb down into it. A path leads south.";
        } else {
            return "You’ve come to the end of a dusty road. A giant, gnarled tree with low-hanging branches stands here. It looks climbable. A path leads south.";
        }
    },
    exits: { south: "room2" }, // The only way 'up' is to climb.
    items: [],
    specialAction: function(verb, noun) {
      // --- Logic for when the tree is NOT cut ---
      if (!this.treeCut) {
        if (verb === 'climb' && (noun === 'tree' || noun === 'branches')) {
          addTextToDisplay("You easily scale the gnarled tree...");
          player.currentRoom = 'room4';
          renderRoom();
          return true;
        }
        if ((verb === 'cut' || verb === 'chop') && noun.includes('tree')) {
          const hasAxe = player.inventory.some(i => i.id === 'axe');
          if (hasAxe) {
            addTextToDisplay("With a few mighty swings of your axe, the tree crashes to the ground! You are left with a large, hollow stump.");
            this.treeCut = true;
            renderRoom(); // Re-render to show new description
            return true;
          } else {
            addTextToDisplay("You'll need something sharp, like an axe, to cut down the tree.");
            return true;
          }
        }
      } 
      // --- Logic for when the tree IS cut ---
      else {
        if ((verb === 'climb' || verb === 'go') && (noun.includes('stump') || noun === 'down')) {
          addTextToDisplay("You climb down into the dark, hollow stump.");
          player.currentRoom = 'stump_interior';
          renderRoom();
          return true;
        }
      }
      return false;
    }
  },
  room4: {
    name: "Hilltop",
    description: () => "From atop the hill, you see a distant volcano. A path leads back down.",
    exits: { down: "room3", west: "room2" }, // Added a shortcut
    items: [items.lamp]
  },
  room5: {
    name: "Stone Building",
    description: () => "You enter a stone building. Stairs lead down.",
    exits: { west: "room1", down: "room6" },
    items: [items.food]
  },
  room6: {
    name: "Dark Room",
    description: () => player.inventory.some(i => i.id === "lamp" && i.lit)
      ? "You see exits west, east, and up a staircase."
      : "It’s pitch dark. You can’t see a thing.",
    exits: { west: "room7", east: "room8", up: "room5" },
    items: []
  },
  room7: {
    name: "Snake Room",
    description: () => "A huge snake hisses at you from the shadows.",
    exits: { east: "room6", west: "room8" }, // Let's connect it back for better flow
    items: [],
    specialAction: (verb, noun, item) => {
      if (verb === 'give' && item && item.id === 'food') {
        addTextToDisplay("You toss the food to the snake. It greedily devours it and slithers back into the shadows, revealing a path west.");
        player.inventory = player.inventory.filter(i => i.id !== 'food');
        updateInventoryDisplay();
        delete rooms.room7.specialAction; // Puzzle solved
        return true;
      }
      return false;
    }
  },
  room8: {
    name: "Canyon View",
    description: () => "You overlook a canyon. You can go down.",
    exits: { west: "room6", down: "room9" },
    items: []
  },
  room9: {
    name: "Canyon Floor",
    description: () => "You’re at the base of the canyon. A trail leads east.",
    exits: { up: "room8", east: "room10" },
    items: [items.bottle]
  },
  room10: {
    name: "Volcano Base",
    description: () => "You stand at the base of a volcano. You can climb up.",
    exits: { west: "room9", up: "room11" },
    items: []
  },
  room11: {
    name: "Volcano Slope",
    description: () => "The air grows hotter as you climb the slope.",
    exits: { down: "room10", up: "room12" },
    items: []
  },
  room12: {
    name: "Volcano Top",
    description: () => "You've reached the volcano summit. Lava bubbles below.",
    exits: { down: "room11", east: "room13" },
    items: [items.trident]
  },
  room13: {
    name: "Troll Bridge",
    description: () => "A troll demands treasure to pass east.",
    exits: { west: "room12" }, // East exit is initially blocked
    items: [],
    trollSatisfied: false,
    specialAction: function(verb, noun, item) {
      if (this.trollSatisfied) return false;

      if (verb === "give" && item && item.id === "coins") {
        addTextToDisplay("The troll snatches the coins and lets you pass.");
        // Remove coins from inventory
        player.inventory = player.inventory.filter(i => i.id !== 'coins');
        updateInventoryDisplay();
        this.exits.east = "room14"; // Open the path
        this.trollSatisfied = true;
        return true;
      }
      if (verb === 'go' && noun === 'east') { addTextToDisplay("The troll blocks your path!"); return true; }
      return false;
    }
  },
  room14: {
    name: "Wizards Room",
    description: () => "A wizard was here, but vanished in a puff of smoke, leaving behind faint glyphs on the wall.",
    exits: { west: "room13", east: "room15" },
    items: [items.glyphs]
  },
  room15: {
    name: "Dragons Lair",
    description: function() {
        if (this.items.some(i => i.id === 'dragon')) {
            return "A dragon sleeps on a hoard of treasure.";
        } else {
            return "The dragon is gone, leaving its hoard unguarded.";
        }
    },
    exits: { west: "room14", east: "room16" },
    items: [items.dragon, items.statue],
    canTakeItemCheck: function(itemToTake) {
      // Check if the dragon is still in the room
      const dragonPresent = this.items.some(i => i.id === 'dragon');
      if (itemToTake.id === 'statue' && dragonPresent) {
        addTextToDisplay("You try to sneak past the dragon, but it stirs in its sleep. You'd better not risk it.");
        return false; // Prevent taking
      }
      return true; // Allow taking
    },
    specialAction: function(verb, noun) {
        if (verb === 'say' && noun === 'plugh') {
            const dragonIndex = this.items.findIndex(i => i.id === 'dragon');
            if (dragonIndex !== -1) {
                addTextToDisplay("You utter the magic word. The sleeping dragon shimmers and vanishes in a puff of logic! The treasure is now unguarded.");
                this.items.splice(dragonIndex, 1); // Remove the dragon
                delete this.specialAction; // Puzzle solved, remove the action
                renderRoom(); // Re-render to show the new description and item list
                return true; // Action handled
            }
        }
        return false;
    }
  },
  room16: {
    name: "Treasure Room",
    description: () => "A golden chest lies in the center.",
    exits: { west: "room15" },
    items: [items.chest]
  },
  room17: {
    name: "Dusty Hallway",
    description: () => "A narrow hall stretches ahead. A heavy woodman's axe is propped against the wall.",
    exits: { north: "room16", south: "room18" },
    items: [items.axe]
  },
  room18: { name: "Underground Pool", description: () => "Still water glows with an eerie light.", exits: { north: "room17", east: "room19" }, items: [] },
  room19: { name: "Crystal Cavern", description: () => "Crystals refract light around you.", exits: { west: "room18", east: "room20" }, items: [] },
  // --- THE MAZE ---
  // A simple but confusing maze. The trick is to find the one exit that leads out.
  room20: { id: "room20", name: "Maze Entry", description: () => "You stand at the maze entrance. Passages twist in every direction.", exits: { west: "room19", north: "room21", south: "room22", east: "room23" }, items: [] },
  room21: { id: "room21", name: "Maze of Twisting Passages", description: () => "All alike, these passages.", exits: { south: "room20", east: "room24" }, items: [] },
  room22: { id: "room22", name: "Maze of Twisting Passages", description: () => "You feel like you're going in circles.", exits: { north: "room20", west: "room25" }, items: [] },
  room23: { id: "room23", name: "Maze of Twisting Passages", description: () => "Dead end. Or is it?", exits: { west: "room20", north: "room26" }, items: [] },
  room24: { id: "room24", name: "Maze of Twisting Passages", description: () => "This looks familiar...", exits: { west: "room21", south: "room25" }, items: [] },
  room25: { id: "room25", name: "Maze of Twisting Passages", description: () => "A faint breeze comes from the east.", exits: { north: "room24", east: "room22" }, items: [] },
  room26: { id: "room26", name: "Maze of Twisting Passages", description: () => "A glimmer of light to the east!", exits: { south: "room23", east: "room27" }, items: [] },
  // --- END OF MAZE ---
  room27: {
    id: "room27",
    name: "Secret Chamber",
    description: () => "You found a hidden room! The air is cool and still.",
    exits: { west: "room26", east: "room28" },
    items: []
  },
  room28: {
    id: "room28",
    name: "Wishing Well",
    description: () => "A stone well sits in the center of the room. The water within looks cool and clear.",
    exits: { west: "room27", east: "room29" },
    items: []
  },
  room29: { name: "Magic Garden", description: () => "Bioluminescent plants line the walls. A strange, jeweled fruit hangs from one of them.", exits: { east: "room30", west: "room28" }, items: [items.fruit] },
  room30: { name: "Final Exit", description: () => "You stand before the final portal.", exits: { west: "room29" }, items: [] },
  
  stump_interior: {
    name: "Inside the Stump",
    description: () => "It's damp and earthy inside the hollow stump. In the dirt, you see a pile of glittering gold coins. The only way out is up.",
    exits: { up: "room3" },
    items: [items.coins]
  }
};
