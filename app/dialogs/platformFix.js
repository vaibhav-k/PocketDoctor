module.exports = function(bot) {
    bot.dialog('/platformFix', [
        function (session, args, next) {
            session.endDialog()
        }
    ]);
};