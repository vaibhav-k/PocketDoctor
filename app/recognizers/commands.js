const unrecognized = {
    entities: [],
    intent: null,
    intents: [],
    score: 0
};

const parse = {
    parse: function (context, text) {
        const parts = text.split(':');
        const command = parts[0];
        //Add composite commands
        console.log('Resolved [%s] as [%s] command', text, command);

        const action = this[command] || this[command.slice(1)];
        if (!action) {
            return unrecognized;
        } else {
            return action.call(this, context, ...parts.slice(1));
        }
    },

    diagnoseFullBody: () => ({
        intent: 'diagnoseFullBody',
        score: 1
    }),
    diagnoseSymptoms: () => ({
        intent: 'diagnoseSymptoms',
        score: 1
    }),
    greet: () => ({
        intent: 'greet',
        score: 1
    }),
    fixAppointment: () => ({
        intent: 'fixAppointment',
        score: 1
    }),
    platformFix: () => ({
        intent: 'platformFix',
        score: 1
    })
};


module.exports = {
    recognize: function (context, callback) {
        const text = context.message.text;
        if(text.startsWith('/')||text.startsWith('@')) {
            callback.call(null, null, {
                intent: 'platformFix',
                score: 1
        })
        }
        else if (!text.startsWith('^')) {
            callback.call(null, null, unrecognized);
        } else {
            callback.call(null, null, parse.parse(context, text));
        }
    }
};