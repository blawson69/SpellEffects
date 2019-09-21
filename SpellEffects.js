/*
SpellEffects
A Roll20 script to provide players with AoE graphics based on a character's available spells

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script?
Venmo: https://venmo.com/theRealBenLawson
Paypal: https://www.paypal.me/theRealBenLawson
*/

var SpellEffects = SpellEffects || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.3',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: #8e1ca8; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #8e1ca8; text-decoration: underline;',
        spellLink: 'background-color: transparent; border: none; padding: 0; font-size: 1.125em; font-weight: bold; color: #000; text-decoration: none;',
        imgLink: 'background-color: transparent; border: none; padding: 0; text-decoration: none;',
        buttonWrapper: 'text-align: center; margin-top: 10px; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },

    checkInstall = function () {
        if (!_.has(state, 'SpellEffects')) state['SpellEffects'] = state['SpellEffects'] || {};
        if (typeof state['SpellEffects'].effects == 'undefined') state['SpellEffects'].effects = [];
        if (typeof state['SpellEffects'].enfoceKnownSpells == 'undefined') state['SpellEffects'].enfoceKnownSpells = false;
        log('--> SpellEffects v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'SpellEffects v' + version + ' loaded at ' + d.toLocaleTimeString(), 'GM');
		}
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!aoe')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1]) {
				switch (parms[1]) {
					case 'generate':
						commandGenerate(msg);
						break;
					case 'menu':
						commandMenu(msg);
						break;
					case 'config':
						if (playerIsGM(msg.playerid)) {
							commandConfig(msg);
						}
						break;
					case 'create':
						if (playerIsGM(msg.playerid)) {
							commandCreate(msg);
						}
						break;
					case 'target':
						if (playerIsGM(msg.playerid)) {
							commandTarget(msg);
						}
						break;
					case 'destroy':
						if (playerIsGM(msg.playerid)) {
							commandDestroy(msg);
						}
						break;
					case 'import':
						if (playerIsGM(msg.playerid)) {
							commandImport(msg);
						}
						break;
					case 'export':
						if (playerIsGM(msg.playerid)) {
							commandExport(msg);
						}
						break;
                    default:
                        commandHelp(msg);
				}
			} else {
				commandHelp(msg);
			}
		}
    },

    commandCreate = function (msg) {
		// Add a spell graphic to the collection
		if (!msg.selected || msg.selected.length != 1) {
			showDialog('Creation Error', 'The incorrect number of tokens are selected!', 'GM');
			return;
		}

        var token = getObj(msg.selected[0]._type, msg.selected[0]._id), spell = {};
        if (token && isValidSrc(token.get('imgsrc'))) {
            spell.name = token.get('name');
            spell.imgsrc = token.get('imgsrc').replace(/\w+\.png/, 'thumb.png');
            spell.width = token.get('width');
            spell.height = token.get('height');
            if (spell.name != '') {
                // Overwrite any existing spell effect first
                state['SpellEffects'].effects = _.reject(state['SpellEffects'].effects, function (x) { return x.name == spell.name; });
                state['SpellEffects'].effects.push(spell);
                showDialog('Creation Complete', 'Spell AoE Effect for "' + spell.name + '" has been successfully created.', 'GM');
                commandMenu(msg);
            } else {
                showDialog('Creation Error', 'A name was not set on the selected token!', 'GM');
            }
        } else {
            showDialog('Creation Error', 'Invalid token! You may only use graphics you have uploaded to your library. For more information, view the <a style="' + styles.textButton + '" href="https://github.com/blawson69/SpellEffects">documentation</a>.', 'GM');
        }
	},

    commandGenerate = function (msg) {
        if (!msg.selected || msg.selected.length != 1) {
			showDialog('Generation Error', 'You must have one token are selected!', msg.who);
			return;
		}

        var args = msg.content.split(/\s*\-\-/i), spell_name, spell;
        var page = getObj('page', Campaign().get("playerpageid"));
        var cell_width = page.get('snapping_increment') * 70;
        var target = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (args[1] && target) {
            spell_name = args[1].trim();
            spell = _.find(state['SpellEffects'].effects, function (x) { return x.name == spell_name; });
            if (spell) {
                var top = target.get('top');
                if ((top % cell_width == 0) !== (spell.height % (cell_width * 2) == 0)) top = top + (cell_width / 2);
                var left = target.get('left');
                if ((left % cell_width == 0) !== (spell.width % (cell_width * 2) == 0)) left = left + (cell_width / 2);

                toBack(target);
                target.set({imgsrc: spell.imgsrc, width: spell.width, height: spell.height, top: top, left: left, rotation: 0, showname: false, showplayers_name: false, showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, aura1_radius: '', aura2_radius: '', showplayers_aura1: false, showplayers_aura2: false, light_radius: '', light_dimradius: '', light_hassight: false, light_otherplayers: false, tint_color: 'transparent', statusmarkers: ''});
            } else {
                showDialog('Generation Error', 'No Spell AoE Effect named "' + spell_name + '" has been created!', msg.who);
            }
        } else {
            var errs = [];
            if (!args[1]) errs.push('No spell name was provided.');
            if (!target) errs.push('Token invalid.');
            showDialog('Generation Error', 'The following errors were encountered:<ul>' + errs.join(', ') + '</ul>', msg.who);
        }
    },

    commandDestroy = function (msg) {
        var args = msg.content.split(/\s*\-\-/i);
        if (args[1] && args[1] != '') {
            state['SpellEffects'].effects = _.reject(state['SpellEffects'].effects, function (x) { return x.name == args[1]; });
            showDialog('Destruction Complete', 'Spell AoE Effect for "' + args[1] + '" has been successfully destroyed.', 'GM');
            commandMenu(msg);
        }
    },

    commandMenu = function (msg) {
        var spells = [], message = '', avail_spells = _.sortBy(state['SpellEffects'].effects, 'name');;

        if (state['SpellEffects'].enfoceKnownSpells && !playerIsGM(msg.playerid)) {
            var known_spells = getSpells(msg.playerid);
            avail_spells = _.reject(state['SpellEffects'].effects, function (effect) {
                return _.find(known_spells, function (x) { return effect.name.search(x) != -1; }) == null;
            });
        }

        if (_.size(avail_spells) > 0) {
            message += '<table width="100%">';
            _.each(avail_spells, function (spell) {
                var spell_name = playerIsGM(msg.playerid) ? spell.name : spell.name.replace(/\s*\[@\]\s*/, '');
                message += '<tr><td width="100%"><a style="' + styles.spellLink + '" href="!aoe generate --' + spell.name + '">' + spell_name + '</a></td>';
                if (playerIsGM(msg.playerid)) message += '<td><a style="' + styles.imgLink + '" href="!aoe destroy --' + spell.name + '" title="Destroy ' + spell.name + '">❌</a></td>';
                message += '</tr>';
            });
            message += '</table>';
        } else {
            message += (playerIsGM(msg.playerid)) ? '' : 'No spell effects available.';
        }

        if (playerIsGM(msg.playerid)) {
            if (_.size(state['SpellEffects'].effects) > 0) message += '<hr>';
            message += 'To create a new effect, drag a graphic onto the VTT and size it appropriately. Name the token by the spell effect you wish to create, then click "Create Effect".';
            if (state['SpellEffects'].enfoceKnownSpells) message += ' Append <span style=\'' + styles.code + '\'>~~</span> to the name anywhere to indicate an effect seen by all players.';
            message += '<br><br>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/SpellEffects">documentation</a> for complete instructions.';
            message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + 'background-color: #8e1ca8;" href="!aoe create">Create Effect</a></div>';
        }

        showDialog('Spell Effects', message, msg.who);
    },

    commandHelp = function (msg) {
        // Show help dialog
        var title, message = '';
        if (playerIsGM(msg.playerid)) {
            title = 'Help';
            message += 'To see a menu with all available spell effects, click the button below. To generate an effect, select a Spell Target then click the name of the spell in the Effects Menu for which you wish to generate an area of effect.';
            message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!aoe menu">Show Effects Menu</a></div>';
            message += '<hr>To set options, create Spell Target characters, or import/export saved effects, visit the config menu.';
            message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!aoe config">Show Config</a></div>';
        } else {
            title = 'Welcome to SpellEffects!';
            message += 'To generate the area of effect for a spell:<br><br><ol>';
            message += '<li><b>Move</b> your Spell Target to where the point of origin for your spell should be.<ul>';
            message += '<li>If your spell is the <b>"centered on you"</b> or <b>"from you"</b> type, place the Spell Target over the token of your character casting the spell.</li>';
            message += '<li>If your spell is the <b>"target and each creature within x feet"</b> type, place the Spell Target over the token you targeted with your spell.</li>';
            message += '<li>If your spell is the <b>"point of your choice"</b> type, place it in any cell within range. The bottom right corner of your Spell Target is dead-center of the Area of Effect.</li></ul></li>';
            message += '<li>Make sure your Spell Target is <b>still selected</b>.</li>';
            message += '<li><b>Click the <i>Effects Menu</i> button</b> in the Token Actions bar. This displays all of your available spell effects by spell name.</li>';
            message += '<li><b>Click the name of the spell</b> for which you wish to generate an effect.</li>';
            message += '</ol>';

        }

        showDialog(title, message, msg.who);
    },

    commandConfig = function (msg) {
        // Show config dialog
        var message = '', args = msg.content.split(/\s+/i);
        if (args[2] && args[2] == '--restrict-spells') state['SpellEffects'].enfoceKnownSpells = !state['SpellEffects'].enfoceKnownSpells;

        if (_.size(state['SpellEffects'].effects) > 0) {
            message += 'You currently have <b>' + _.size(state['SpellEffects'].effects) + ' spell effects</b> stored. Open the <a style="' + styles.textButton + '" href="!aoe menu">menu</a> to view or delete any of them. Creating a new one with the same name will overwrite any existing effects.<br>';
        } else {
            message += 'You have not created any spell effects yet! Open the <a style="' + styles.textButton + '" href="!aoe menu">menu</a> to view a button for creating effects. Creating a new one with the same name will overwrite any existing effects.<br>';
        }

        message += '<hr><div style=\'' + styles.title + '\'>Enforcement of Known Spells: ' + (state['SpellEffects'].enfoceKnownSpells ? 'On' : 'Off') + '</div>';
        if (state['SpellEffects'].enfoceKnownSpells) {
            message += 'You are currently letting players see only those effects that match spells they have on characters they control. If you wish to allow them to access the entire list of effects,  <a style="' + styles.textButton + '" href="!aoe config --restrict-spells">click here</a>.<br>';
        } else {
            message += 'You are currently letting players see all effects. If you wish to limit the effects a player sees to those that correspond to a spell on a character they control, <a style="' + styles.textButton + '" href="!aoe config --restrict-spells">click here</a>.<br><i><b>Note:</b> This currently works only for characters using the 5e Shaped Sheet.</i><br>';
        }

        message += '<hr><div style=\'' + styles.title + '\'>Spell Targets</div>';
        message += 'You may create a Spell Target character, allowing one or more players to simply drag a target onto the VTT.<ol>';
        message += '<li>Place a graphic on the Token layer.</li>';
        message += '<li>Set the token Name to "SpellEffects".</li>';
        message += '<li>With the token selected, click the button below.</li>';
        message += '<li>Rename your new character to reflect who will be in control if desired.</li>';
        message += '<li>Assign the character to the appropriate player(s).</li>';
        message += '</ol>';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + 'background-color: #8e1ca8;" href="!aoe target">Create Spell Target</a></div>';

        message += '<hr><div style=\'' + styles.title + '\'>Import/Export</div>';
        message += 'To bring your spell effects from this game into another, you may export your saved effects into a SpellEffects handout which can then be transferred to another game.';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + 'background-color: #8e1ca8;" href="!aoe export">Export Effects</a></div><br>';
        message += 'To import effects into this game, make sure there exists a SpellEffects handout in the proper format.';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + 'background-color: #8e1ca8;" href="!aoe import">Import Effects</a></div>';

        message += '<hr>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/SpellEffects">documentation</a> for complete instructions.';
        showDialog('', message, 'GM');
    },

    commandExport = function () {
        var parsedData, seNote = findObjs({name: 'SpellEffects', type: 'handout'})[0];
        if (!seNote) seNote = createObj("handout", {name: 'SpellEffects'});
        if (seNote) {
            parsedData = '';
            _.each(state['SpellEffects'].effects, function (item) {
                parsedData += '<p>' + item.name + '|' + item.width + '|' + item.height + '|' + item.imgsrc + '</p>';
            });
            seNote.set({ notes: parsedData });
            if (debugMode) log('SpellEffects have exported successfully.');
            showDialog('Export Successful', 'Your saved SpellEffects effects have been successfully exported.', 'GM');
        }
    },

    commandImport = function (msg) {
        var errs = [], message = '', args = msg.content.split(/\s*\-\-/i);
        var count = 0, overwrite = false, seNote = findObjs({name: 'SpellEffects', type: 'handout'})[0];
        if (args[1] && args[1] == 'overwrite') overwrite = true;

        if (seNote) {
            seNote.get('notes', function (notes) {
                var spells = decodeEditorText(notes, {asArray:true});
                _.each(spells, function (item) {
                    var spell, s = item.split('|');
                    if (s.length == 6) {
                        if (overwrite) state['SpellEffects'].effects = _.reject(state['SpellEffects'].effects, function (x) { return x.name == s[0]; });
                        if (!_.find(state['SpellEffects'].effects, function (x) { return x.name == s[0]; })) {
                            if (s[0] != '' && isNum(s[1]) && isNum(s[2]) && isNum(s[3]) && isNum(s[4]) && isValidSrc(s[5])) {
                                state['SpellEffects'].effects.push({name: s[0].trim(), width: Number(s[1]), height: Number(s[2]), top: Number(s[3]), left: Number(s[4]), imgsrc: s[5].trim()});
                                count++;
                            } else {
                                if (!isValidSrc(s[5])) errs.push('One or more image URLs reference items outside of your Roll20 library.');
                                if (!isNum(s[1]) || !isNum(s[2]) || !isNum(s[3]) || !isNum(s[4])) errs.push('One or more Numeric items either are not numbers or blank.');
                            }
                        }
                    } else {
                        errs.push('One or more items do not contain all of the required elements.');
                    }
                });

                message += (count == 0) ? 'No spell effects have been imported.' : count + ' spell effects have been imported.';
                errs = _.unique(errs);
                if (_.size(errs) > 0) {
                    message += '<br><br>The following errors were encountered:<ul><li>' + errs.join('</li><li>') + '</li></ul>';
                }

                showDialog('Import Results', message, 'GM');
            });
        } else {
            showDialog('Import Error', 'A handout named "SpellEffects" was not found. Nothing to import.', 'GM');
        }
    },

    commandTarget = function (msg) {
        if (!msg.selected || msg.selected.length != 1) {
			showDialog('Target Character Error', 'You must have one token selected!', 'GM');
			return;
		}

        var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (token && token.get('represents') == '') {
            var char = createObj("character", {name: 'Spell Target', avatar: token.get('imgsrc')});
            char.set({bio: '<p>I am a Target for creating Spell Effects.</p><p>Just drag me to the map, make sure I\'m selected, and click the "Effects Menu" token action button or "Help" for full instructions.</p>'});

            var ability = createObj("ability", { name: 'Effects Menu', characterid: char.get('id'), action: '!aoe menu', istokenaction: true });
            var ability = createObj("ability", { name: 'Help', characterid: char.get('id'), action: '!aoe help', istokenaction: true });
            token.set({represents: char.get('id'), showname: false, showplayers_name: false, showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, playersedit_bar1: false, playersedit_bar2: false, playersedit_bar3: false, light_radius: '', light_dimradius: '', light_hassight: false, light_otherplayers: false});
            setDefaultTokenForCharacter(char, token);

            showDialog('Target Character Created', 'A Spell Target character has been successfully created for the selected Target token.', 'GM');
        } else {
            showDialog('Target Character Error', 'Invalid token! Make sure your token does not represent a character. Try again.', 'GM');
        }
    },

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('SpellEffects', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('SpellEffects', body);
        }
    },

    showShapedDialog = function (title, content, character = '', silent = false) {
		// Outputs a 5e Shaped dialog box to players/characters
        var prefix = '', char_name = '';
        if (silent && character.length != 0) prefix = '/w "' + character + '" ';
        if (character.length != 0) char_name = ' {{show_character_name=1}} {{character_name=' + character + '}}';
        var message = prefix + '&{template:5e-shaped} {{title=' + title + '}} {{text_big=' + content + '}}' + char_name;
        sendChat('SpellEffects', message, null, {noarchive:true});
	},

    showShapedAdminDialog = function (title, content, character = '') {
		// Whispers a 5e Shaped dialog box to the GM
        if (character != '') character = ' {{show_character_name=1}} {{character_name=' + character + '}}';
        var message = '/w GM &{template:5e-shaped} {{title=' + title + '}} {{text_big=' + content + '}}' + character;
        sendChat('SpellEffects', message, null, {noarchive:true});
	},

    getSpells = function (player_id) {
        // returns an array of all spell names for a player's characters
        var spell_list = ['~~'], chars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
        chars = _.filter(chars, function (char) {
            var players = char.get('controlledby').split(',');
            return _.find(players, function (x) { return x == player_id; }) != null;
        });
        _.each(chars, function (char) {
            var char_id = char.get('id');
            var charAttrs = findObjs({type: 'attribute', characterid: char_id}, {caseInsensitive: true});
            var spells = _.filter(charAttrs, function (attr) { return (attr.get('name').match(/^repeating_spell(.+)_name$/) !== null); });
            _.each(spells, function (spell) { spell_list.push(spell.get('current')); });
        });
        return spell_list;
    },

    isValidSrc = function (url) {
        // Returns whether or not a given imgsrc is valid
        // Valid = https://s3.amazonaws.com/files.d20.io/images/90111752/GDBao8Z1IvYvrSSbtHEU1g/thumb.png?1566690793
        var ir = /^.*d20\.io\/images\/.*\/(thumb|med|original|max)\.png\?\d+$/;
        return ir.test(url);
    },

    isNum = function (txt) {
        // Returns whether or not a string is actually a Number
        var nr = /^\d+$/;
        return nr.test(txt);
    },

    decodeEditorText = function (t, o) {
        // Strips the editor encoding from GMNotes (thanks to The Aaron!)
        let w = t;
        o = Object.assign({ separator: '\r\n', asArray: false }, o);
        /* Token GM Notes */
        if (/^%3Cp%3E/.test(w)) {
            w = unescape(w);
        }
        if (/^<p>/.test(w)) {
            let lines = w.match(/<p>.*?<\/p>/g).map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
            return o.asArray ? lines : lines.join(o.separator);
        }
        /* neither */
        return t;
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    SpellEffects.checkInstall();
    SpellEffects.registerEventHandlers();
});
