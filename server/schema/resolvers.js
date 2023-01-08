const { AuthenticationError } = require('apollo-server-express');
const { User, Pet } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user){
            const userData = await User.findOne({ _id: context.user._id})
            .populate('pets')

            return userData
        }

        throw new AuthenticationError('Not logged in')

        },
        getPets: async () => {
            return Pet.find()
        },
        getPetByID: async (parent, {_id}) => {
            return Pet.findOne({_id})
        },
        getType: async (parent, {petType}) => {
            const params = petType ? {petType} : {};
            return Pet.find(params);
        },
        getUsers: async () => {
            return User.find()
        },
        getUserByID: async (parent, {_id}) => {
            return User.findOne({ _id})
            .populate('pets');
        },
        getUserByName: async(parent, {clientName})=> {
            return User.findOne({clientName})
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            console.log(args);
            try {
                const user = await User.create(args)
                console.log('----------------');
                console.log(user);

                const token = signToken(user);
                console.log('----------------');
                console.log(token);
                return { token, user};

            } catch (err) {
                console.log('something failed');
                console.log(err);
                return err;
            }
        },
        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email });
          

            if(!user){
                throw new AuthenticationError('There are no accounts with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw){
                throw new AuthenticationError('Incorrect password');
            }

            const token = signToken(user)

            return {token, user};
        },
        
        addPet: async (parent, args, context) => {
            if (context.user) {
                const pet = await Pet.create({ ...args, username: context.user.username });
        
                await User.findByIdAndUpdate(
                  { _id: context.user._id },
                  { $push: { pets: pet._id } },
                  { new: true }
                );
        
                return pet;
              }
        
              throw new AuthenticationError('You need to be logged in!');
            }
        
        // addUser: async (parent, args) => {
            
        //     const user = await User.create(args)
        //     const token = signToken(user);

        //     return { token, user};
        // },
        // login: async(parent, { email, password }) => {
        //     const user = await User.findOne({ email });
          

        //     if(!user){
        //         throw new AuthenticationError('There are no accounts with this email address');
        //     }

        //     const correctPw = await user.isCorrectPassword(password);

        //     if(!correctPw){
        //         throw new AuthenticationError('Incorrect password');
        //     }

        //     const token = signToken(user)

        //     return {token, user};
        // }
    }
}

module.exports = resolvers;