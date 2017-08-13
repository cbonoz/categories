'use strict';
const Alexa = require('alexa-sdk');

// local libraries.
const categories = require('./categories');

//=========================================================================================================================================
// Constants and variable declarations.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
const APP_ID = 'amzn1.ask.skill.53372c18-be27-4a0a-b4ff-7ed7687ba667';

const APP_NAME = 'Category Game';
const WELCOME_TEXT = `Welcome to the ${APP_NAME}. `;
const HELP_TEXT = "I will think of a one or two word category, I will give you three words in that category " +
    "and you have to try to guess it. Say 'hint' at any time for a hint, or 'repeat the words' for me to say the words again." +
    " Do you want to start? ";
const CATEGORY_AND_WORDS_PROMPT = "Try guessing a category, or say 'repeat the words' for the words again. ";
const CATEGORY_PROMPT = "Try guessing another category. ";
const NEW_GAME_PROMPT = "Would would like to play again?";
const EXIT_TEXT = "Goodbye!";

//=========================================================================================================================================
// Skill logic below
//=========================================================================================================================================

const states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

const newSessionHandlers = {
    'NewSession': function () {
        if (Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
            this.attributes['gamesWon'] = 0;
        }
        this.handler.state = states.STARTMODE;
        const winText = this.attributes['gamesPlayed'] > 0 ?
            `You have played ${this.attributes['gamesPlayed']} times and have ${this.attributes['gamesWon']} wins.` :
            '';

        this.emit(':ask', WELCOME_TEXT + winText + ` Would you like to play? Say yes to start the game or no to quit.`);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', EXIT_TEXT);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', EXIT_TEXT);
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", EXIT_TEXT);
    }
};

const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_TEXT, HELP_TEXT);
    },
    'AMAZON.YesIntent': function () {
        this.attributes["category"] = categories.getRandomCategory();
        this.attributes["categoryWords"] = categories.getRandomWordsForCategory(this.attributes["category"], 3);
        this.handler.state = states.GUESSMODE;
        this.attributes['guessTries'] = 0;
        const wordString = categories.joinCategoryWords(this.attributes['categoryWords']);
        this.emit(':ask',
            `Listen Carefully: Here are your category words: ${wordString}. Try guessing a category`,
            CATEGORY_AND_WORDS_PROMPT);
    },
    'AMAZON.NoIntent': function () {
        this.attributes["category"] = null;
        this.emit(':tell', 'Ok, see you next time!');
    },
    "AMAZON.StopIntent": function () {
        console.log("STOPINTENT");
        this.emit(':tell', EXIT_TEXT);
    },
    "AMAZON.CancelIntent": function () {
        console.log("CANCELINTENT");
        this.emit(':tell', EXIT_TEXT);
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', EXIT_TEXT);
    },
    'Unhandled': function () {
        console.log("UNHANDLED");
        const message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

const guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'WordsIntent': function () {
        const wordString = categories.joinCategoryWords(this.attributes['categoryWords']);
        const message = `Category words: ${wordString}`;
        this.emit(':ask', message + CATEGORY_PROMPT, CATEGORY_PROMPT)
    },
    'CategoryGuessIntent': function () {
        const self = this;
        const guessCategory = this.event.request.intent.slots.Category.value;
        const targetCategory = this.attributes["category"];
        console.log('user guessed: ' + guessCategory);

        if (guessCategory.toLowerCase() === 'repeat the words') {
            this.emit('WordsIntent');
        }

        const similarity = categories.getSimilarity(guessCategory, targetCategory);

        if (similarity >= categories.SIMILARITY_THRESHOLD) {
            // With a callback, use the arrow function to preserve the correct 'this' context
            this.emit('Correct', () => {
                if (similarity === 1.0) {
                    this.emit(':ask',
                        `${guessCategory} is right! in only ${self.attributes['guessTries']} guesses. ${NEW_GAME_PROMPT}`);
                } else {
                    this.emit(':ask',
                        `${guessCategory}, hmm, I'll give it to you. The precise category is ${targetCategory}` +
                        `It took you ${self.attributes['guessTries']} guesses. ${NEW_GAME_PROMPT}`);
                }
            });
        }
        this.emit('Incorrect', guessCategory);

    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_TEXT, CATEGORY_AND_WORDS_PROMPT);
    },
    "AMAZON.StopIntent": function () {
        console.log("STOPINTENT");
        this.emit(':tell', EXIT_TEXT);
    },
    "AMAZON.CancelIntent": function () {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', EXIT_TEXT);
    },
    'Unhandled': function () {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. ' + CATEGORY_PROMPT, CATEGORY_AND_WORDS_PROMPT);
    }
});

// These handlers are not bound to a state
const guessAttemptHandlers = {
    'Incorrect': function (val) {
        const hint = categories.getHintForCategory(this.attributes["category"]);
        const message = `${val} is not it. ${hint} ${CATEGORY_PROMPT}`;
        this.attributes['guessTries']++;
        this.emit(':ask', message, CATEGORY_AND_WORDS_PROMPT);
    },
    'Correct': function (callback) {
        this.handler.state = states.STARTMODE;
        this.attributes['gamesPlayed']++;
        this.attributes['gamesWon']++;
        callback();
    },
    'Unhandled': function () {
        this.emit(':ask', 'Sorry, I didn\'t get that.' + CATEGORY_PROMPT, CATEGORY_AND_WORDS_PROMPT);
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, guessAttemptHandlers);
    alexa.execute();
};