module.exports = function(bot) {
    bot.dialog('/thankBack', [
        function (session, args, next) {
            session.send(["Wish you speedy recovery! :)", "Happy to help! :)", "Get well soon! :)"]);
            session.endDialog()
        }
    ]);
};
