require('dotenv').config();
const {Bot, Keyboard, GrammyError, HttpError, InlineKeyboard} = require('grammy');
const {getRandomQuestion, getAnswer} = require('./utils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx)=> {
    const startKeyboard = new Keyboard()
    .text('HTML')
    .text('CSS')
    .row()
    .text('JavaScript')
    .text('React')
    .row()
    .text('Случайный вопрос')
    .resized();

  await ctx.reply('Привет жружище!');
  await ctx.reply('Выбрать тему',{
    reply_markup: startKeyboard
  });
});


bot.hears(['HTML', 'CSS', 'JavaScript', 'React', 'Случайный вопрос'], async (ctx)=> {
    let topic = ctx.message.text;
    const {question, questionTopic} = getRandomQuestion(topic);
    let keyboard;
    // .text('Отменить', 'cancel')

    if (question.hasOptions) {
        const buttonRows = question.options.map((q) => [
             InlineKeyboard.text(
                q.text,
                JSON.stringify({
                type: `${questionTopic}-option`,
                isCorrect: q.isCorrect,
                questionId: question.id
            }),
            ),
        ]
        );
        keyboard =  InlineKeyboard.from(buttonRows);
    } else {
        keyboard = new InlineKeyboard()
        .text(
            'Узнать ответ', 
            JSON.stringify({
                type: questionTopic,
                questionId: question.id,
        }));
    }
    await ctx.reply(question.text, {
        reply_markup: keyboard
    })
});

bot.on('callback_query:data', async (ctx) => {
    // if ( ctx.callbackQuery.data  === 'cancel') {
    //     await ctx.reply('Отменено');
    //     await ctx.answerCallbackQuery();
    //     return
    // }

    const callbackData = await JSON.parse(ctx.callbackQuery.data);

    if (!callbackData.type.includes('option')) {
        const answer = getAnswer(callbackData.type, callbackData.questionId);
        await ctx.reply(answer, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        })
        await ctx.answerCallbackQuery();
        return
    } 

    if(callbackData.isCorrect) {
        await ctx.reply('Верно ✔️');
        await ctx.answerCallbackQuery();
        return
    } 
    console.log(callbackData)
    const answer = getAnswer(callbackData.type.split('-')[0], callbackData.questionId);
    await ctx.reply(`Неверно ❌, правильный ответ: \n ${answer}`);
    await ctx.answerCallbackQuery();
    return
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

bot.start();