const questions = require('./questions.json');
const { Random } = require('random-js');

const getRandomQuestion = (topic) => {
    const random = new Random();
    // const randomIndex = Math.floor(Math.random() * questions[questionTopic].length);
    let questionTopic = topic.toLowerCase();

    if(questionTopic === 'случайный вопрос') {
        questionTopic = Object.keys(questions)[random.integer(0, Object.keys(questions).length - 1)]
    }
    const randomIndex = random.integer(0, questions[questionTopic].length - 1);
    
    return {question: questions[questionTopic][randomIndex],
            questionTopic,};
}

const getAnswer = (type, id) => {
    const questionItem = questions[type.toLowerCase()].find((q) => q.id === id);
    if (!questionItem.hasOptions){ 
        return questionItem.answer;
    } else {
        return questionItem.options.find((q) => q.isCorrect).text;
    }
}

module.exports = {getRandomQuestion, getAnswer};