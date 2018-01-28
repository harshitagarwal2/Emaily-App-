const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredit = require('../middlewares/requireCredit');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplates');

const Survey = mongoose.model('surveys');

module.exports = (app) => {
  app.get('api/surveys/thanks' , (req,res) =>{
    res.send('thanks for voting');
  });
  app.post('/api/surveys', requireLogin, requireCredit , async (req,res) =>{
    const {title,subject,body,recipients} = req.body;
    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({email})),
      _user: req.user.id,
      dateSent: Date.now(),
    });

    const mailer = new Mailer(survey, surveyTemplate(survey));
try{
    await mailer.send();
    await survey.save();
    req.user.credits -= 1;
    const user = await req.user.save();

    res.send(user);
  }
  catch(err) {
    res.status(422).send(err);
  }
  });
};