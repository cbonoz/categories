# Category Game Alexa Skill 
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/fact/header._TTH_.png" />

## What does this app do? 
Category Game is a word game where you need to guess the category or theme that the words share.
* The app will give you three words, you need to guess the category that they share. 
The categories will be fairly broad, and will be one word, such as: metals, plants, or containers. 
I can repeat the category words at any time during the game, simply say 'repeat the words'.

## Ok, so how do I interact with Category Game? 

<b>HOW TO PLAY:</b>

* You: "Alexa, open category game"
* Alexa: "Welcome...do you want to play a game?"
* You: "Yes"
* Alexa: "Here are your words: covey, grouse, jackdaw
* You: "are these cities?"
* Alexa: "cities is not it. The category starts with the letter b. Try guessing another category."
* You: "repeat the words"
* Alexa: "Here are the words again: covey, grouse, jackdaw. Try guessing another category"
* You: "birds"
* Alexa: "birds is exactly right! in only 2 guesses ...Would you like to play again?

And so on...

If you're very close to the target word, but not an exact match, I may also give it to you.


### Dev Notes

Installing App Dependencies:
```
cd src/ 
npm install
```
Prepare for aws submission (run zip command from /src): 
```
 zip -r -X ../src.zip *
```
