
var Mongoose 	= require('mongoose');
var bcrypt      = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;

var UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        lowercase: true,
        maxlength: 255,
        trim: true,
        unique: [true, "Username is already taken, please choose another"],
    },
    firstname: { type: String, required: [true, "First Name is required"], maxlength: 255 },
    lastname: { type: String, required: [true, "Last Name is required"], maxlength: 255 },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password should not be less than 8 characters"],
        maxlength: [64, "Password should not be more than 64 characters"],
    },
    
});

UserSchema.pre('save', function(next) {
    var user = this;


    if (!user.isModified('password')) return next();

    
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

// Create a user model
var userModel = Mongoose.model('user', UserSchema);

module.exports = userModel;