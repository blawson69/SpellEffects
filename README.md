# SpellEffects
This [Roll20](http://roll20.net/) script allows GMs to provide players an easy way to show spell effects graphically in the VTT. This includes Areas of Effect such as Darkness or Fog Cloud as well as magical conjurations like Flaming Sphere and Mage Hand. You can allow the players access to all of the effects, or you can restrict the list to those spells the player has access to through characters they control (currently [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) only).

When an Effect is generated, it is moved underneath all of the tokens on the layer so all of the affected characters/NPCs are easily seen and selected. The Effect token can be moved and rotated freely on the VTT, and will reposition to be snapped to the grid when necessary.

## Spell Targets
A "target" token is required to be selected to generate spell effects. To give players access to the effects, the GM can configure any graphic they wish to use into a Spell Target character and assign one or more players control of that character. You may create one for each player character, or make a shared target depending on your needs. The Spell Target will have a token action that whispers the Effects Menu in chat to the player controlling it.

To create a Spell Target, just drag a token you wish to use onto the VTT from your library. Then click the "Create Target Character" button in the [config menu](#config). Once the character is created, assign players to it based on who should have access. Rename it however you wish.

## Creating Effects
Creating a spell Effect is simple.
- Drag a graphic to the VTT that represents the area of Effect for a spell.
- Resize the graphic to the dimensions it needs to be for the Effect.
- Edit the graphic and name it for the spell it represents.
   - If you wish to [restrict access](#config) to known spells, the exact spell name must exist in the name.
   - If you make multiple sizes or options for a spell, put the option designation after the spell name to keep all options together. For instance, "Fog Cloud (20ft)" and "Fog Cloud (40ft)".
   - If you wish to make an effect available to all players with the restricted access option on, include "[@]" in the name. At the end is recommended placement if you wish to maintain alphabetical ordering.
- Make sure the graphic is selected and click the "Create Effect" button in the Effects Menu.

Created effects can be deleted from the Effects Menu by the GM, and existing effects will be overwritten by creating a new Effect of the same name.

In accordance with Roll20's API rules ([https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions](https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions)), you can *only* use images that you have uploaded to your library. If you have purchased any through the Marketplace, you must first download them, then upload to your library.

## Config
From the config menu, you can easily create [Spell Targets](#spell-targets) and access the Effects Menu. Enter `!aoe config` in chat to open up config.

For games using the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped), you can also choose to restrict player access to only those effects that correspond to spells they have in their character sheets. The config menu has a link to toggle this feature on and off. The script *does not* try to detect the type of character sheets being used.

You can also export your Effects into a handout for use in another game, and import effects copied from another game into the current one. To export, simply click the "Export Effects" button. This will create a handout named "SpellEffects" which can be copied via the Transmogrifier into another game. To import an existing "SpellEffects" handout, click the "Import Effects" button.
